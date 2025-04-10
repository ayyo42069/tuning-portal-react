import { NextRequest, NextResponse } from "next/server";
import { db, executeQuery } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { sendEmail } from "@/lib/email";
import { User } from "@/lib/types/auth";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if user exists
    const user = await executeQuery<User[]>(
      "SELECT id, username FROM users WHERE email = ? AND is_active = 1",
      [email]
    );

    if (user.length === 0) {
      // Don't reveal if user exists or not for security reasons
      return NextResponse.json(
        {
          message:
            "If your email is registered, you will receive a password reset link",
        },
        { status: 200 }
      );
    }

    // Generate a unique token
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token valid for 1 hour

    // Store the token in the database
    await executeQuery(
      "INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)",
      [user[0].id, token, expiresAt]
    );

    // Create reset link
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;

    // Send email with reset link
    await sendEmail({
      to: email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(to right, #1e40af, #3b82f6); padding: 20px; color: white; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">Password Reset</h1>
          </div>
          <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <p>Hello ${user[0].username},</p>
            <p>We received a request to reset your password. If you didn't make this request, you can ignore this email.</p>
            <p>To reset your password, click the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background: linear-gradient(to right, #1e40af, #3b82f6); color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Reset Password</a>
            </div>
            <p>This link will expire in 1 hour.</p>
            <p>If the button doesn't work, copy and paste this URL into your browser:</p>
            <p style="word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 4px;">${resetLink}</p>
            <p>Best regards,<br>Tuning Portal Team</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json(
      {
        message:
          "If your email is registered, you will receive a password reset link",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Password reset request error:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}
