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
  PASSWORD_RESET_REQUESTED = "password_reset_requested",
  PASSWORD_RESET_COMPLETED = "password_reset_completed",
  PASSWORD_CHANGE = "password_change",

  // Account management events
  ACCOUNT_LOCKOUT = "account_lockout",
  ACCOUNT_UNLOCK = "account_unlock",
  ACCOUNT_UPDATE = "account_update",

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
  id?: number;
  userId?: number;
  eventType: SecurityEventType;
  severity: SecurityEventSeverity;
  ipAddress: string;
  userAgent: string;
  details?: Record<string, any>;
  createdAt?: Date;
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
  recentApiAccess: number;
}

// Define security alert interface
export interface SecurityAlert {
  id?: number;
  eventId: number;
  userId?: number;
  alertType: string;
  severity: SecurityEventSeverity;
  message: string;
  isResolved: boolean;
  resolvedBy?: number;
  resolutionNotes?: string;
  createdAt?: Date;
  resolvedAt?: Date;
}

// Define security stats interface
export interface SecurityStats {
  totalEvents: number;
  eventsByType: Record<SecurityEventType, number>;
  eventsBySeverity: Record<SecurityEventSeverity, number>;
  recentAlerts: number;
  unresolvedAlerts: number;
}

interface QueryResult {
  insertId: number;
  [key: string]: any;
}

interface CountResult {
  total: number;
}

interface EventTypeCount {
  event_type: SecurityEventType;
  count: number;
}

