import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/authMiddleware";
import { executeQuery } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

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
 * GET handler for retrieving user data
 * This endpoint is used by the client to get the current user's data
 */
export async function GET(request: NextRequest) {
  try {
    console.log("[UserData] Getting user data");
    
    // Get token from cookie
    const token = request.cookies.get("auth_token")?.value;
    const sessionId = request.cookies.get("session_id")?.value;

    console.log(`[UserData] Token exists: ${!!token}, Session ID exists: ${!!sessionId}`);

    if (!token || !sessionId) {
      console.log("[UserData] Missing token or session ID");
      return NextResponse.json({ success: false }, { status: 401 });
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      console.log("[UserData] Invalid token");
      return NextResponse.json({ success: false }, { status: 401 });
    }

    console.log(`[UserData] Token verified for user: ${decoded.id}`);

    // Get user data from database
    const [userResult] = await executeQuery<User[]>(
      `SELECT u.id, u.username, u.email, u.role, 
              COALESCE(uc.credits, 0) as credits,
              u.is_banned, u.ban_reason, u.ban_expires_at
       FROM users u 
       LEFT JOIN user_credits uc ON u.id = uc.user_id 
       WHERE u.id = ?`,
      [decoded.id]
    );
    
    if (!userResult) {
      console.log(`[UserData] No user found for ID: ${decoded.id}`);
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }
    
    console.log(`[UserData] User data retrieved: ${userResult.username}`);
    
    // Return success response with user data
    return NextResponse.json({ 
      success: true,
      user: {
        id: userResult.id,
        username: userResult.username,
        email: userResult.email,
        role: userResult.role,
        credits: userResult.credits,
        isBanned: userResult.is_banned,
        banReason: userResult.ban_reason,
        banExpiresAt: userResult.ban_expires_at
      }
    });
  } catch (error) {
    console.error("[UserData] Error getting user data:", error);
    return NextResponse.json({ success: false, error: "Failed to get user data" }, { status: 500 });
  }
} 