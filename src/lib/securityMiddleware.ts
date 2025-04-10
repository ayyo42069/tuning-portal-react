import { NextRequest, NextResponse } from "next/server";
import {
  logSecurityEvent,
  SecurityEventType,
  SecurityEventSeverity,
  createSecurityAlert,
} from "./securityLogging";
import { executeQuery } from "./db";

// Import GeolocationData interface from types
import { GeolocationData } from "./types";
import { getGeolocationData } from "./geoLocationService";
import { logUserActivity, ActivityType } from "./activityLogging";

/**
 * Get client IP address from request
 * @param request The Next.js request object
 * @returns The client IP address
 */
export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * Get user agent from request
 * @param request The Next.js request object
 * @returns The user agent string
 */
export function getUserAgent(request: NextRequest): string {
  return request.headers.get("user-agent") || "unknown";
}

/**
 * Log authentication success event
 * @param userId The user ID
 * @param request The Next.js request object
 * @returns The event ID
 */
export async function logAuthSuccess(
  userId: number,
  request: NextRequest
): Promise<number> {
  const ip = getClientIp(request);
  const userAgent = getUserAgent(request);

  // Log the successful login event
  const eventId = await logSecurityEvent({
    user_id: userId,
    event_type: SecurityEventType.LOGIN_SUCCESS,
    severity: SecurityEventSeverity.INFO,
    ip_address: ip,
    user_agent: userAgent,
    details: {
      method: "jwt+session",
      timestamp: new Date().toISOString(),
    },
  });

  // Update the user's last login information
  await executeQuery(
    "UPDATE users SET last_login_ip = ?, last_login_date = NOW() WHERE id = ?",
    [ip, userId]
  );

  // Check for geographic anomalies
  await checkGeographicAnomaly(userId, ip, userAgent, eventId);

  return eventId;
}

/**
 * Log authentication failure event
 * @param username The attempted username
 * @param request The Next.js request object
 * @param reason The reason for failure
 * @returns The event ID
 */
export async function logAuthFailure(
  username: string,
  request: NextRequest,
  reason: string
): Promise<number> {
  const ip = getClientIp(request);
  const userAgent = getUserAgent(request);

  // Try to find the user ID if the username exists
  const user = await executeQuery<any[]>(
    "SELECT id, login_attempts FROM users WHERE username = ?",
    [username]
  );

  const userId = user && user.length > 0 ? user[0].id : null;
  let loginAttempts = user && user.length > 0 ? user[0].login_attempts + 1 : 1;

  // Log the failed login event
  const eventId = await logSecurityEvent({
    user_id: userId,
    event_type: SecurityEventType.LOGIN_FAILURE,
    severity: SecurityEventSeverity.WARNING,
    ip_address: ip,
    user_agent: userAgent,
    details: {
      username,
      reason,
      timestamp: new Date().toISOString(),
    },
  });

  // If user exists, increment failed login attempts
  if (userId) {
    await executeQuery("UPDATE users SET login_attempts = ? WHERE id = ?", [
      loginAttempts,
      userId,
    ]);

    // Check if account should be locked (5 or more failed attempts)
    if (loginAttempts >= 5) {
      // Lock the account for 30 minutes
      const lockUntil = new Date();
      lockUntil.setMinutes(lockUntil.getMinutes() + 30);

      await executeQuery(
        "UPDATE users SET account_locked = TRUE, account_locked_reason = ?, account_locked_until = ? WHERE id = ?",
        ["Multiple failed login attempts", lockUntil, userId]
      );

      // Log account lockout event
      await logSecurityEvent({
        user_id: userId,
        event_type: SecurityEventType.ACCOUNT_LOCKOUT,
        severity: SecurityEventSeverity.ERROR,
        ip_address: ip,
        user_agent: userAgent,
        details: {
          reason: "Multiple failed login attempts",
          lockUntil: lockUntil.toISOString(),
          attempts: loginAttempts,
        },
      });

      // Create a security alert
      await createSecurityAlert(
        eventId,
        "account_lockout",
        SecurityEventSeverity.ERROR,
        `Account locked after ${loginAttempts} failed login attempts`,
        userId
      );
    }

    // Check for brute force attacks (multiple failures from same IP)
    await checkBruteForceAttempts(ip, eventId);
  }

  return eventId;
}

/**
 * Log API access event
 * @param userId The user ID (if authenticated)
 * @param request The Next.js request object
 * @param endpoint The API endpoint being accessed
 * @param isSensitive Whether the endpoint contains sensitive data
 * @returns The event ID
 */
export async function logApiAccess(
  userId: number | undefined, // Changed from number | null to number | undefined
  request: NextRequest,
  endpoint: string,
  isSensitive: boolean = false
): Promise<number> {
  const ip = getClientIp(request);
  const userAgent = getUserAgent(request);
  const method = request.method;

  // Determine severity based on sensitivity and method
  let severity = SecurityEventSeverity.INFO;
  if (isSensitive) {
    severity = SecurityEventSeverity.WARNING;
  }

  // Log the API access event
  const eventId = await logSecurityEvent({
    user_id: userId, // Now this matches the expected type
    event_type: isSensitive
      ? SecurityEventType.SENSITIVE_DATA_ACCESS
      : SecurityEventType.API_ACCESS,
    severity,
    ip_address: ip,
    user_agent: userAgent,
    details: {
      endpoint,
      method,
      timestamp: new Date().toISOString(),
    },
  });

  // Log user activity for API access
  if (userId) {
    await logUserActivity(userId, request, ActivityType.API_ACCESS, {
      endpoint,
      method,
      isSensitive,
      timestamp: new Date().toISOString(),
    });
  }

  return eventId;
}

