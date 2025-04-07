import { executeQuery, executeTransaction } from "./db";
import { NextRequest } from "next/server";

// Define security event types
export enum SecurityEventType {
  // Authentication events
  LOGIN_SUCCESS = "login_success",
  LOGIN_FAILURE = "login_failure",
  LOGOUT = "logout",
  REGISTRATION = "registration",
  EMAIL_VERIFICATION = "email_verification",
  PASSWORD_RESET_REQUEST = "password_reset_request",
  PASSWORD_RESET_COMPLETE = "password_reset_complete",
  PASSWORD_CHANGE = "password_change",

  // Account management events
  ACCOUNT_LOCKOUT = "account_lockout",
  ACCOUNT_UNLOCK = "account_unlock",
  ACCOUNT_UPDATE = "account_update",

  // Session events
  SESSION_CREATED = "session_created",
  SESSION_EXPIRED = "session_expired",
  SESSION_INVALIDATED = "session_invalidated",

  // Admin actions
  ADMIN_USER_UPDATE = "admin_user_update",
  ADMIN_PERMISSION_CHANGE = "admin_permission_change",
  ADMIN_SYSTEM_SETTING_CHANGE = "admin_system_setting_change",

  // API access events
  API_ACCESS = "api_access",
  SENSITIVE_DATA_ACCESS = "sensitive_data_access",

  // Suspicious activities
  SUSPICIOUS_ACTIVITY = "suspicious_activity",
  GEOGRAPHIC_ANOMALY = "geographic_anomaly",
  MULTIPLE_FAILED_ATTEMPTS = "multiple_failed_attempts",
}

// Define security event severity levels
export enum SecurityEventSeverity {
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
  CRITICAL = "critical",
}

// Define security event interface
export interface SecurityEvent {
  user_id?: number;
  event_type: SecurityEventType;
  severity: SecurityEventSeverity;
  ip_address: string;
  user_agent: string;
  details?: any;
  created_at?: Date;
}

// Define security log interface for retrieving logs
export interface SecurityLog extends SecurityEvent {
  id: number;
  username?: string;
  email?: string;
  created_at: Date;
}

// Define interface for security log query options
export interface SecurityLogQueryOptions {
  userId?: number;
  eventType?: SecurityEventType;
  severity?: SecurityEventSeverity;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

// Define interface for security log statistics
export interface SecurityLogStats {
  totalEvents: number;
  eventsByType: Record<string, number>;
  eventsBySeverity: Record<string, number>;
  recentFailedLogins: number;
  recentSuspiciousActivities: number;
}

/**
 * Initialize security logging tables if they don't exist
 */
export async function initSecurityLoggingTables() {
  try {
    // Create security events table if it doesn't exist
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS security_events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        event_type VARCHAR(50) NOT NULL,
        severity VARCHAR(20) NOT NULL,
        ip_address VARCHAR(45) NOT NULL,
        user_agent VARCHAR(255) NOT NULL,
        details JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_security_events_user (user_id),
        INDEX idx_security_events_type (event_type),
        INDEX idx_security_events_severity (severity),
        INDEX idx_security_events_created (created_at)
      )
    `);

    // Create security alerts table for tracking unresolved security issues
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS security_alerts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_id INT NOT NULL,
        user_id INT,
        alert_type VARCHAR(50) NOT NULL,
        severity VARCHAR(20) NOT NULL,
        message TEXT NOT NULL,
        is_resolved BOOLEAN DEFAULT FALSE,
        resolved_by INT,
        resolution_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP NULL,
        FOREIGN KEY (event_id) REFERENCES security_events(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_security_alerts_user (user_id),
        INDEX idx_security_alerts_type (alert_type),
        INDEX idx_security_alerts_resolved (is_resolved)
      )
    `);

