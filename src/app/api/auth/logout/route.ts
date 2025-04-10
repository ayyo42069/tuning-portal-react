import { NextRequest, NextResponse } from "next/server";
import { serialize } from "cookie";
import { verifyToken } from "@/lib/auth";
import { logAuthFailure } from "@/lib/securityMiddleware";

/**
 * POST handler for logging out
 * This endpoint is used by the client to clear authentication
 */
export async function POST(request: NextRequest) {
  try {
    console.log("[Logout] Processing logout request");
    
    // Create response
    const response = NextResponse.json({ success: true });
    
    // Clear auth token cookie
    const authTokenCookie = serialize("auth_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });
    
    // Add cookie to response
    response.headers.append("Set-Cookie", authTokenCookie);
    
    console.log("[Logout] Logout successful");
    return response;
  } catch (error) {
    console.error("[Logout] Logout failed:", error);
    return NextResponse.json({ success: false, error: "Logout failed" }, { status: 500 });
  }
}
