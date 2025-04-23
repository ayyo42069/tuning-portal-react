import mysql from "mysql2/promise";

// Enhanced database connection configuration
const dbConfig = {
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT),
  database: process.env.MYSQL_DATABASE,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  waitForConnections: true,
  connectionLimit: 25, // Increased from 10 for better concurrency
  queueLimit: 0,
  connectTimeout: 10000, // 10 seconds timeout
  namedPlaceholders: false, // Use positional placeholders (?) instead of named ones
  enableKeepAlive: true, // Keep connections alive.
  keepAliveInitialDelay: 10000, // 10 seconds initial delay
  // Add these options to handle transactions properly
  multipleStatements: true,
  typeCast: true,
  dateStrings: true,
  // Disable prepared statements for transaction commands
  prepare: false
};

// Create a connection pool
const pool = mysql.createPool(dbConfig);

// Export the pool as db for direct use in API routes
export const db = {
  query: async (sql: string, params: any[] = []) => {
    return executeQuery(sql, params);
  },
};

// Query cache for frequently executed queries
const queryCache = new Map<string, { result: any; timestamp: number }>();
const CACHE_TTL = 60000; // 1 minute cache TTL

const getPerformanceNow = () => {
  if (typeof window !== "undefined") {
    return window.performance.now();
  }
  return performance.now();
};

// Function to execute SQL queries with prepared statements and caching
export async function executeQuery<T>(
  query: string,
  params: any[] | undefined = [],
  options: { cache?: boolean; cacheTTL?: number } = {}
): Promise<T> {
  // Ensure params is always a valid array
  const validParams = Array.isArray(params) ? params : [];
  const startTime = getPerformanceNow();
  const cacheKey = options.cache ? `${query}-${JSON.stringify(validParams)}` : "";

  // Check cache if caching is enabled
  if (options.cache && queryCache.has(cacheKey)) {
    const cached = queryCache.get(cacheKey)!;
    if (Date.now() - cached.timestamp < (options.cacheTTL || CACHE_TTL)) {
      console.log(`Cache hit for query: ${query.substring(0, 50)}...`);
      return cached.result as T;
    }
    // Cache expired, remove it
    queryCache.delete(cacheKey);
  }

  let connection;
  try {
    connection = await pool.getConnection();

    // Log security-related queries for debugging
    if (query.includes("security_events")) {
      console.log(`Executing security query: ${query.substring(0, 100)}...`);
      console.log(`Query params:`, validParams);
    }

    // Process parameters to ensure proper types for MySQL
    const processedParams = validParams.map(param => {
      // Convert string numbers to actual numbers for numeric parameters
      if (typeof param === 'string' && !isNaN(Number(param)) && param.trim() !== '') {
        return Number(param);
      }
      return param;
    });

    // Log the processed parameters for debugging
    console.log(`Processed parameters:`, processedParams);
    
    // Execute the query with parameters
    const [results] = await connection.query(query, processedParams);

    // Enhanced logging for security queries
    if (query.includes("security_events")) {
      const resultCount = Array.isArray(results) ? results.length : "unknown";
      console.log(`Security query returned ${resultCount} results`);

      // If it's a COUNT query, log the actual count
      if (
        query.includes("COUNT(*)") &&
        Array.isArray(results) &&
        results.length > 0
      ) {
        console.log(`Count result:`, results[0]);
      }

      // Debug log the actual results for security queries
      if (Array.isArray(results)) {
        console.log(
          `Security query results sample:`,
          results.length > 0
            ? JSON.stringify(results[0]).substring(0, 200) + "..."
            : "empty array"
        );
      } else {
        console.log(`Security query results (non-array):`, typeof results);
      }
    }

    // Store in cache if caching is enabled
    if (options.cache) {
      queryCache.set(cacheKey, { result: results, timestamp: Date.now() });
    }

    const duration = getPerformanceNow() - startTime;
    if (duration > 500) {
      // Log slow queries (>500ms)
      console.warn(
        `Slow query (${duration.toFixed(2)}ms): ${query.substring(0, 100)}...`
      );
    }

    return results as T;
  } catch (error) {
    console.error("Database query error:", error);
    if (query.includes("security_events")) {
      console.error(`Failed security query: ${query.substring(0, 100)}...`);
      console.error(`Query params:`, validParams);
    }
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

// Function to execute transaction commands with retry logic
export async function executeTransaction<T>(
  queries: string[] | string,
  params: any[][] | any[] | undefined = [],
  maxRetries = 3
): Promise<T> {
  let connection;
  let retries = 0;

  const startTime = getPerformanceNow();

  while (retries <= maxRetries) {
    try {
      connection = await pool.getConnection();
      await connection.beginTransaction();

      let results;

      // Handle single query or multiple queries
      if (typeof queries === "string") {
        // Ensure params is always an array, even if empty or undefined
        const validParams = Array.isArray(params) ? params : [];
        [results] = await connection.execute(queries, validParams);
      } else {
        results = [];
        for (let i = 0; i < queries.length; i++) {
          // Ensure params[i] is always a valid array
          const paramsForQuery = Array.isArray(params) && i < params.length ? params[i] : [];
          const validParams = Array.isArray(paramsForQuery) ? paramsForQuery : [];
          const [result] = await connection.execute(queries[i], validParams);
          results.push(result);
        }
      }

      await connection.commit();

      const duration = getPerformanceNow() - startTime;
      if (duration > 1000) {
        // Log slow transactions (>1s)
        console.warn(`Slow transaction (${duration.toFixed(2)}ms)`);
      }

      return results as T;
    } catch (error: any) {
      if (connection) {
        await connection.rollback();
      }

      // Retry on deadlock or lock wait timeout
      if (
        (error.code === "ER_LOCK_DEADLOCK" ||
          error.code === "ER_LOCK_WAIT_TIMEOUT") &&
        retries < maxRetries
      ) {
        retries++;
        const delay = Math.pow(2, retries) * 100; // Exponential backoff
        console.warn(
          `Transaction retry ${retries}/${maxRetries} after ${delay}ms due to ${error.code}`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        console.error("Transaction error:", error);
        throw error;
      }
    } finally {
      if (connection) connection.release();
    }
  }

  throw new Error(`Transaction failed after ${maxRetries} retries`);
}

// Function to get a single row with optional caching
export async function getRow<T>(
  query: string,
  params: any[] | undefined = [],
  options: { cache?: boolean; cacheTTL?: number } = {}
): Promise<T | null> {
  const results = await executeQuery<T[]>(query, params, options);
  return results && results.length > 0 ? results[0] : null;
}

// Test database connection with timeout
export async function testConnection(timeout = 5000): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    const timer = setTimeout(() => {
      console.error("Database connection timeout");
      resolve(false);
    }, timeout);

    pool
      .getConnection()
      .then((connection) => {
        clearTimeout(timer);
        connection.release();
        resolve(true);
      })
      .catch((error) => {
        clearTimeout(timer);
        console.error("Database connection error:", error);
        resolve(false);
      });
  });
}

// Clear query cache
export function clearQueryCache(): void {
  queryCache.clear();
  console.log("Query cache cleared");
}

// Get connection pool stats
export function getPoolStats() {
  return {
    connectionLimit: pool.config.connectionLimit,
    // mysql2 doesn't provide direct access to active/idle connections
    // return basic pool configuration instead
    queueLimit: pool.config.queueLimit,
    waitForConnections: pool.config.waitForConnections,
  };
}

export async function withTransaction<T>(
  callback: (connection: mysql.Connection) => Promise<T>
): Promise<T> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export default pool;
