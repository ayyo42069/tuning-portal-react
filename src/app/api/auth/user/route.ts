import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { executeQuery } from "@/lib/db";

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
    console.log("[User] Processing user data request");
    
    // Get token from cookie
    const token = request.cookies.get("auth_token")?.value;
    
    if (!token) {
      console.log("[User] No auth token found");
      return NextResponse.json({ success: false, error: "No auth token found" }, { status: 401 });
    }
    
    // Verify token
    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      console.log("[User] Invalid token");
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
    }
    
    console.log(`[User] Token verified for user: ${decoded.id}`);
    
    // Get user data from database
    const [user] = await executeQuery<User[]>(
      `SELECT u.id, u.username, u.email, u.role, 
              COALESCE(uc.credits, 0) as credits,
              u.is_banned, u.ban_reason, u.ban_expires_at
       FROM users u 
       LEFT JOIN user_credits uc ON u.id = uc.user_id 
       WHERE u.id = ?`,
      [decoded.id]
    );
    
    if (!user) {
      console.log(`[User] No user found for ID: ${decoded.id}`);
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }
    
    console.log(`[User] User data retrieved: ${user.username}`);
    
    // Return user data
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role as "user" | "admin",
        credits: user.credits,
        isBanned: user.is_banned,
        banReason: user.ban_reason,
        banExpiresAt: user.ban_expires_at
      }
    });
  } catch (error) {
    console.error("[User] Error retrieving user data:", error);
    return NextResponse.json({ success: false, error: "Failed to retrieve user data" }, { status: 500 });
  }
} 