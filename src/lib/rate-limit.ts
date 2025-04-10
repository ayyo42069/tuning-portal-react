import { executeQuery } from './db';

interface RateLimitOptions {
  // Maximum number of requests allowed within the window
  limit: number;
  // Time window in seconds
  windowMs: number;
  // Optional identifier for different rate limit types
  identifier?: string;
  // Whether to store rate limit data in database (more persistent but slower)
  // If false, uses in-memory storage (faster but resets on server restart)
  useDatabase?: boolean;
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: Date;
  msBeforeNext: number;
}

// In-memory rate limit storage
const memoryStore = new Map<string, { count: number; resetTime: Date }>();

/**
 * Rate limit by IP address and identifier
 * @param request The Next.js request object
 * @param identifier Additional identifier for the rate limit
 * @param options Rate limit options
 * @returns Rate limit result
 */
export async function rateLimitByIpAndIdentifier(
  request: Request,
  identifier: string,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const key = `${ip}:${identifier}`;
  return rateLimit(key, options);
}

/**
 * Rate limit by user ID and identifier
 * @param userId The user ID
 * @param identifier Additional identifier for the rate limit
 * @param options Rate limit options
 * @returns Rate limit result
 */
export async function rateLimitByUserId(
  userId: number,
  identifier: string,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const key = `${userId}:${identifier}`;
  return rateLimit(key, options);
}

/**
 * Checks if a request exceeds rate limits
 * @param key Unique identifier for the rate limit (e.g., IP address, user ID, etc.)
 * @param options Rate limit options
 * @returns Rate limit result with success status and remaining requests
 */
export async function rateLimit(
  key: string,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const { limit, windowMs, identifier = 'default', useDatabase = false } = options;
  
  // Create a unique key that includes the identifier
  const uniqueKey = `${key}:${identifier}`;
  const now = new Date();
  
  if (useDatabase) {
    return await databaseRateLimit(uniqueKey, limit, windowMs);
  } else {
    return memoryRateLimit(uniqueKey, limit, windowMs, now);
  }
}

/**
 * In-memory rate limiting implementation
 */
function memoryRateLimit(
  uniqueKey: string,
  limit: number,
  windowMs: number,
  now: Date
): RateLimitResult {
  const entry = memoryStore.get(uniqueKey);
  const resetTime = new Date(now.getTime() + windowMs);

  if (!entry || entry.resetTime < now) {
    // No entry or expired entry, create new one
    memoryStore.set(uniqueKey, { count: 1, resetTime });
    return {
      success: true,
      limit,
      remaining: limit - 1,
      resetTime,
      msBeforeNext: 0
    };
  }

  // Entry exists and is valid
  if (entry.count >= limit) {
    const msBeforeNext = entry.resetTime.getTime() - now.getTime();
    return {
      success: false,
      limit,
      remaining: 0,
      resetTime: entry.resetTime,
      msBeforeNext
    };
  }

  // Increment count
  entry.count++;
  return {
    success: true,
    limit,
    remaining: limit - entry.count,
    resetTime: entry.resetTime,
    msBeforeNext: 0
  };
}

/**
 * Database-backed rate limiting implementation with proper transaction handling
 */
async function databaseRateLimit(
  uniqueKey: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  try {
    // Start a transaction to handle race conditions
    await executeQuery('START TRANSACTION');

    try {
      // Get current entry if it exists
      const entry = await executeQuery<any[]>(
        'SELECT id, count, reset_time FROM rate_limits WHERE key_identifier = ? AND reset_time > NOW() FOR UPDATE',
        [uniqueKey]
      );
      
      const now = new Date();
      const resetTime = new Date(now.getTime() + windowMs);
      
      // No valid entry found, create a new one
      if (!entry || entry.length === 0) {
        await executeQuery(
          'INSERT INTO rate_limits (key_identifier, count, reset_time) VALUES (?, ?, ?)',
          [uniqueKey, 1, resetTime]
        );
        
        await executeQuery('COMMIT');
        
        return {
          success: true,
          limit,
          remaining: limit - 1,
          resetTime,
          msBeforeNext: 0
        };
      }
      
      // Entry exists, check if limit is exceeded
      const currentEntry = entry[0];
      const currentCount = currentEntry.count;
      const entryResetTime = new Date(currentEntry.reset_time);
      const remaining = limit - currentCount;
      
      if (remaining <= 0) {
        const msBeforeNext = entryResetTime.getTime() - now.getTime();
        await executeQuery('COMMIT');
        
        return {
          success: false,
          limit,
          remaining: 0,
          resetTime: entryResetTime,
          msBeforeNext
        };
      }
      
      // Increment count
      await executeQuery(
        'UPDATE rate_limits SET count = count + 1 WHERE id = ?',
        [currentEntry.id]
      );
      
      await executeQuery('COMMIT');
      
      return {
        success: true,
        limit,
        remaining: remaining - 1,
        resetTime: entryResetTime,
        msBeforeNext: 0
      };
    } catch (error) {
      // Rollback transaction on error
      await executeQuery('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Database rate limit error:', error);
    // On database error, fall back to a more restrictive rate limit
    return {
      success: false,
      limit,
      remaining: 0,
      resetTime: new Date(Date.now() + windowMs),
      msBeforeNext: windowMs
    };
  }
}

/**
 * Middleware function for Next.js API routes to apply rate limiting
 * @param req Next.js request object
 * @param options Rate limit options
 * @returns Rate limit result
 */
export async function rateLimitMiddleware(
  req: Request,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  // Get IP address from request
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  
  // Use IP as the rate limit key
  return await rateLimit(ip, options);
}

/**
 * Logs rate limit events for monitoring and analysis
 */
export async function logRateLimitEvent(
  key: string,
  identifier: string,
  success: boolean,
  remaining: number
): Promise<void> {
  try {
    await executeQuery(
      'INSERT INTO rate_limit_logs (key_identifier, event_type, success, remaining) VALUES (?, ?, ?, ?)',
      [`${key}:${identifier}`, identifier, success ? 1 : 0, remaining]
    );
  } catch (error) {
    console.error('Failed to log rate limit event:', error);
  }
}