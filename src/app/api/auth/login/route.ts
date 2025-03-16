import { NextRequest, NextResponse } from "next/server";
import { getRow } from "@/lib/db";
import {
  verifyPassword,
  generateToken,
  setAuthCookie,
  createSession,
} from "@/lib/auth";
import { serialize } from "cookie";
import { logAuthSuccess, logAuthFailure } from "@/lib/securityMiddleware";

interface LoginRequest {
  username: string;
  password: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  role: "user" | "admin";
  email_verified: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { username, password } = body;

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    // Find user in database
    const user = await getRow<User>("SELECT * FROM users WHERE username = ?", [
      username,
    ]);

    if (!user) {
      // Log failed login attempt
      await logAuthFailure(username, request, "User not found");
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      // Log failed login attempt due to invalid password
      await logAuthFailure(username, request, "Invalid password");
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Check if email is verified
    if (!user.email_verified) {
      return NextResponse.json(
        {
          error: "Please verify your email before logging in",
          emailVerificationRequired: true,
          email: user.email,
        },
        { status: 403 }
      );
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });

    // Create a session for the user
    const sessionId = await createSession(user.id);

    // Set auth cookie with the token
    const authCookieHeader = setAuthCookie(token);

    // Set session cookie
    const sessionCookieHeader = serialize("session_id", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    // Log successful login
    await logAuthSuccess(user.id, request);

    // Return success response with user info (excluding password)
    const { password: _, ...userWithoutPassword } = user;

    const response = NextResponse.json(
      {
        success: true,
        user: userWithoutPassword,
      },
      { status: 200 }
    );

    // Add the cookies to the response
    response.headers.append("Set-Cookie", authCookieHeader);
    response.headers.append("Set-Cookie", sessionCookieHeader);

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An error occurred during login" },
      { status: 500 }
    );
  }
}
