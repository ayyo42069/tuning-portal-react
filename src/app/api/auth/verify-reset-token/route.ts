import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { PasswordResetToken } from "@/lib/types/auth";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Check if token exists and is not expired
    const tokenResult = await executeQuery<PasswordResetToken[]>(
      `SELECT t.id, t.user_id, t.expires_at, u.username, u.email 
       FROM password_reset_tokens t 
       JOIN users u ON t.user_id = u.id 
       WHERE t.token = ? AND t.used = 0 AND t.expires_at > NOW()`,
      [token]
    );

    if (tokenResult.length === 0) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    // Token is valid
    return NextResponse.json(
      {
        valid: true,
        email: tokenResult[0].email,
        username: tokenResult[0].username,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json(
      { error: "An error occurred while verifying the token" },
      { status: 500 }
    );
  }
}
