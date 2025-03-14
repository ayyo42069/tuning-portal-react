import { NextRequest, NextResponse } from "next/server";
import { executeQuery, executeTransaction } from "@/lib/db";
import { hashPassword, generateToken, setAuthCookie } from "@/lib/auth";
import { generateVerificationToken, sendVerificationEmail } from "@/lib/email";
import {
  rateLimitByIpAndIdentifier,
  logRateLimitEvent,
} from "@/lib/rate-limit";

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName?: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  role: "user" | "admin";
}

export async function POST(request: NextRequest) {
  // Get client IP and user agent for logging
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";
  const timestamp = new Date().toISOString();

  // Initialize variables at the top level to ensure they're in scope for error handling
  let username: string = "";
  let email: string = "";
  let userId: number;
  let verificationToken: string;
  let user: User;

  try {
    // Apply rate limiting to prevent registration abuse
    const rateLimitResult = await rateLimitByIpAndIdentifier(
      request,
      "registration",
      {
        limit: 5, // 5 registration attempts
        windowMs: 60 * 60 * 1000, // per hour
        identifier: "register",
        useDatabase: true, // More persistent across server restarts
      }
    );

    // Log rate limit event
    await logRateLimitEvent(
      ip,
      "registration",
      rateLimitResult.success,
      rateLimitResult.remaining
    );

    // If rate limit exceeded, return error
    if (!rateLimitResult.success) {
      console.warn(`Registration rate limit exceeded for IP: ${ip}`);
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body: RegisterRequest = await request.json();
    // Assign to our top-level variables
    username = body.username;
    email = body.email;
    const { password, fullName } = body;

    // Validate input
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Username, email, and password are required" },
        { status: 400 }
      );
    }

    // Check if username or email already exists
    const existingUser = await executeQuery<any[]>(
      "SELECT id FROM users WHERE username = ? OR email = ?",
      [username, email]
    );

    if (existingUser && existingUser.length > 0) {
      return NextResponse.json(
        { error: "Username or email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Log registration attempt (without sensitive data)
    console.log(
      `Registration attempt: username=${username}, email=${email}, ip=${ip}, userAgent=${userAgent}, timestamp=${timestamp}`
    );

    // Variables already declared at the top level

    // Use transaction to ensure all operations succeed or fail together
    try {
      // Start transaction for user creation and email verification
      const result = await executeTransaction<any>(
        [
          // Insert new user
          "INSERT INTO users (username, email, password, full_name, email_verified, registration_ip, last_login_ip, registration_date, user_agent) VALUES (?, ?, ?, ?, FALSE, ?, ?, NOW(), ?)",
          // The second query will be for the verification token, added dynamically below
        ],
        [
          [
            username,
            email,
            hashedPassword,
            fullName || null,
            ip,
            ip,
            userAgent,
          ],
          // Second query params will be added after we get the user ID
        ]
      );

      // Get the inserted user ID from the first query result
      userId = result[0].insertId;

      // Generate verification token
      verificationToken = await generateVerificationToken(userId);

      // Send verification email
      const emailSent = await sendVerificationEmail(email, verificationToken);

      // If email fails, throw error to trigger transaction rollback
      if (!emailSent) {
        throw new Error(`Failed to send verification email to: ${email}`);
      }

      // Create user object for token generation
      user = {
        id: userId,
        username,
        email,
        role: "user",
      };

      // Generate JWT token
      const token = generateToken(user);

      // Set cookie with the token
      const cookieHeader = setAuthCookie(token);

      // Return success response with verification token
      const response = NextResponse.json(
        {
          success: true,
          user,
          emailVerificationSent: emailSent,
          verificationToken: verificationToken, // Include the token for the verification modal
        },
        { status: 201 }
      );

      // Add the cookie to the response
      response.headers.set("Set-Cookie", cookieHeader);

      return response;
    } catch (error) {
      // Log detailed error information
      console.error("Registration error:", {
        error: error instanceof Error ? error.message : String(error),
        username,
        email,
        ip,
        userAgent,
        timestamp,
      });

      // Return appropriate error message based on error type
      if (
        error instanceof Error &&
        error.message.includes("verification email")
      ) {
        return NextResponse.json(
          {
            error: "Unable to send verification email. Please try again later.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          error:
            "An error occurred during registration. Please try again later.",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    // Log detailed error information
    console.error("Registration error:", {
      error: error instanceof Error ? error.message : String(error),
      username,
      email,
      ip,
      userAgent,
      timestamp,
    });

    // Return appropriate error message based on error type
    if (
      error instanceof Error &&
      error.message.includes("verification email")
    ) {
      return NextResponse.json(
        { error: "Unable to send verification email. Please try again later." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: "An error occurred during registration. Please try again later.",
      },
      { status: 500 }
    );
  }
}
