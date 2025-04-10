import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/authMiddleware";
import { getRow } from "@/lib/db";
import { getAuthCookie, verifyToken, setAuthCookie } from "@/lib/auth";
import { logApiAccess } from "@/lib/securityMiddleware";

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  credits: number;
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate the user
    const authResult = await authenticateUser(request);
    
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error || "Authentication required" },
        { status: authResult.status }
      );
    }
    
    // Get user data from database including credits
    // Adding cache: false to ensure we always get the latest credit balance
    const user = await getRow<User>(
      `SELECT u.id, u.username, u.email, u.role, COALESCE(uc.credits, 0) as credits 
       FROM users u 
       LEFT JOIN user_credits uc ON u.id = uc.user_id 
       WHERE u.id = ?`,
      [authResult.user?.id],
      { cache: false }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Log API access for profile data (sensitive information)
    await logApiAccess(
      user.id,
      request,
      "/api/user/profile",
      true // Mark as sensitive data
    );

    // Create response with user data
    const response = NextResponse.json(
      {
        success: true,
        user,
      },
      { status: 200 }
    );
    
    // If a new token was generated, set it in the response
    if (authResult.newToken) {
      const authCookieHeader = setAuthCookie(authResult.newToken);
      response.headers.append("Set-Cookie", authCookieHeader);
    }

    return response;
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching profile" },
      { status: 500 }
    );
  }
}
