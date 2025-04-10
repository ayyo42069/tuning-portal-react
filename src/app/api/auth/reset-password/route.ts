import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { hash } from "bcrypt";
import { sendEmail } from "@/lib/email";
import { PasswordResetToken } from "@/lib/types/auth";

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
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

    const resetToken = tokenResult[0];
    if (!resetToken.email || !resetToken.username) {
      return NextResponse.json(
        { error: "Invalid token data" },
        { status: 400 }
      );
    }

    const userId = resetToken.user_id;
    const userEmail = resetToken.email;
    const username = resetToken.username;
    const tokenId = resetToken.id;

    // Hash the new password
    const hashedPassword = await hash(password, 10);

    // Use a transaction to ensure all operations succeed or fail together
    await executeQuery("START TRANSACTION");

    try {
      await executeQuery(
        "UPDATE users SET password = ? WHERE id = ?",
        [hashedPassword, userId]
      );

      await executeQuery(
        "UPDATE password_reset_tokens SET used = 1, used_at = NOW() WHERE id = ?",
        [tokenId]
      );

      await executeQuery(
        "DELETE FROM sessions WHERE user_id = ?",
        [userId]
      );

      await executeQuery("COMMIT");
    } catch (error) {
      await executeQuery("ROLLBACK");
      throw error;
    }

    // Send confirmation email
    await sendEmail({
      to: userEmail,
      subject: "Your Password Has Been Reset",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(to right, #1e40af, #3b82f6); padding: 20px; color: white; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">Password Reset Successful</h1>
          </div>
          <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <p>Hello ${username},</p>
            <p>Your password has been successfully reset.</p>
            <p>For security reasons, all your active sessions have been terminated. You will need to log in again with your new password.</p>
            <p>If you did not request this change, please contact our support team immediately as your account may have been compromised.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/auth/login" style="background: linear-gradient(to right, #1e40af, #3b82f6); color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Login to Your Account</a>
            </div>
            <p>Best regards,<br>Tuning Portal Team</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json(
      { message: "Password reset successful" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: "An error occurred while resetting your password" },
      { status: 500 }
    );
  }
}
