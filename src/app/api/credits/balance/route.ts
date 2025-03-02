import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get user's credit balance
    const [result] = await executeQuery<any>(
      'SELECT credits FROM user_credits WHERE user_id = ?',
      [user.id]
    );

    const credits = result ? result.credits : 0;

    return NextResponse.json({
      credits,
    });
  } catch (error) {
    console.error('Error fetching credit balance:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching credit balance' },
      { status: 500 }
    );
  }
}