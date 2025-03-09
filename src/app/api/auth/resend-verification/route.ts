import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, getRow } from '@/lib/db';
import { generateVerificationToken, sendVerificationEmail } from '@/lib/email';

interface ResendVerificationRequest {
  email: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ResendVerificationRequest = await request.json();
    const { email } = body;

    // Validate input
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user in database
    const user = await getRow<{ id: number; email_verified: boolean }>(
      'SELECT id, email_verified FROM users WHERE email = ?',
      [email]
    );

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if email is already verified
    if (user.email_verified) {
      return NextResponse.json(
        { error: 'Email is already verified' },
        { status: 400 }
      );
    }

    // Delete any existing verification tokens for this user
    await executeQuery(
      'DELETE FROM email_verification_tokens WHERE user_id = ?',
      [user.id]
    );

    // Generate new verification token and send verification email
    const verificationToken = await generateVerificationToken(user.id);
    const emailSent = await sendVerificationEmail(email, verificationToken);

    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send verification email' },
        { status: 500 }
      );
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Verification email sent successfully'
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { error: 'An error occurred while resending verification email' },
      { status: 500 }
    );
  }
}