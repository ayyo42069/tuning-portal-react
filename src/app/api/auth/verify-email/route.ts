import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { sign } from "jsonwebtoken";

interface VerificationToken {
  id: number;
  user_id: number;
  token: string;
  expires_at: Date;
}

export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { message: "Verification code is required" },
        { status: 400 }
      );
    }

    // Find the verification token
    const result = await db.query(
      "SELECT * FROM email_verification_tokens WHERE token = ?",
      [code]
    ) as VerificationToken[];

    const token = result[0];

    if (!token) {
      return NextResponse.json(
        { message: "Invalid verification code" },
        { status: 400 }
      );
    }

    if (new Date(token.expires_at) < new Date()) {
      return NextResponse.json(
        { message: "Verification code has expired" },
        { status: 400 }
      );
    }

    // Update user's email verification status
    await db.query(
      "UPDATE users SET email_verified = TRUE WHERE id = ?",
      [token.user_id]
    );

    // Delete the used token
    await db.query(
      "DELETE FROM email_verification_tokens WHERE id = ?",
      [token.id]
    );

    // Create a session for the user
    const sessionToken = sign(
      { userId: token.user_id },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    // Set the session cookie
    const cookieStore = await cookies();
    cookieStore.set("session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 