import nodemailer from "nodemailer";
import { v4 as uuidv4 } from "uuid";
import { executeQuery, executeTransaction } from "./db";

// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: true,
    minVersion: "TLSv1.2",
    ciphers: "HIGH:!MEDIUM:!LOW:!aNULL:!NULL:!SHA",
    timeout: 60000, // 60 seconds timeout for TLS handshake
  },
  connectionTimeout: 60000, // 60 seconds connection timeout
  greetingTimeout: 30000, // 30 seconds greeting timeout
  socketTimeout: 60000, // 60 seconds socket timeout
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
  try {
    // Generate a unique token with higher entropy
    const token = uuidv4();

    // Set expiration time (24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Delete any existing tokens for this user first to prevent token accumulation
    await executeQuery(
      "DELETE FROM email_verification_tokens WHERE user_id = ?",
      [userId]
    );

    // Save token to database with transaction to ensure data consistency
    await executeQuery(
      "INSERT INTO email_verification_tokens (user_id, token, expires_at) VALUES (?, ?, ?)",
      [userId, token, expiresAt]
    );

    // Update user's verification token fields
    await executeQuery(
      "UPDATE users SET verification_token = ?, verification_token_expires = ? WHERE id = ?",
      [token, expiresAt, userId]
    );

    // Log token generation for audit purposes (without exposing the actual token)
    console.log(
      `Verification token generated for user ${userId}, expires at ${expiresAt}`
    );

    return token;
  } catch (error) {
    console.error("Error generating verification token:", error);
    throw new Error("Failed to generate verification token");
  }
}

// Send verification email with enhanced security and tracking
export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<boolean> {
  try {
    // Generate a secure verification URL with token
    const verificationUrl = `${process.env.APP_URL}/auth/verify?token=${token}`;

    // Add a unique tracking ID for this email send attempt
    const emailTrackingId = uuidv4().substring(0, 8);

    // Get the current timestamp for logging
    const timestamp = new Date().toISOString();

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Verify Your Email Address - Tuning Portal",
      headers: {
        "X-Priority": "1", // High priority
        "X-Tracking-ID": emailTrackingId,
      },
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 12px; border: 1px solid rgba(59, 130, 246, 0.2); box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1); background-color: #0f172a; color: #f8fafc;">
          <!-- Header with gradient background -->
          <div style="text-align: center; margin-bottom: 24px; padding: 20px; background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%); border-radius: 8px; box-shadow: 0 4px 12px rgba(30, 64, 175, 0.3);">
            <h1 style="color: white; font-size: 24px; margin-bottom: 4px; font-weight: 700;">Tuning Portal</h1>
            <p style="color: rgba(255, 255, 255, 0.8); font-size: 14px;">Your one-stop solution for tuning services</p>
          </div>
          
          <div style="background-color: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid rgba(255, 255, 255, 0.1);">
            <h2 style="color: white; font-size: 20px; margin-top: 0; margin-bottom: 16px; font-weight: 600;">Email Verification</h2>
            <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6; margin-bottom: 24px;">Thank you for registering with Tuning Portal. Please verify your email address to activate your account and access all features.</p>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${verificationUrl}" style="background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3); transition: all 0.3s ease;">Verify Email Address</a>
            </div>
            
            <div style="background-color: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 8px; padding: 16px; margin: 24px 0;">
              <p style="color: rgba(255, 255, 255, 0.8); font-size: 14px; margin: 0 0 8px 0;">Your verification code:</p>
              <p style="color: white; font-family: monospace; font-size: 18px; background: rgba(6, 182, 212, 0.2); padding: 12px; border-radius: 6px; text-align: center; letter-spacing: 2px; border: 1px solid rgba(6, 182, 212, 0.3);">${token}</p>
            </div>
            
            <p style="color: rgba(255, 255, 255, 0.7); font-size: 14px; margin-bottom: 8px;">If the button doesn't work, you can also copy and paste the following link into your browser:</p>
            <p style="word-break: break-all; margin-bottom: 16px;"><a href="${verificationUrl}" style="color: #38bdf8; text-decoration: none;">${verificationUrl}</a></p>
            <p style="color: rgba(255, 255, 255, 0.7); font-size: 14px; margin-bottom: 8px;">This link will expire in 24 hours.</p>
            <p style="color: rgba(255, 255, 255, 0.7); font-size: 14px;">For security reasons, this verification link can only be used once.</p>
          </div>
          
          <div style="text-align: center; color: rgba(255, 255, 255, 0.5); font-size: 12px; padding-top: 16px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
            <p style="margin-bottom: 8px;">If you didn't register for an account, please ignore this email.</p>
            <p style="margin-bottom: 8px;">Email sent at: ${timestamp} (Ref: ${emailTrackingId})</p>
            <p style="margin-bottom: 0;">&copy; ${new Date().getFullYear()} Tuning Portal. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    // Log email attempt (without exposing the full token)
    console.log(
      `Sending verification email to ${email} with tracking ID ${emailTrackingId}`
    );

    // Send the email with improved timeout and retry mechanism
    const sendWithRetry = async (attempts = 3, timeout = 30000) => {
      for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
          // Create a timeout promise that rejects after specified time
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(
              () =>
                reject(
                  new Error(`Email sending timed out after ${timeout / 1000}s`)
                ),
              timeout
            );
          });

          // Race the email sending against the timeout
          const info = (await Promise.race([
            transporter.sendMail(mailOptions),
            timeoutPromise,
          ])) as any;

          console.log(
            `Verification email sent successfully on attempt ${attempt}: ${info.messageId}, tracking ID: ${emailTrackingId}`
          );
          return info;
        } catch (error) {
          console.error(
            `Email sending attempt ${attempt}/${attempts} failed:`,
            error
          );

          // If this was the last attempt, throw the error
          if (attempt === attempts) throw error;

          // Otherwise wait before retrying (exponential backoff)
          const backoffTime = Math.min(Math.pow(2, attempt) * 500, 5000); // 1s, 2s, 4s up to max 5s
          console.log(`Retrying in ${backoffTime / 1000}s...`);
          await new Promise((resolve) => setTimeout(resolve, backoffTime));
        }
      }
      // This should never be reached due to the throw in the last attempt
      throw new Error("All email sending attempts failed");
    };

    // Execute the send with retry function
    const info = await sendWithRetry();

    console.log(
      `Verification email sent successfully: ${info.messageId}, tracking ID: ${emailTrackingId}`
    );
    return true;
  } catch (error) {
    console.error("Error sending verification email:", error);
    return false;
  }
}