interface SeverityCount {
  severity: SecurityEventSeverity;
  count: number;
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
    const result = await executeQuery<QueryResult>(
      `INSERT INTO security_events (user_id, event_type, severity, ip_address, user_agent, details)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        event.userId,
        event.eventType,
        event.severity,
        event.ipAddress,
        event.userAgent,
        event.details ? JSON.stringify(event.details) : null,
      ]
    );

    return result.insertId;
  } catch (error) {
    console.error("Failed to log security event:", error);
    throw error;
  }
}

/**
 * Create a security alert
 * @param alert The security alert to create
 * @returns The ID of the created alert
 */
export async function createSecurityAlert(alert: SecurityAlert): Promise<number> {
  try {
    const result = await executeQuery<QueryResult>(
      `INSERT INTO security_alerts (event_id, user_id, alert_type, severity, message, is_resolved)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        alert.eventId,
        alert.userId,
        alert.alertType,
        alert.severity,
        alert.message,
        alert.isResolved,
      ]
    );

    return result.insertId;
  } catch (error) {
    console.error("Failed to create security alert:", error);
    throw error;
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
      // Special handling for api_access which can come from user_activity_logs
      if (options.eventType === "api_access") {
        whereClause += " AND (se.event_type = ? OR se.event_type = ?)";
        params.push("api_access");
        params.push("sensitive_data_access");
        countParams.push("api_access");
        countParams.push("sensitive_data_access");
      } else {
        whereClause += " AND se.event_type = ?";
        params.push(options.eventType);
        countParams.push(options.eventType);
      }
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

    const countResults = await executeQuery<any[]>(countQuery, countParams);
    // Ensure we have a valid count result
    const countResult =
      Array.isArray(countResults) && countResults.length > 0
        ? countResults[0]
        : { total: 0 };
    const total = countResult?.total || 0;

    // Log the count for debugging
    console.log(`Security logs count: ${total}`);
    console.log(`Count query: ${countQuery}`);
    console.log(`Count params:`, countParams);

    // Don't return early even if total is 0, still attempt to query
    // This helps diagnose if there's a counting issue vs. a data retrieval issue

    // Get the actual data
    let dataQuery = `
      SELECT se.id, se.user_id, se.event_type, se.severity, se.ip_address, se.user_agent, se.details, se.created_at, u.username, u.email 
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

    // Log the query and parameters for debugging
    console.log(`Security logs data query: ${dataQuery}`);
    console.log(`Security logs params:`, params);

    const logs = await executeQuery<SecurityLog[]>(dataQuery, params);

    // Log the raw query results
    console.log(
      `Raw security logs result:`,
      logs
        ? `Found ${Array.isArray(logs) ? logs.length : "non-array"} results`
        : "null result"
    );

    // Ensure logs is always an array, even if the query returns null or undefined
    const safetyLogs = Array.isArray(logs) ? logs : [];

    // Convert any JSON strings in details field to objects
    const processedLogs = safetyLogs.map((log) => {
      if (log.details && typeof log.details === "string") {
        try {
          log.details = JSON.parse(log.details);
        } catch (e) {
          // If parsing fails, keep the original string
          console.error("Failed to parse log details JSON:", e);
        }
      }
      return log;
    });

    // Log the processed logs
    console.log(
      `Processed security logs: returning ${processedLogs.length} logs`
    );

    return { logs: processedLogs, total };
  } catch (error) {
    console.error("Failed to get security logs:", error);
    return { logs: [], total: 0 };
  }
}

/**
 * Get security statistics
 * @returns Security statistics
 */
export async function getSecurityStats(): Promise<SecurityStats> {
  try {
    // Get total events
    const totalEventsResult = await executeQuery<CountResult[]>(
      "SELECT COUNT(*) as total FROM security_events"
    );
    const totalEvents = totalEventsResult[0].total;

    // Get events by type
    const eventsByTypeResult = await executeQuery<EventTypeCount[]>(`
      SELECT event_type, COUNT(*) as count
      FROM security_events
      GROUP BY event_type
    `);
    const eventsByType: Record<SecurityEventType, number> = {} as Record<
      SecurityEventType,
      number
    >;
    eventsByTypeResult.forEach((row) => {
      eventsByType[row.event_type] = row.count;
    });

    // Get events by severity
    const eventsBySeverityResult = await executeQuery<SeverityCount[]>(`
      SELECT severity, COUNT(*) as count
      FROM security_events
      GROUP BY severity
    `);
    const eventsBySeverity: Record<SecurityEventSeverity, number> = {} as Record<
      SecurityEventSeverity,
      number
    >;
    eventsBySeverityResult.forEach((row) => {
      eventsBySeverity[row.severity] = row.count;
    });

    // Get recent and unresolved alerts
    const recentAlertsResult = await executeQuery<CountResult[]>(`
      SELECT COUNT(*) as total
      FROM security_alerts
      WHERE created_at >= NOW() - INTERVAL 24 HOUR
    `);
    const recentAlerts = recentAlertsResult[0].total;

    const unresolvedAlertsResult = await executeQuery<CountResult[]>(`
      SELECT COUNT(*) as total
      FROM security_alerts
      WHERE is_resolved = FALSE
    `);
    const unresolvedAlerts = unresolvedAlertsResult[0].total;

    return {
      totalEvents,
      eventsByType,
      eventsBySeverity,
      recentAlerts,
      unresolvedAlerts,
    };
  } catch (error) {
    console.error("Failed to get security statistics:", error);
    throw error;
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
 * Get unresolved security alerts
 * @param limit Maximum number of alerts to return
 * @returns Array of unresolved security alerts
 */
export async function getUnresolvedAlerts(limit: number = 100): Promise<any[]> {
  try {
    const alerts = await executeQuery(
      `SELECT sa.*, se.event_type, se.ip_address, u.username, u.email 
       FROM security_alerts sa 
       JOIN security_events se ON sa.event_id = se.id 
       LEFT JOIN users u ON sa.user_id = u.id 
       WHERE sa.is_resolved = FALSE 
       ORDER BY sa.severity DESC, sa.created_at DESC 
       LIMIT ?`,
      [limit]
    );

    // Ensure alerts is always an array, even if the query returns null or undefined
    const safetyAlerts = Array.isArray(alerts) ? alerts : [];

    // Process any JSON fields if needed
    const processedAlerts = safetyAlerts.map((alert) => {
      // Process message field if it's a JSON string
      if (alert.message && typeof alert.message === "string") {
        try {
          // Check if it's a JSON string before parsing
          if (alert.message.startsWith("{") || alert.message.startsWith("[")) {
            alert.message = JSON.parse(alert.message);
          }
        } catch (e) {
          // If parsing fails, keep the original string
          console.error("Failed to parse alert message JSON:", e);
        }
      }
      return alert;
    });

    return processedAlerts;
  } catch (error) {
    console.error("Failed to get unresolved alerts:", error);
    return [];
  }
}

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
    // Get total events in the specified time period
    const [totalResult] = await executeQuery<any[]>(
      `SELECT COUNT(*) as total FROM security_events WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)`,
      [days]
    );
    const totalEvents = totalResult?.total || 0;

    // Get events by type
    const eventsByTypeResult = await executeQuery<any[]>(
      `SELECT event_type, COUNT(*) as count 
       FROM security_events 
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) 
       GROUP BY event_type`,
      [days]
    );
    const eventsByType: Record<string, number> = {};
    // Ensure eventsByTypeResult is an array
    const safeEventsByTypeResult = Array.isArray(eventsByTypeResult)
      ? eventsByTypeResult
      : [];
    safeEventsByTypeResult.forEach((row) => {
      eventsByType[row.event_type] = row.count;
    });

    // Get events by severity
    const eventsBySeverityResult = await executeQuery<any[]>(
      `SELECT severity, COUNT(*) as count 
       FROM security_events 
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) 
       GROUP BY severity`,
      [days]
    );
    const eventsBySeverity: Record<string, number> = {};
    // Ensure eventsBySeverityResult is an array
    const safeEventsBySeverityResult = Array.isArray(eventsBySeverityResult)
      ? eventsBySeverityResult
      : [];
    safeEventsBySeverityResult.forEach((row) => {
      eventsBySeverity[row.severity] = row.count;
    });

    // Get recent failed logins (last 24 hours)
    const [failedLoginsResult] = await executeQuery<any[]>(
      `SELECT COUNT(*) as count 
       FROM security_events 
       WHERE event_type = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)`,
      [SecurityEventType.LOGIN_FAILURE]
    );
    const recentFailedLogins = failedLoginsResult?.count || 0;

    // Get recent suspicious activities (last 24 hours)
    const [suspiciousActivitiesResult] = await executeQuery<any[]>(
      `SELECT COUNT(*) as count 
       FROM security_events 
       WHERE (event_type = ? OR event_type = ? OR event_type = ? OR severity = ?) 
       AND created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)`,
      [
        SecurityEventType.SUSPICIOUS_ACTIVITY,
        SecurityEventType.GEOGRAPHIC_ANOMALY,
        SecurityEventType.SENSITIVE_DATA_ACCESS,
        SecurityEventSeverity.CRITICAL,
      ]
    );
    const recentSuspiciousActivities = suspiciousActivitiesResult?.count || 0;

    // Get API access count (last 24 hours)
    const [apiAccessResult] = await executeQuery<any[]>(
      `SELECT COUNT(*) as count 
       FROM security_events 
       WHERE (event_type = ? OR event_type = ?) 
       AND created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)`,
      [
        SecurityEventType.API_ACCESS,
        SecurityEventType.SENSITIVE_DATA_ACCESS,
      ]
    );
    const recentApiAccess = apiAccessResult?.count || 0;

    return {
      totalEvents,
      eventsByType,
      eventsBySeverity,
      recentFailedLogins,
      recentSuspiciousActivities,
      recentApiAccess,
    };
  } catch (error) {
    console.error("Failed to get security log statistics:", error);
    return {
      totalEvents: 0,
      eventsByType: {},
      eventsBySeverity: {},
      recentFailedLogins: 0,
      recentSuspiciousActivities: 0,
      recentApiAccess: 0,
    };
  }
}
