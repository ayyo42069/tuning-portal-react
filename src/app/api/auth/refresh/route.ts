import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/authMiddleware";
import { generateToken, setAuthCookie } from "@/lib/auth";

/**
 * POST handler for refreshing the authentication token
 * This endpoint is used by the client to refresh the JWT token
 */
export async function POST(request: NextRequest) {
  try {
    console.log("[TokenRefresh] Refreshing token");
    
    // Authenticate the user
    const authResult = await authenticateUser(request);
    
    if (!authResult.success) {
      console.log(`[TokenRefresh] Authentication failed: ${authResult.error}`);
      return NextResponse.json({ success: false }, { status: authResult.status });
    }
    
    // If authentication was successful and a new token was generated
    if (authResult.newToken) {
      console.log("[TokenRefresh] New token generated");
      
      // Create response with success
      const response = NextResponse.json({ success: true });
      
      // Set the new auth token cookie
      const authCookieHeader = setAuthCookie(authResult.newToken);
      response.headers.append("Set-Cookie", authCookieHeader);
      
      return response;
    }
    
    // If no new token was generated, return success anyway
    console.log("[TokenRefresh] No new token needed");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[TokenRefresh] Token refresh failed:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
} 