import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

interface TuningOption extends RowDataPacket {
  id: number;
  name: string;
  description: string;
  credit_cost: number;
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      console.log('No auth token found in cookies');
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    try {
      const user = await verifyToken(token);
      if (!user) {
        console.log('Invalid token');
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
    } catch (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }

    let connection;
    try {
      connection = await pool.getConnection();

      // Get all tuning options
      const [tuningOptions] = await connection.query<TuningOption[]>(
        'SELECT id, name, description, credit_cost FROM tuning_options ORDER BY name'
      );
      console.log('Retrieved tuning options:', tuningOptions);

      if (!tuningOptions || !Array.isArray(tuningOptions)) {
        console.error('Invalid tuning options data:', tuningOptions);
        return NextResponse.json([], { status: 200 });
      }

      return NextResponse.json(tuningOptions);
    } catch (dbError: any) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Database error occurred', details: dbError.message },
        { status: 500 }
      );
    } finally {
      if (connection) connection.release();
    }
  } catch (error: any) {
    console.error('Unexpected error in tuning options API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred', details: error.message },
      { status: 500 }
    );
  }
}