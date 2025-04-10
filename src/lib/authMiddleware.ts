import { NextRequest } from "next/server";
import { verifyToken, generateToken, setAuthCookie } from "./auth";
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
  newToken?: string;
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
      "SELECT user_id, expires_at FROM sessions WHERE id = ?",
      [sessionId]
    );

    // If session doesn't exist or doesn't match the user ID from the token
    if (!session || session.user_id !== decodedToken.id) {
      return {
        success: false,
        error: "Session terminated",
        status: 401,
        isAuthenticated: false,
        redirectTo: "/auth/terminated",
      };
    }

    // Check if session is expired or about to expire (within 1 day)
    const expiresAt = new Date(session.expires_at);
    const now = new Date();
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    // If session is expired
    if (expiresAt < now) {
      return {
        success: false,
        error: "Session expired",
        status: 401,
        isAuthenticated: false,
        redirectTo: "/auth/login",
      };
    }
    
    // If session is about to expire (within 1 day), refresh it
    if (expiresAt < oneDayFromNow) {
      // Extend session expiration by 30 days
      const newExpiresAt = new Date();
      newExpiresAt.setDate(newExpiresAt.getDate() + 30);
      
      await executeQuery(
        "UPDATE sessions SET expires_at = ? WHERE id = ?",
        [newExpiresAt, sessionId]
      );
      
      console.log(`Session ${sessionId} refreshed for user ${session.user_id}`);
      
      // Also refresh the JWT token
      const newToken = generateToken({
        id: decodedToken.id,
        username: decodedToken.username,
        email: decodedToken.email,
        role: decodedToken.role
      });
      
      // Return the new token so the API route can set it
      return {
        success: true,
        status: 200,
        isAuthenticated: true,
        newToken
      };
    }

    // Update session last activity
    await executeQuery(
      "UPDATE sessions SET last_activity = NOW() WHERE id = ?",
      [sessionId]
    );

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
