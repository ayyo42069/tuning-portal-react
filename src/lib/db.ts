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
  acquireTimeout: 10000, // 10 seconds timeout for acquiring connection
  namedPlaceholders: true, // More efficient parameter binding
  enableKeepAlive: true, // Keep connections alive.
  keepAliveInitialDelay: 10000, // 10 seconds initial delay
};

// Create a connection pool
const pool = mysql.createPool(dbConfig);

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
  params: any[] = [],
  options: { cache?: boolean; cacheTTL?: number } = {}
): Promise<T> {
  const startTime = getPerformanceNow();
  const cacheKey = options.cache ? `${query}-${JSON.stringify(params)}` : "";

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
      console.log(`Query params:`, params);
    }

    const [results] = await connection.execute(query, params);

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
      console.error(`Query params:`, params);
    }
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

// Function to execute transaction commands with retry logic
export async function executeTransaction<T>(
  queries: string[] | string,
  params: any[][] | any[] = [],
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
        [results] = await connection.query(queries, params);
      } else {
        results = [];
        for (let i = 0; i < queries.length; i++) {
          const [result] = await connection.execute(
            queries[i],
            params[i] || []
          );
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
  params: any[] = [],
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
