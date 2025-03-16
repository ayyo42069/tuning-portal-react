import { NextRequest, NextResponse } from "next/server";
import { serialize } from "cookie";
import { verifyToken } from "@/lib/auth";
import { executeQuery } from "@/lib/db";
import { logSessionEvent, logAuthFailure } from "@/lib/securityMiddleware";
import { SecurityEventType } from "@/lib/securityLogging";

export async function POST(request: NextRequest) {
  try {
    // Get the auth token and session ID from cookies
    const authToken = request.cookies.get("auth_token")?.value;
    const sessionId = request.cookies.get("session_id")?.value;

    // If session ID exists, delete the session from the database
    if (sessionId) {
      await executeQuery("DELETE FROM sessions WHERE id = ?", [sessionId]);
    }

    // If auth token exists, get user ID and delete all sessions for this user
    if (authToken) {
      const decodedToken = verifyToken(authToken);
      if (decodedToken && decodedToken.id) {
        // Log session invalidation event before deleting sessions
        if (sessionId) {
          await logSessionEvent(
            decodedToken.id,
            sessionId,
            SecurityEventType.SESSION_INVALIDATED,
            request
          );
        }

        // Delete all sessions for this user for complete logout across devices
        await executeQuery("DELETE FROM sessions WHERE user_id = ?", [
          decodedToken.id,
        ]);
      }
    }

    // Create cookies that expire immediately to clear the auth token and session ID
    const authCookieHeader = serialize("auth_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: -1, // Expire immediately
      path: "/",
    });

    const sessionCookieHeader = serialize("session_id", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: -1, // Expire immediately
      path: "/",
    });

    // Return success response
    const response = NextResponse.json(
      {
        success: true,
        message: "Logged out successfully",
      },
      { status: 200 }
    );

    // Add the cookies to the response
    response.headers.append("Set-Cookie", authCookieHeader);
    response.headers.append("Set-Cookie", sessionCookieHeader);

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "An error occurred during logout" },
      { status: 500 }
    );
  }
}
