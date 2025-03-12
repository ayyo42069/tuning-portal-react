import nodemailer from "nodemailer";
import { v4 as uuidv4 } from "uuid";
import { executeQuery } from "./db";

// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: true,
  },
});

// Verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.error("Email server connection error:", error);
  } else {
    console.log("Email server connection established");
  }
});

// Generate a verification token and save it to the database
export async function generateVerificationToken(
  userId: number
): Promise<string> {
  // Generate a unique token
  const token = uuidv4();

  // Set expiration time (24 hours from now)
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  // Save token to database
  await executeQuery(
    "INSERT INTO email_verification_tokens (user_id, token, expires_at) VALUES (?, ?, ?)",
    [userId, token, expiresAt]
  );

  // Update user's verification token fields
  await executeQuery(
    "UPDATE users SET verification_token = ?, verification_token_expires = ? WHERE id = ?",
    [token, expiresAt, userId]
  );

  return token;
}

// Send verification email
export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<boolean> {
  try {
    const verificationUrl = `${process.env.APP_URL}/auth/verify?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Verify Your Email Address - Tuning Portal",
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #2563eb; font-size: 24px; margin-bottom: 0;">Tuning Portal</h1>
            <p style="color: #64748b; font-size: 14px;">Your one-stop solution for tuning services</p>
          </div>
          
          <div style="background-color: #f8fafc; border-radius: 6px; padding: 20px; margin-bottom: 20px;">
            <h2 style="color: #1e293b; font-size: 18px; margin-top: 0;">Email Verification</h2>
            <p style="color: #334155; line-height: 1.5;">Thank you for registering with Tuning Portal. Please verify your email address to activate your account and access all features.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Verify Email Address</a>
            </div>
            
            <div style="background-color: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 4px; padding: 12px; margin: 20px 0;">
              <p style="color: #475569; font-size: 14px; margin: 0 0 8px 0;">Your verification code:</p>
              <p style="color: #0f172a; font-family: monospace; font-size: 16px; background: #e2e8f0; padding: 8px; border-radius: 4px; text-align: center; letter-spacing: 1px;">${token}</p>
            </div>
            
            <p style="color: #64748b; font-size: 14px;">If the button doesn't work, you can also copy and paste the following link into your browser:</p>
            <p style="word-break: break-all;"><a href="${verificationUrl}" style="color: #2563eb; text-decoration: none;">${verificationUrl}</a></p>
            <p style="color: #64748b; font-size: 14px;">This link will expire in 24 hours.</p>
          </div>
          
          <div style="text-align: center; color: #94a3b8; font-size: 12px;">
            <p>If you didn't register for an account, please ignore this email.</p>
            <p>&copy; ${new Date().getFullYear()} Tuning Portal. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Verification email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending verification email:", error);
    return false;
  }
}

// Verify a token
export async function verifyEmailToken(
  token: string
): Promise<{ success: boolean; userId?: number }> {
  try {
    // Check if token exists and is not expired
    const tokenRecord = await executeQuery<any[]>(
      "SELECT user_id FROM email_verification_tokens WHERE token = ? AND expires_at > NOW()",
      [token]
    );

    if (!tokenRecord || tokenRecord.length === 0) {
      return { success: false };
    }

    const userId = tokenRecord[0].user_id;

    // Mark user as verified
    await executeQuery(
      "UPDATE users SET email_verified = TRUE, verification_token = NULL, verification_token_expires = NULL WHERE id = ?",
      [userId]
    );

    // Delete the used token
    await executeQuery(
      "DELETE FROM email_verification_tokens WHERE token = ?",
      [token]
    );

    return { success: true, userId };
  } catch (error) {
    console.error("Error verifying email token:", error);
    return { success: false };
  }
}
