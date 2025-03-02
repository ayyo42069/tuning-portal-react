import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get all tuning options
    const tuningOptions = await executeQuery<any[]>(
      'SELECT id, name, description, credit_cost FROM tuning_options ORDER BY name'
    );

    return NextResponse.json(tuningOptions);
  } catch (error) {
    console.error('Error fetching tuning options:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching tuning options' },
      { status: 500 }
    );
  }
}