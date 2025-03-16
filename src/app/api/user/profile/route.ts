import { NextRequest, NextResponse } from "next/server";
import { getRow } from "@/lib/db";
import { verifyToken, getAuthCookie } from "@/lib/auth";
import { logApiAccess } from "@/lib/securityMiddleware";

interface User {
  id: number;
  username: string;
  email: string;
  role: "user" | "admin";
  credits: number;
}

export async function GET(request: NextRequest) {
  try {
    // Get the auth token from cookies
    const cookies = request.headers.get("cookie") || "";
    console.log("Cookies received:", cookies ? "Present" : "None");
    const token = getAuthCookie(cookies);
    console.log("Auth token extracted:", token ? "Present" : "None");

    if (!token) {
      console.log("Authentication failed: No token found");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify the token
    console.log("Verifying token...");
    const decoded = verifyToken(token);
    console.log("Token verification result:", decoded ? "Valid" : "Invalid");

    if (!decoded || !decoded.id) {
      console.log("Authentication failed: Invalid token");
      return NextResponse.json(
        { error: "Invalid authentication token" },
        { status: 401 }
      );
    }

    // Get user data from database including credits
    const user = await getRow<User>(
      `SELECT u.id, u.username, u.email, u.role, COALESCE(uc.credits, 0) as credits 
       FROM users u 
       LEFT JOIN user_credits uc ON u.id = uc.user_id 
       WHERE u.id = ?`,
      [decoded.id]
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Log API access for profile data (sensitive information)
    await logApiAccess(
      decoded.id,
      request,
      "/api/user/profile",
      true // Mark as sensitive data
    );

    // Return user data
    return NextResponse.json(
      {
        success: true,
        user,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching profile" },
      { status: 500 }
    );
  }
}
