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

    // Get user's credit transactions
    const transactions = await executeQuery<any[]>(
      `SELECT id, user_id, amount, transaction_type, created_at 
       FROM credit_transactions 
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
      [user.id]
    );

    return NextResponse.json({
      success: true,
      transactions: transactions || [],
    });
  } catch (error) {
    console.error('Error fetching credit transactions:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching credit transactions' },
      { status: 500 }
    );
  }
}