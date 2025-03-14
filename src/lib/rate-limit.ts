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

// In-memory storage for rate limiting
const rateLimitStore: Record<string, {
  count: number;
  resetTime: Date;
}> = {};

// Clean up expired rate limit entries every 5 minutes
setInterval(() => {
  const now = new Date();
  for (const key in rateLimitStore) {
    if (rateLimitStore[key].resetTime < now) {
      delete rateLimitStore[key];
    }
  }
}, 5 * 60 * 1000);

/**
 * Creates a database table for rate limiting if it doesn't exist
 */
export async function initRateLimitTable() {
  try {
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS rate_limits (
        id INT AUTO_INCREMENT PRIMARY KEY,
        key_identifier VARCHAR(255) NOT NULL,
        count INT NOT NULL DEFAULT 1,
        reset_time TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_key_identifier (key_identifier),
        INDEX idx_reset_time (reset_time)
      )
    `);
    console.log('Rate limit table initialized');
  } catch (error) {
    console.error('Failed to initialize rate limit table:', error);
  }
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
  // Check if this key exists and if the reset time has passed
  if (!rateLimitStore[uniqueKey] || rateLimitStore[uniqueKey].resetTime < now) {
    // Create new entry or reset existing one
    const resetTime = new Date(now.getTime() + windowMs);
    rateLimitStore[uniqueKey] = {
      count: 1,
      resetTime
    };
    
    return {
      success: true,
      limit,
      remaining: limit - 1,
      resetTime,
      msBeforeNext: 0
    };
  }
  
  // Entry exists and is still valid
  const entry = rateLimitStore[uniqueKey];
  const remaining = limit - entry.count;
  
  // Check if limit is exceeded
  if (remaining <= 0) {
    const msBeforeNext = entry.resetTime.getTime() - now.getTime();
    return {
      success: false,
      limit,
      remaining: 0,
      resetTime: entry.resetTime,
      msBeforeNext
    };
  }
  
  // Increment count and return success
  entry.count++;
  return {
    success: true,
    limit,
    remaining: remaining - 1,
    resetTime: entry.resetTime,
    msBeforeNext: 0
  };
}

/**
 * Database-backed rate limiting implementation
 */
async function databaseRateLimit(
  uniqueKey: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  try {
    // Get current entry if it exists
    const entry = await executeQuery<any[]>(
      'SELECT id, count, reset_time FROM rate_limits WHERE key_identifier = ? AND reset_time > NOW()',
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
    
    return {
      success: true,
      limit,
      remaining: remaining - 1,
      resetTime: entryResetTime,
      msBeforeNext: 0
    };
  } catch (error) {
    console.error('Database rate limit error:', error);
    // Fallback to allowing the request in case of database errors
    return {
      success: true,
      limit,
      remaining: 1,
      resetTime: new Date(Date.now() + windowMs),
      msBeforeNext: 0
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
 * Rate limit by both IP and a secondary identifier (like email)
 * This provides dual-layer protection against abuse
 */
export async function rateLimitByIpAndIdentifier(
  req: Request,
  identifier: string,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  // First check IP-based rate limit
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const ipResult = await rateLimit(ip, {
    ...options,
    identifier: `${options.identifier || 'default'}-ip`
  });
  
  // If IP limit is exceeded, return that result
  if (!ipResult.success) {
    return ipResult;
  }
  
  // Then check identifier-based rate limit
  return await rateLimit(identifier, {
    ...options,
    identifier: `${options.identifier || 'default'}-identifier`
  });
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
    // Create rate limit logs table if it doesn't exist
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS rate_limit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        key_identifier VARCHAR(255) NOT NULL,
        event_type VARCHAR(50) NOT NULL,
        success BOOLEAN NOT NULL,
        remaining INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_key_identifier (key_identifier),
        INDEX idx_created_at (created_at)
      )
    `);
    
    // Log the event
    await executeQuery(
      'INSERT INTO rate_limit_logs (key_identifier, event_type, success, remaining) VALUES (?, ?, ?, ?)',
      [`${key}:${identifier}`, identifier, success ? 1 : 0, remaining]
    );
  } catch (error) {
    console.error('Failed to log rate limit event:', error);
  }
}