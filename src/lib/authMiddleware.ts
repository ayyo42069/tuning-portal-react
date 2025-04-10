import { NextRequest } from "next/server";
import { verifyToken } from "./auth";
import { getRow, executeQuery } from "./db";
import { User } from "./types/auth";

interface UserDB extends User {
  credits: number;
  is_banned: boolean;
  ban_reason: string | null;
  ban_expires_at: string | null;
}

interface AuthResult {
  success: boolean;
  error?: string;
  status: number;
  isAuthenticated: boolean;
  redirectTo?: string;
  user?: UserDB;
}

/**
 * Authentication middleware for API routes
 * Verifies both JWT token and session for enhanced security
 */
export async function authenticateUser(request: NextRequest): Promise<AuthResult> {
  try {
    // Get the auth token from cookies
    const authToken = request.cookies.get("auth_token")?.value;

    if (!authToken) {
      return {
        success: false,
        error: "Not authenticated",
        status: 401,
        isAuthenticated: false,
      };
    }

    // Verify the JWT token
    const decodedToken = verifyToken(authToken);
    if (!decodedToken) {
      return {
        success: false,
        error: "Invalid authentication token",
        status: 401,
        isAuthenticated: false,
      };
    }

    // Get session ID from cookies and verify session
    const sessionId = request.cookies.get("session_id")?.value;

    // Always require a valid session for authentication
    if (!sessionId) {
      return {
        success: false,
        error: "No active session",
        status: 401,
        isAuthenticated: false,
        redirectTo: "/auth/terminated",
      };
    }

    const session = await getRow<{ user_id: number; expires_at: string }>(
      "SELECT user_id, expires_at FROM sessions WHERE id = ? AND expires_at > NOW()",
      [sessionId]
    );

    // If session doesn't exist, has expired, or doesn't match the user ID from the token
    if (!session || session.user_id !== decodedToken.id) {
      return {
        success: false,
        error: "Session terminated",
        status: 401,
        isAuthenticated: false,
        redirectTo: "/auth/terminated",
      };
    }

    // Get user data from database including credits and ban information
    const user = await getRow<UserDB>(
      `SELECT u.id, u.username, u.email, u.role, u.created_at, 
              COALESCE(uc.credits, 0) as credits,
              u.is_banned, u.ban_reason, u.ban_expires_at
       FROM users u 
       LEFT JOIN user_credits uc ON u.id = uc.user_id 
       WHERE u.id = ?`,
      [decodedToken.id]
    );

    if (!user) {
      return {
        success: false,
        error: "User not found",
        status: 401,
        isAuthenticated: false,
      };
    }

    // Check if user is banned
    if (user.is_banned) {
      const banExpired =
        user.ban_expires_at && new Date(user.ban_expires_at) < new Date();

      if (!banExpired) {
        return {
          success: false,
          error: `Your account has been banned. Reason: ${
            user.ban_reason || "Violation of terms of service"
          }`,
          status: 403,
          isAuthenticated: false,
        };
      }
    }

    // Update session last activity
    await executeQuery(
      "UPDATE sessions SET last_activity = NOW() WHERE id = ?",
      [sessionId]
    );

    return {
      success: true,
      status: 200,
      isAuthenticated: true,
      user,
    };
  } catch (error) {
    console.error("Authentication error:", error);
    return {
      success: false,
      error: "Authentication failed",
      status: 500,
      isAuthenticated: false,
    };
  }
}
