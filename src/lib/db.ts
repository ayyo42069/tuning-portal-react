import mysql from 'mysql2/promise';

// Database connection configuration
const dbConfig = {
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT),
  database: process.env.MYSQL_DATABASE,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Create a connection pool
const pool = mysql.createPool(dbConfig);

// Function to execute SQL queries with prepared statements
export async function executeQuery<T>(query: string, params: any[] = []): Promise<T> {
  try {
    const [results] = await pool.execute(query, params);
    return results as T;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Function to execute transaction commands (which don't support prepared statements)
export async function executeTransaction(query: string): Promise<any> {
  const connection = await pool.getConnection();
  try {
    const [results] = await connection.query(query);
    return results;
  } catch (error) {
    console.error('Transaction command error:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// Function to get a single row
export async function getRow<T>(query: string, params: any[] = []): Promise<T | null> {
  const results = await executeQuery<T[]>(query, params);
  return results && results.length > 0 ? results[0] : null;
}

// Test database connection
export async function testConnection(): Promise<boolean> {
  try {
    const connection = await pool.getConnection();
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}

export default pool;