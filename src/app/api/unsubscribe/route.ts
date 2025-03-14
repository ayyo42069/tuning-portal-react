import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get email from query parameters
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    // Check if the email exists in our database
    const userResult = await executeQuery<any[]>(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (!userResult || userResult.length === 0) {
      return NextResponse.json(
        { error: 'Email not found' },
        { status: 404 }
      );
    }

    const userId = userResult[0].id;

    // Update user's unsubscribe status
    await executeQuery(
      'UPDATE users SET unsubscribed = TRUE, unsubscribed_date = NOW(), email_consent = FALSE WHERE id = ?',
      [userId]
    );

    // Log the unsubscribe action
    await executeQuery(
      'INSERT INTO user_activity_logs (user_id, activity_type, details) VALUES (?, ?, ?)',
      [userId, 'unsubscribe', 'User unsubscribed from all emails']
    );

    // Redirect to a confirmation page
    return NextResponse.redirect(new URL('/unsubscribe/success', request.url));
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}