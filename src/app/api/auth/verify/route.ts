import { NextRequest, NextResponse } from "next/server";
import { verifyEmailToken } from "@/lib/email";
import { generateToken, setAuthCookie } from "@/lib/auth";
import { getRow } from "@/lib/db";
import {
  rateLimitByIpAndIdentifier,
  logRateLimitEvent,
} from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  try {
    // Get token from query parameters
    const token = request.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Verification token is required" },
        { status: 400 }
      );
    }

    // Verify the token
    const result = await verifyEmailToken(token);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid or expired verification token" },
        { status: 400 }
      );
    }

    // Get user data for token generation
    const user = await getRow<any>(
      "SELECT id, username, email, role FROM users WHERE id = ?",
      [result.userId]
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate authentication token
    const authToken = generateToken(user);

    // Create response with auth cookie
    const response = NextResponse.json({
      success: true,
      message: "Email verified successfully",
    });

    // Set authentication cookie
    const authCookieHeader = setAuthCookie(authToken);

    // Add the cookie to the response
    response.headers.append("Set-Cookie", authCookieHeader);

    return response;
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { error: "An error occurred during email verification" },
      { status: 500 }
    );
  }
}