// Verify a token with enhanced security checks
// Send a generic email with customizable content
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  try {
    // Add a unique tracking ID for this email
    const emailTrackingId = uuidv4().substring(0, 8);

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
      headers: {
        "X-Priority": "1", // High priority
        "X-Tracking-ID": emailTrackingId,
      },
    };

    // Send the email with improved timeout and retry mechanism
    const sendWithRetry = async (attempts = 3, timeout = 30000) => {
      for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
          // Create a timeout promise that rejects after specified time
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(
              () =>
                reject(
                  new Error(`Email sending timed out after ${timeout / 1000}s`)
                ),
              timeout
            );
          });

          // Race the email sending against the timeout
          const info = (await Promise.race([
            transporter.sendMail(mailOptions),
            timeoutPromise,
          ])) as any;

          console.log(
            `Email sent successfully on attempt ${attempt}: ${info.messageId}, tracking ID: ${emailTrackingId}`
          );
          return info;
        } catch (error) {
          console.error(
            `Email sending attempt ${attempt}/${attempts} failed:`,
            error
          );

          // If this was the last attempt, throw the error
          if (attempt === attempts) throw error;

          // Otherwise wait before retrying (exponential backoff)
          const backoffTime = Math.min(Math.pow(2, attempt) * 500, 5000); // 1s, 2s, 4s up to max 5s
          console.log(`Retrying in ${backoffTime / 1000}s...`);
          await new Promise((resolve) => setTimeout(resolve, backoffTime));
        }
      }
      // This should never be reached due to the throw in the last attempt
      throw new Error("All email sending attempts failed");
    };

    // Execute the send with retry function
    await sendWithRetry();
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

export async function verifyEmailToken(
  token: string
): Promise<{ success: boolean; userId?: number; reason?: string }> {
  try {
    // Validate token format first (basic validation to prevent SQL injection)
    if (!token || token.length < 10 || !/^[a-zA-Z0-9-]+$/.test(token)) {
      return { success: false, reason: "invalid_format" };
    }

    // Check if token exists and is not expired
    const tokenRecord = await executeQuery<any[]>(
      "SELECT user_id, expires_at FROM email_verification_tokens WHERE token = ?",
      [token]
    );

    if (!tokenRecord || tokenRecord.length === 0) {
      // Check if token was already used (for better error messaging)
      const userWithEmail = await executeQuery<any[]>(
        "SELECT id FROM users WHERE verification_token = ?",
        [token]
      );

      if (userWithEmail && userWithEmail.length > 0) {
        return { success: false, reason: "already_verified" };
      }

      return { success: false, reason: "not_found" };
    }

    // Check if token is expired
    const expiresAt = new Date(tokenRecord[0].expires_at);
    if (expiresAt < new Date()) {
      return { success: false, reason: "expired" };
    }

    const userId = tokenRecord[0].user_id;

    // Use a transaction to ensure data consistency
    await executeTransaction(
      [
        // Mark user as verified and set verification_token_expires to current timestamp
        "UPDATE users SET email_verified = TRUE, verification_token = NULL, verification_token_expires = CURRENT_TIMESTAMP WHERE id = ?",
        // Delete the used token
        "DELETE FROM email_verification_tokens WHERE token = ?",
      ],
      [[userId], [token]]
    );

    // Log successful verification
    console.log(`Email verified successfully for user ${userId}`);

    return { success: true, userId };
  } catch (error) {
    console.error("Error verifying email token:", error);
    return { success: false, reason: "server_error" };
  }
}
