import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/authMiddleware";
import { generateToken, setAuthCookie } from "@/lib/auth";

/**
 * POST handler for refreshing the authentication token
 * This endpoint is used to refresh the JWT token when it's about to expire
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate the user
    const authResult = await authenticateUser(request);
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: authResult.error || "Authentication required" },
        { status: authResult.status }
      );
    }
    
    // Generate a new token
    const newToken = generateToken({
      id: authResult.user.id,
      username: authResult.user.username,
      email: authResult.user.email,
      role: authResult.user.role as "user" | "admin" // Ensure role is properly typed
    });
    
    // Create response
    const response = NextResponse.json({ 
      success: true 
    });
    
    // Set the new auth token cookie
    const authCookieHeader = setAuthCookie(newToken);
    response.headers.append("Set-Cookie", authCookieHeader);
    
    return response;
  } catch (error) {
    console.error("Token refresh failed:", error);
    return NextResponse.json(
      { error: "An error occurred while refreshing the token" },
      { status: 500 }
    );
  }
} 