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

    // Get all manufacturers
    const [manufacturers] = await executeQuery<any[]>(
      'SELECT id, name FROM manufacturers ORDER BY name'
    );

    if (!manufacturers || !Array.isArray(manufacturers)) {
      return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(manufacturers);
  } catch (error) {
    console.error('Error fetching manufacturers:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching manufacturers' },
      { status: 500 }
    );
  }
}