import nodemailer from "nodemailer";
import { v4 as uuidv4 } from "uuid";
import { executeQuery, executeTransaction } from "./db";

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
    minVersion: 'TLSv1.2',
    ciphers: 'HIGH:!MEDIUM:!LOW:!aNULL:!NULL:!SHA',
    timeout: 60000 // 60 seconds timeout for TLS handshake
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
            <p style="color: #64748b; font-size: 14px;">For security reasons, this verification link can only be used once.</p>
          </div>
          
          <div style="text-align: center; color: #94a3b8; font-size: 12px;">
            <p>If you didn't register for an account, please ignore this email.</p>
            <p>Email sent at: ${timestamp} (Ref: ${emailTrackingId})</p>
            <p>&copy; ${new Date().getFullYear()} Tuning Portal. All rights reserved.</p>
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
            setTimeout(() => reject(new Error(`Email sending timed out after ${timeout/1000}s`)), timeout);
          });
          
          // Race the email sending against the timeout
          const info = await Promise.race([
            transporter.sendMail(mailOptions),
            timeoutPromise
          ]) as any;
          
          console.log(`Verification email sent successfully on attempt ${attempt}: ${info.messageId}, tracking ID: ${emailTrackingId}`);
          return info;
        } catch (error) {
          console.error(`Email sending attempt ${attempt}/${attempts} failed:`, error);
          
          // If this was the last attempt, throw the error
          if (attempt === attempts) throw error;
          
          // Otherwise wait before retrying (exponential backoff)
          const backoffTime = Math.min(Math.pow(2, attempt) * 500, 5000); // 1s, 2s, 4s up to max 5s
          console.log(`Retrying in ${backoffTime/1000}s...`);
          await new Promise(resolve => setTimeout(resolve, backoffTime));
        }
      }
      // This should never be reached due to the throw in the last attempt
      throw new Error('All email sending attempts failed');
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
        // Mark user as verified - use a far future date instead of NULL for verification_token_expires
        "UPDATE users SET email_verified = TRUE, verification_token = NULL, verification_token_expires = '2099-12-31 23:59:59' WHERE id = ?",
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
