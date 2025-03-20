import { NextRequest } from "next/server";
import { executeQuery } from "./db";
import { getClientIp, getUserAgent } from "./securityMiddleware";

// Define valid activity types to match the database ENUM
export enum ActivityType {
  LOGIN = "login",
  LOGOUT = "logout",
  REGISTRATION = "registration",
  PASSWORD_RESET = "password_reset",
  EMAIL_VERIFICATION = "email_verification",
  PROFILE_UPDATE = "profile_update",
  FAILED_LOGIN = "failed_login",
  API_ACCESS = "api_access",
}

/**
 * Log user activity
 * @param userId The user ID
 * @param request The Next.js request object
 * @param activity_type The type of activity being performed
 * @param details Additional activity details
 * @returns The activity log ID
 */
export async function logUserActivity(
  userId: number,
  request: NextRequest,
  activity_type: ActivityType | string,
  details?: any
): Promise<number> {
  try {
    const ip_address = getClientIp(request);
    const user_agent = getUserAgent(request);

    // Create user activity logs table if it doesn't exist
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS user_activity_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        activity_type VARCHAR(50) NOT NULL,
        ip_address VARCHAR(45) NOT NULL,
        user_agent VARCHAR(255) NOT NULL,
        details JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_activity_user (user_id),
        INDEX idx_user_activity_type (activity_type),
        INDEX idx_user_activity_created (created_at)
      )
    `);

    // Insert the activity log
    const result = await executeQuery<any>(
      `INSERT INTO user_activity_logs 
       (user_id, activity_type, ip_address, user_agent, details) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        userId,
        activity_type,
        ip_address,
        user_agent,
        details ? JSON.stringify(details) : null,
      ]
    );

    return result.insertId;
  } catch (error) {
    console.error("Failed to log user activity:", error);
    return 0;
  }
}

/**
 * Get user activity logs
 * @param userId The user ID
 * @param limit Maximum number of logs to return
 * @param offset Number of logs to skip
 * @returns Array of user activity logs
 */
export async function getUserActivityLogs(
  userId: number,
  limit: number = 50,
  offset: number = 0
): Promise<any[]> {
  try {
    return await executeQuery(
      `SELECT * FROM user_activity_logs 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );
  } catch (error) {
    console.error("Failed to get user activity logs:", error);
    return [];
  }
}
