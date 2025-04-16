/**
 * SQL Injection Protection Utilities
 * 
 * This module provides utilities to help prevent SQL injection attacks
 * by sanitizing SQL queries and values when parameterized queries cannot be used.
 */

// List of SQL commands and patterns that could be used in injection attacks
const SQL_INJECTION_PATTERNS = [
  /(\s|^)(DROP|DELETE|UPDATE|INSERT|ALTER|CREATE|TRUNCATE|UNION|SELECT\s+\*)/i,
  /(\s|^)(EXEC|EXECUTE|DECLARE|SET|INTO\s+OUTFILE)/i,
  /--|#|\/\*|\*\//,  // Comment markers
  /;\s*(DROP|DELETE|UPDATE|INSERT|ALTER)/i,  // Command chaining
  /SLEEP\s*\(/i,   // Time-based injection
  /BENCHMARK\s*\(/i,  // Time-based injection
  /INFORMATION_SCHEMA/i,  // Information leakage
  /CONCAT\s*\(/i,  // String concatenation attacks
  /LOAD_FILE\s*\(/i,  // File access
  /@@/,  // System variable
];

// Dangerous characters that may need special handling
const DANGEROUS_CHARS = /['";\\%_]/g;

export const sqlSanitizer = {
  /**
   * Sanitizes a raw SQL query to prevent injection
   * Use this only for non-parameterized queries - parameterized queries are always safer
   */
  sanitize(sql: string): string {
    // Check for dangerous patterns
    SQL_INJECTION_PATTERNS.forEach(pattern => {
      if (pattern.test(sql)) {
        console.warn(`Potentially unsafe SQL pattern detected: ${pattern.toString()}`);
        // In production, you might want to throw an error here instead of just logging
      }
    });
    
    // Return the SQL - the actual protection should be done with parameterized queries
    // This is mainly for logging/detection of potential issues
    return sql;
  },
  
  /**
   * Sanitizes a value to be used in SQL
   * This provides an extra layer of protection even when using parameterized queries
   */
  sanitizeValue(value: string): string {
    if (typeof value !== 'string') return value;
    
    // Replace dangerous characters
    return value.replace(DANGEROUS_CHARS, char => {
      return '\\' + char;
    });
  },
  
  /**
   * Validates an identifier (table name, column name) to prevent injection
   * Use this for dynamic table/column names that can't be parameterized
   */
  validateIdentifier(identifier: string): boolean {
    // Only allow alphanumeric and underscores for identifiers
    return /^[a-zA-Z0-9_]+$/.test(identifier);
  },
  
  /**
   * Sanitizes a SQL identifier (table name, column name)
   */
  sanitizeIdentifier(identifier: string): string {
    if (!this.validateIdentifier(identifier)) {
      throw new Error(`Invalid SQL identifier: ${identifier}`);
    }
    return identifier;
  },
  
  /**
   * Safely construct a LIMIT clause with numeric validation
   */
  safeLimit(limit: any, offset?: any): string {
    // Ensure numeric values only
    const safeLimit = Number.isInteger(Number(limit)) ? Number(limit) : 10;
    
    if (offset !== undefined) {
      const safeOffset = Number.isInteger(Number(offset)) ? Number(offset) : 0;
      return `LIMIT ${safeLimit} OFFSET ${safeOffset}`;
    }
    
    return `LIMIT ${safeLimit}`;
  }
};

/**
 * Rate limiting for database queries - can be used to prevent DoS attacks
 */
class QueryRateLimiter {
  private windowMs: number;
  private maxQueries: number;
  private clients: Map<string, { count: number, resetTime: number }>;
  
  constructor(windowMs = 60000, maxQueries = 100) {
    this.windowMs = windowMs;
    this.maxQueries = maxQueries;
    this.clients = new Map();
  }
  
  /**
   * Check if a client can make another query
   * @param clientId IP address or user ID
   * @returns true if allowed, false if rate limited
   */
  checkLimit(clientId: string): boolean {
    const now = Date.now();
    const clientData = this.clients.get(clientId);
    
    // If no record exists or window has expired, create new record
    if (!clientData || now > clientData.resetTime) {
      this.clients.set(clientId, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return true;
    }
    
    // If under limit, increment and allow
    if (clientData.count < this.maxQueries) {
      clientData.count++;
      return true;
    }
    
    // Rate limit exceeded
    return false;
  }
  
  /**
   * Reset limits for all clients
   */
  resetAll(): void {
    this.clients.clear();
  }
}

// Export an instance for direct use
export const queryRateLimiter = new QueryRateLimiter();

/**
 * Security audit logger for tracking sensitive database operations
 */
export const securityAuditLogger = {
  /**
   * Log a security relevant database event
   */
  logDbEvent(event: {
    userId?: string;
    action: string;
    success: boolean;
    details?: string;
    ip?: string;
  }): void {
    // In a real application, you would log this to a secure storage
    console.log(`SECURITY_AUDIT: ${JSON.stringify({
      timestamp: new Date().toISOString(),
      ...event
    })}`);
    
    // Here you could also store these events in your database
    // or send them to a SIEM system
  }
}; 