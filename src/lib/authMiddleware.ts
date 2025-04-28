import { NextRequest } from "next/server";
import { verifyToken, generateToken, setAuthCookie } from "./auth";
import { getRow, executeQuery } from "./db";
import { User } from "./types/auth";

interface UserDB extends User {
  credits: number;
  is_banned: boolean;
  ban_reason: string | null;
  ban_expires_at: string | null;
  email_verified: boolean;
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
 * Verifies JWT token for authentication
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

    // Get user data from database including credits and ban information
    const user = await getRow<UserDB>(
      `SELECT u.id, u.username, u.email, u.role, u.created_at, 
              COALESCE(uc.credits, 0) as credits,
              u.is_banned, u.ban_reason, u.ban_expires_at,
              u.email_verified
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
      const banExpired = user.ban_expires_at && new Date(user.ban_expires_at) < new Date();
      if (!banExpired) {
        return {
          success: false,
          error: `Account banned: ${user.ban_reason || "Violation of terms of service"}`,
          status: 403,
          isAuthenticated: false,
        };
      }
    }

    return {
      success: true,
      status: 200,
      isAuthenticated: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role as "user" | "admin",
        credits: user.credits,
        is_banned: user.is_banned,
        ban_reason: user.ban_reason,
        ban_expires_at: user.ban_expires_at,
        email_verified: user.email_verified
      }
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
