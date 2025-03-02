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

    // Check if user is admin
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Parse query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    
    // Build the query with optional filters
    let query = `
      SELECT ct.id, ct.user_id, u.username, ct.amount, ct.transaction_type, ct.stripe_payment_id as reason, ct.created_at 
      FROM credit_transactions ct
      JOIN users u ON ct.user_id = u.id
      WHERE 1=1
    `;
    
    const queryParams: any[] = [];
    
    if (type && type !== 'all') {
      query += ` AND ct.transaction_type = ?`;
      queryParams.push(type);
    }
    
    if (startDate) {
      query += ` AND DATE(ct.created_at) >= DATE(?)`;
      queryParams.push(startDate);
    }
    
    if (endDate) {
      query += ` AND DATE(ct.created_at) <= DATE(?)`;
      queryParams.push(endDate);
    }
    
    query += ` ORDER BY ct.created_at DESC`;

    // Get credit transactions with filters
    const transactions = await executeQuery<any[]>(query, queryParams);

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