    // Create geographic access table for tracking user access locations
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS user_access_locations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        ip_address VARCHAR(45) NOT NULL,
        country VARCHAR(100),
        region VARCHAR(100),
        city VARCHAR(100),
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        is_first_access BOOLEAN DEFAULT FALSE,
        is_suspicious BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_access_locations_user (user_id),
        INDEX idx_user_access_locations_ip (ip_address)
      )
    `);

    // Add scheduled event to clean up old security events
    await executeQuery(`
      CREATE EVENT IF NOT EXISTS cleanup_security_events
      ON SCHEDULE EVERY 1 DAY
      DO
      BEGIN
        -- Keep security events for 1 year
        DELETE FROM security_events WHERE created_at < NOW() - INTERVAL 1 YEAR;
        
        -- Keep resolved alerts for 6 months
        DELETE FROM security_alerts WHERE is_resolved = TRUE AND resolved_at < NOW() - INTERVAL 6 MONTH;
      END
    `);

    console.log("Security logging tables initialized");
  } catch (error) {
    console.error("Failed to initialize security logging tables:", error);
  }
}

/**
 * Log a security event
 * @param event The security event to log
 * @returns The ID of the logged event
 */
export async function logSecurityEvent(event: SecurityEvent): Promise<number> {
  try {
    // Sanitize event details to prevent log injection
    const sanitizedDetails = event.details
      ? sanitizeLogData(event.details)
      : null;

    // Insert the security event
    const result = await executeQuery<any>(
      `INSERT INTO security_events 
       (user_id, event_type, severity, ip_address, user_agent, details) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        event.user_id || null,
        event.event_type,
        event.severity,
        event.ip_address,
        event.user_agent,
        sanitizedDetails ? JSON.stringify(sanitizedDetails) : null,
      ]
    );

    // Return the inserted event ID
    return result.insertId;
  } catch (error) {
    console.error("Failed to log security event:", error);
    return 0;
  }
}

/**
 * Create a security alert from an event
 * @param eventId The ID of the security event
 * @param alertType The type of alert
 * @param severity The severity of the alert
 * @param message The alert message
 * @param userId The user ID associated with the alert
 * @returns The ID of the created alert
 */
export async function createSecurityAlert(
  eventId: number,
  alertType: string,
  severity: SecurityEventSeverity,
  message: string,
  userId?: number
): Promise<number> {
  try {
    const result = await executeQuery<any>(
      `INSERT INTO security_alerts 
       (event_id, user_id, alert_type, severity, message) 
       VALUES (?, ?, ?, ?, ?)`,
      [eventId, userId || null, alertType, severity, message]
    );

    return result.insertId;
  } catch (error) {
    console.error("Failed to create security alert:", error);
    return 0;
  }
}

/**
 * Resolve a security alert
 * @param alertId The ID of the alert to resolve
 * @param resolvedBy The ID of the user who resolved the alert
 * @param notes Resolution notes
 * @returns Whether the operation was successful
 */
export async function resolveSecurityAlert(
  alertId: number,
  resolvedBy: number,
  notes: string
): Promise<boolean> {
  try {
    await executeQuery(
      `UPDATE security_alerts 
       SET is_resolved = TRUE, 
           resolved_by = ?, 
           resolution_notes = ?, 
           resolved_at = NOW() 
       WHERE id = ?`,
      [resolvedBy, notes, alertId]
    );

    return true;
  } catch (error) {
    console.error("Failed to resolve security alert:", error);
    return false;
  }
}

/**
 * Get security logs with filtering options
 * @param options Query options for filtering logs
 * @returns Object containing logs array and total count
 */
