import { NextRequest, NextResponse } from "next/server";
import { verifyToken, getSession, getAuthCookie } from "./auth";
import { getRow } from "./db";
import { logUserActivity } from "./activityLogging";

interface UserDB {
  id: number;
  username: string;
  email: string;
  role: string;
  created_at: string;
  credits?: number;
  is_banned?: boolean;
  ban_reason?: string;
  ban_expires_at?: string;
}

/**
 * Authentication middleware for API routes
 * Verifies both JWT token and session for enhanced security
 */
export async function authenticateUser(request: NextRequest) {
  try {
    // Get the auth token from cookies
    const authToken = request.cookies.get("auth_token")?.value;

    if (!authToken) {
      return {
        success: false,
        error: "Not authenticated",
        status: 200, // Changed from 401 to 200 to avoid console errors
        isAuthenticated: false,
      };
    }

    // Verify the JWT token
    const decodedToken = verifyToken(authToken);
    if (!decodedToken) {
      return {
        success: false,
        error: "Invalid authentication token",
        status: 200, // Changed from 401 to 200 to avoid console errors
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
        status: 200,
        isAuthenticated: false,
        redirectTo: "/auth/terminated",
      };
    }

    const session = await getSession(sessionId);

    // If session doesn't exist, has expired, or doesn't match the user ID from the token
    if (!session || session.user_id !== decodedToken.id) {
      return {
        success: false,
        error: "Session terminated",
        status: 200,
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
        status: 404,
      };
    }

    // Check if user is banned
    if (user.is_banned) {
      // Check if ban has expired
      const banExpired =
        user.ban_expires_at && new Date(user.ban_expires_at) < new Date();

      if (!banExpired) {
        return {
          success: false,
          error: "Your account has been banned",
          status: 403,
          isAuthenticated: false,
          user: {
            id: user.id,
            username: user.username,
            role: user.role,
            isBanned: true,
            banReason: user.ban_reason,
            banExpiresAt: user.ban_expires_at,
          },
        };
      }
      // If ban has expired, continue with authentication
    }

    // Log user activity
    await logUserActivity(user.id, request, "auth_success", {
      method: "jwt",
      timestamp: new Date().toISOString(),
    });

    // Return success with user data including credits and ban information
    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.created_at,
        credits: user.credits || 0,
        isBanned: user.is_banned || false,
        banReason: user.ban_reason || null,
        banExpiresAt: user.ban_expires_at || null,
      },
    };
  } catch (error) {
    console.error("Authentication error:", error);
    return {
      success: false,
      error: "Failed to authenticate user",
      status: 500,
    };
  }
}
