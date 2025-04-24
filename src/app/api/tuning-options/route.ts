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

      // Check if we have any tuning options
      const [countResult] = await connection.query<RowDataPacket[]>(
        'SELECT COUNT(*) as count FROM tuning_options'
      );
      const count = countResult[0].count;
      console.log('Tuning options count:', count);

      // If no tuning options exist, insert some test data
      if (count === 0) {
        console.log('No tuning options found, inserting test data...');
        await connection.query(
          `INSERT INTO tuning_options (name, description, credit_cost) VALUES 
          ('Stage 1 Tune', 'Basic performance tune with increased power and torque', 5),
          ('Stage 2 Tune', 'Advanced performance tune with optimized fuel maps', 10),
          ('Stage 3 Tune', 'Aggressive performance tune with maximum power output', 15),
          ('Eco Tune', 'Fuel efficiency optimization tune', 5),
          ('Race Tune', 'Track-focused performance tune', 20),
          ('Daily Driver Tune', 'Balanced performance and reliability tune', 8),
          ('Winter Tune', 'Cold weather optimization tune', 5),
          ('Summer Tune', 'Hot weather optimization tune', 5),
          ('Off-Road Tune', 'Terrain-specific performance tune', 12),
          ('Towing Tune', 'Heavy load optimization tune', 10)`
        );
        console.log('Test data inserted successfully');
      }

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