/**
 * Log admin actions
 * @param adminId The admin user ID
 * @param actionType The type of admin action
 * @param request The Next.js request object
 * @param details Additional details about the action
 * @returns The event ID
 */
export async function logAdminAction(
  adminId: number,
  actionType:
    | SecurityEventType.ADMIN_USER_UPDATE
    | SecurityEventType.ADMIN_PERMISSION_CHANGE
    | SecurityEventType.ADMIN_SYSTEM_SETTING_CHANGE,
  request: NextRequest,
  details: any
): Promise<number> {
  const ip = getClientIp(request);
  const userAgent = getUserAgent(request);

  // Log the admin action event
  const eventId = await logSecurityEvent({
    user_id: adminId,
    event_type: actionType,
    severity: SecurityEventSeverity.WARNING,
    ip_address: ip,
    user_agent: userAgent,
    details: {
      ...details,
      timestamp: new Date().toISOString(),
    },
  });

  return eventId;
}

/**
 * Check for geographic anomalies in user access
 * @param userId The user ID
 * @param ip The IP address
 * @param userAgent The user agent
 * @param relatedEventId Related security event ID
 */
async function checkGeographicAnomaly(
  userId: number,
  ip: string,
  userAgent: string,
  relatedEventId: number
): Promise<void> {
  try {
    // Get geolocation data for the IP using our geolocation service
    // This will use a real API if configured, or fall back to simulation
    const geoData: GeolocationData = await getGeolocationData(ip);

    // Check if this is the user's first access from this location
    const existingLocations = await executeQuery<any[]>(
      "SELECT * FROM user_access_locations WHERE user_id = ? AND country = ? AND region = ?",
      [userId, geoData.country, geoData.region]
    );

    const isFirstAccess = existingLocations.length === 0;

    // Record the access location
    await executeQuery(
      `INSERT INTO user_access_locations 
       (user_id, ip_address, country, region, city, latitude, longitude, is_first_access) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        ip,
        geoData.country,
        geoData.region,
        geoData.city,
        geoData.latitude,
        geoData.longitude,
        isFirstAccess,
      ]
    );

    // If this is the first access from this location, create an alert
    if (isFirstAccess) {
      // Log the geographic anomaly
      const anomalyEventId = await logSecurityEvent({
        user_id: userId,
        event_type: SecurityEventType.GEOGRAPHIC_ANOMALY,
        severity: SecurityEventSeverity.WARNING,
        ip_address: ip,
        user_agent: userAgent,
        details: {
          country: geoData.country,
          region: geoData.region,
          city: geoData.city,
          relatedEventId,
        },
      });

      // Create a security alert for the new location
      await createSecurityAlert(
        anomalyEventId,
        "new_location_access",
        SecurityEventSeverity.WARNING,
        `User accessed account from a new location: ${geoData.city}, ${geoData.region}, ${geoData.country}`,
        userId
      );
    }
  } catch (error) {
    console.error("Failed to check geographic anomaly:", error);
  }
}

/**
 * Check for brute force attempts from an IP address
 * @param ip The IP address
 * @param relatedEventId Related security event ID
 */
async function checkBruteForceAttempts(
  ip: string,
  relatedEventId: number
): Promise<void> {
  try {
    // Count failed login attempts from this IP in the last hour
    const [result] = await executeQuery<any[]>(
      `SELECT COUNT(*) as count 
         FROM security_events 
         WHERE ip_address = ? 
         AND event_type = ? 
         AND created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)`,
      [ip, SecurityEventType.LOGIN_FAILURE]
    );

    const failedAttempts = result.count;

    // If there are more than 10 failed attempts in an hour, log a suspicious activity
    if (failedAttempts >= 10) {
      // Log the suspicious activity
      const eventId = await logSecurityEvent({
        user_id: undefined, // Changed from null to undefined
        event_type: SecurityEventType.MULTIPLE_FAILED_ATTEMPTS,
        severity: SecurityEventSeverity.ERROR,
        ip_address: ip,
        user_agent: "system",
        details: {
          failedAttempts,
          timeWindow: "1 hour",
          relatedEventId,
        },
      });

      // Create a security alert
      await createSecurityAlert(
        eventId,
        "brute_force_attempt",
        SecurityEventSeverity.ERROR,
        `Possible brute force attack detected: ${failedAttempts} failed login attempts from IP ${ip} in the last hour`,
        undefined // Changed from null to undefined
      );
    }
  } catch (error) {
    console.error("Failed to check brute force attempts:", error);
  }
}

// The simulateGeolocation function has been moved to geoLocationService.ts

/**
 * Log user registration event with geolocation data
 * @param userId The user ID
 * @param request The Next.js request object
 * @returns The event ID
 */
export async function logRegistration(
  userId: number,
  request: NextRequest
): Promise<number> {
  const ip = getClientIp(request);
  const userAgent = getUserAgent(request);

  // Get geolocation data for the IP
  const geoData: GeolocationData = await getGeolocationData(ip);

  // Log the registration event
  const eventId = await logSecurityEvent({
    user_id: userId,
    event_type: SecurityEventType.REGISTRATION,
    severity: SecurityEventSeverity.INFO,
    ip_address: ip,
    user_agent: userAgent,
    details: {
      geolocation: {
        country: geoData.country,
        region: geoData.region,
        city: geoData.city,
        latitude: geoData.latitude,
        longitude: geoData.longitude,
      },
      timestamp: new Date().toISOString(),
    },
  });

  // Record the access location
  await executeQuery(
    `INSERT INTO user_access_locations 
     (user_id, ip_address, country, region, city, latitude, longitude, is_first_access) 
     VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)`,
    [
      userId,
      ip,
      geoData.country,
      geoData.region,
      geoData.city,
      geoData.latitude,
      geoData.longitude,
    ]
  );

  return eventId;
}
