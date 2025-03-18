import { NextRequest, NextResponse } from "next/server";
import { verifyToken, getSession, getAuthCookie } from "./auth";
import { getRow } from "./db";

interface UserDB {
  id: number;
  username: string;
  email: string;
  role: string;
  created_at: string;
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

    // Get session ID from cookies (will be implemented in login/register routes)
    const sessionId = request.cookies.get("session_id")?.value;

    // If session ID exists, verify the session
    if (sessionId) {
      const session = await getSession(sessionId);

      // If session doesn't exist or doesn't match the user ID from the token
      if (!session || session.user_id !== decodedToken.id) {
        return {
          success: false,
          error: "Invalid session",
          status: 200, // Changed from 401 to 200 to avoid console errors
          isAuthenticated: false,
        };
      }
    }

    // Get user data from database
    const user = await getRow<UserDB>(
      `SELECT id, username, email, role, created_at 
       FROM users 
       WHERE id = ?`,
      [decodedToken.id]
    );

    if (!user) {
      return {
        success: false,
        error: "User not found",
        status: 404,
      };
    }

    // Return success with user data
    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.created_at,
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
