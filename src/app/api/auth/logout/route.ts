import { NextRequest, NextResponse } from "next/server";
import { serialize } from "cookie";
import { verifyToken } from "@/lib/auth";
import { executeQuery } from "@/lib/db";
import { logSessionEvent, logAuthFailure } from "@/lib/securityMiddleware";
import { SecurityEventType } from "@/lib/securityLogging";

/**
 * POST handler for logging out
 * This endpoint is used by the client to terminate the session
 */
export async function POST(request: NextRequest) {
  try {
    console.log("[Logout] Processing logout request");
    
    // Get session ID from cookie
    const sessionId = request.cookies.get("session_id")?.value;
    
    if (sessionId) {
      console.log(`[Logout] Session ID found: ${sessionId}`);
      
      // Delete session from database
      await executeQuery(
        "DELETE FROM sessions WHERE id = ?",
        [sessionId]
      );
      
      console.log(`[Logout] Session deleted from database`);
    } else {
      console.log("[Logout] No session ID found");
    }
    
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
    
    // Clear session ID cookie
    const sessionIdCookie = serialize("session_id", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });
    
    // Add cookies to response
    response.headers.append("Set-Cookie", authTokenCookie);
    response.headers.append("Set-Cookie", sessionIdCookie);
    
    console.log("[Logout] Logout successful");
    return response;
  } catch (error) {
    console.error("[Logout] Logout failed:", error);
    return NextResponse.json({ success: false, error: "Logout failed" }, { status: 500 });
  }
}