export async function getSecurityLogs(
  options: SecurityLogQueryOptions = {}
): Promise<{ logs: SecurityLog[]; total: number }> {
  try {
    // Base WHERE clause for both count and data queries
    let whereClause = "WHERE 1=1";
    const params: any[] = [];
    const countParams: any[] = [];

    // Apply filters
    if (options.userId) {
      whereClause += " AND se.user_id = ?";
      params.push(options.userId);
      countParams.push(options.userId);
    }

    if (options.eventType) {
      whereClause += " AND se.event_type = ?";
      params.push(options.eventType);
      countParams.push(options.eventType);
    }

    if (options.severity) {
      whereClause += " AND se.severity = ?";
      params.push(options.severity);
      countParams.push(options.severity);
    }

    if (options.startDate) {
      whereClause += " AND se.created_at >= ?";
      params.push(options.startDate);
      countParams.push(options.startDate);
    }

    if (options.endDate) {
      whereClause += " AND se.created_at <= ?";
      params.push(options.endDate);
      countParams.push(options.endDate);
    }

    // Get total count first
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM security_events se 
      LEFT JOIN users u ON se.user_id = u.id 
      ${whereClause}
    `;
    
    const [countResult] = await executeQuery<any[]>(countQuery, countParams);
    const total = countResult?.total || 0;

    // If total is 0, return early
    if (total === 0) {
      return { logs: [], total: 0 };
    }

    // Get the actual data
    let dataQuery = `
      SELECT se.*, u.username, u.email 
      FROM security_events se 
      LEFT JOIN users u ON se.user_id = u.id 
      ${whereClause}
    `;

    // Order by most recent first
    dataQuery += " ORDER BY se.created_at DESC";

    // Apply limit and offset
    if (options.limit) {
      dataQuery += " LIMIT ?";
      params.push(options.limit);

      if (options.offset) {
        dataQuery += " OFFSET ?";
        params.push(options.offset);
      }
    }

    const logs = await executeQuery<SecurityLog[]>(dataQuery, params);
    return { logs, total };
  } catch (error) {
    console.error("Failed to get security logs:", error);
    return { logs: [], total: 0 };
  }
}

/**
 * Get unresolved security alerts
 * @param limit Maximum number of alerts to return
 * @returns Array of unresolved security alerts
 */
export async function getUnresolvedAlerts(limit: number = 100): Promise<any[]> {
  try {
    return await executeQuery(
      `SELECT sa.*, se.event_type, se.ip_address, u.username, u.email 
       FROM security_alerts sa 
       JOIN security_events se ON sa.event_id = se.id 
       LEFT JOIN users u ON sa.user_id = u.id 
       WHERE sa.is_resolved = FALSE 
       ORDER BY sa.severity DESC, sa.created_at DESC 
       LIMIT ?`,
      [limit]
    );
  } catch (error) {
    console.error("Failed to get unresolved alerts:", error);
    return [];
  }
}

/**
 * Get security log statistics
 * @param days Number of days to include in statistics
 * @returns Security log statistics
 */
/**
 * Sanitize log data to prevent log injection
 * @param data The data to sanitize
 * @returns Sanitized data
 */
export function sanitizeLogData(data: any): any {
  if (!data) return null;

  // If data is a string, sanitize it
  if (typeof data === "string") {
    // Remove potentially dangerous characters
    return data.replace(/[\n\r\u2028\u2029<>]/g, "");
  }

  // If data is an array, sanitize each element
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeLogData(item));
  }

  // If data is an object, sanitize each property
  if (typeof data === "object") {
    const sanitized: Record<string, any> = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        sanitized[key] = sanitizeLogData(data[key]);
      }
    }
    return sanitized;
  }

  // Return primitive values as is
  return data;
}

export async function getSecurityLogStats(
  days: number = 30
): Promise<SecurityLogStats> {
  try {
    // Get total events in the period
    const [totalResult] = await executeQuery<any[]>(
      "SELECT COUNT(*) as total FROM security_events WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)",
      [days]
    );

    // Get events by type
    const eventsByType = await executeQuery<any[]>(
      "SELECT event_type, COUNT(*) as count FROM security_events WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) GROUP BY event_type",
      [days]
    );

    // Get events by severity
    const eventsBySeverity = await executeQuery<any[]>(
      "SELECT severity, COUNT(*) as count FROM security_events WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) GROUP BY severity",
      [days]
    );

    // Get recent failed logins (last 24 hours)
    const [failedLoginsResult] = await executeQuery<any[]>(
      "SELECT COUNT(*) as count FROM security_events WHERE event_type = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)",
      [SecurityEventType.LOGIN_FAILURE]
    );

    // Get recent suspicious activities (last 24 hours)
    const [suspiciousActivitiesResult] = await executeQuery<any[]>(
      "SELECT COUNT(*) as count FROM security_events WHERE severity IN (?, ?) AND created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)",
      [SecurityEventSeverity.ERROR, SecurityEventSeverity.CRITICAL]
    );

    // Format the results
    const eventsByTypeMap: Record<string, number> = {};
    eventsByType.forEach((item) => {
      eventsByTypeMap[item.event_type] = item.count;
    });

    const eventsBySeverityMap: Record<string, number> = {};
    eventsBySeverity.forEach((item) => {
      eventsBySeverityMap[item.severity] = item.count;
    });

    return {
      totalEvents: totalResult.total || 0,
      eventsByType: eventsByTypeMap,
      eventsBySeverity: eventsBySeverityMap,
      recentFailedLogins: failedLoginsResult.count || 0,
      recentSuspiciousActivities: suspiciousActivitiesResult.count || 0,
    };
  } catch (error) {
    console.error("Failed to get security log stats:", error);
    return {
      totalEvents: 0,
      eventsByType: {},
      eventsBySeverity: {},
      recentFailedLogins: 0,
      recentSuspiciousActivities: 0,
    };
  }
}
