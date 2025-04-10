import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/authMiddleware";
import { executeQuery } from "@/lib/db";
import { verifyToken, generateToken, setAuthCookie } from "@/lib/auth";

interface Session {
  user_id: number;
  expires_at: Date;
  last_activity: Date;
}

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  credits: number;
  is_banned: boolean;
  ban_reason: string | null;
  ban_expires_at: Date | null;
}

/**
 * GET handler for checking session termination status
 * This endpoint is used by the client to detect when a session has been terminated
 */
export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get("auth_token")?.value;
    const sessionId = request.cookies.get("session_id")?.value;

    if (!token || !sessionId) {
      return NextResponse.json({ success: false });
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false });
    }

    // Get session from database
    const [session] = await executeQuery<Session[]>(
      "SELECT user_id, expires_at, last_activity FROM sessions WHERE id = ?",
      [sessionId]
    );

    if (!session) {
      return NextResponse.json({ success: false });
    }

    // Check if session is expired or about to expire (within 1 day)
    const expiresAt = new Date(session.expires_at);
    const now = new Date();
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // If session is expired or about to expire, refresh it
    if (expiresAt <= oneDayFromNow) {
      const newExpiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
      await executeQuery(
        "UPDATE sessions SET expires_at = ?, last_activity = NOW() WHERE id = ?",
        [newExpiresAt, sessionId]
      );
      
      // Also refresh the JWT token
      const newToken = generateToken({
        id: session.user_id,
        username: decoded.username,
        email: decoded.email,
        role: decoded.role
      });
      
      // Create response with refreshed token
      const response = NextResponse.json({ 
        success: true,
        user: {
          id: session.user_id,
          email: decoded.email,
          role: decoded.role
        }
      });
      
      // Set the new auth token cookie
      const authCookieHeader = setAuthCookie(newToken);
      response.headers.append("Set-Cookie", authCookieHeader);
      
      return response;
    } else {
      // Update last activity even if not refreshing
      await executeQuery(
        "UPDATE sessions SET last_activity = NOW() WHERE id = ?",
        [sessionId]
      );
    }

    // Get user data
    const [user] = await executeQuery<User[]>(
      `SELECT u.id, u.username, u.email, u.role, u.is_banned, u.ban_reason, u.ban_expires_at,
              COALESCE(uc.credits, 0) as credits
       FROM users u 
       LEFT JOIN user_credits uc ON u.id = uc.user_id 
       WHERE u.id = ?`,
      [session.user_id]
    );

    if (!user) {
      return NextResponse.json({ success: false });
    }

    // Check if user is banned
    if (user.is_banned) {
      return NextResponse.json({ 
        success: false,
        error: "Account banned",
        banReason: user.ban_reason,
        banExpiresAt: user.ban_expires_at
      });
    }

    return NextResponse.json({ 
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        credits: user.credits,
        isBanned: user.is_banned,
        banReason: user.ban_reason,
        banExpiresAt: user.ban_expires_at
      }
    });
  } catch (error) {
    console.error("Session status check failed:", error);
    return NextResponse.json({ success: false });
  }
}
