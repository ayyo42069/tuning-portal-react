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
    console.log("[SessionStatus] Checking session status");
    
    // Get token from cookie
    const token = request.cookies.get("auth_token")?.value;
    const sessionId = request.cookies.get("session_id")?.value;

    console.log(`[SessionStatus] Token exists: ${!!token}, Session ID exists: ${!!sessionId}`);

    if (!token || !sessionId) {
      console.log("[SessionStatus] Missing token or session ID");
      return NextResponse.json({ success: false });
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      console.log("[SessionStatus] Invalid token");
      return NextResponse.json({ success: false });
    }

    console.log(`[SessionStatus] Token verified for user: ${decoded.id}`);

    // Get session from database
    const [session] = await executeQuery<Session[]>(
      "SELECT user_id, expires_at, last_activity FROM sessions WHERE id = ?",
      [sessionId]
    );

    if (!session) {
      console.log(`[SessionStatus] No session found for ID: ${sessionId}`);
      return NextResponse.json({ success: false });
    }

    console.log(`[SessionStatus] Session found for user: ${session.user_id}`);

    // Check if session is expired
    const expiresAt = new Date(session.expires_at);
    const now = new Date();
    
    // If session is expired
    if (expiresAt < now) {
      console.log(`[SessionStatus] Session expired at: ${expiresAt}`);
      return NextResponse.json({ success: false });
    }

    // Get user data
    let user = null;
    try {
      const [userResult] = await executeQuery<User[]>(
        `SELECT u.id, u.username, u.email, u.role, 
                COALESCE(uc.credits, 0) as credits,
                u.is_banned, u.ban_reason, u.ban_expires_at
         FROM users u 
         LEFT JOIN user_credits uc ON u.id = uc.user_id 
         WHERE u.id = ?`,
        [session.user_id]
      );
      
      if (userResult) {
        user = userResult;
        console.log(`[SessionStatus] User data retrieved: ${user.username}`);
      } else {
        console.log(`[SessionStatus] No user found for ID: ${session.user_id}`);
        return NextResponse.json({ success: false });
      }
    } catch (error) {
      console.error("[SessionStatus] Error fetching user data:", error);
      return NextResponse.json({ success: false });
    }

    // Check if session is about to expire (within 1 day)
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    // If session is about to expire, refresh it
    if (expiresAt <= oneDayFromNow) {
      console.log(`[SessionStatus] Session about to expire, refreshing`);
      const newExpiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
      await executeQuery(
        "UPDATE sessions SET expires_at = ?, last_activity = NOW() WHERE id = ?",
        [newExpiresAt, sessionId]
      );
      
      // Also refresh the JWT token
      const newToken = generateToken({
        id: session.user_id,
        username: user.username,
        email: user.email,
        role: user.role as "user" | "admin"
      });
      
      // Create response with refreshed token and user data
      const response = NextResponse.json({ 
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

    // Return success response with user data
    const response = NextResponse.json({ 
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
    
    console.log("[SessionStatus] Returning success response");
    return response;
  } catch (error) {
    console.error("[SessionStatus] Session status check failed:", error);
    return NextResponse.json({ success: false });
  }
}
