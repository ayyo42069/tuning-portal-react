import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

interface ManufacturerCount extends RowDataPacket {
  count: number;
}

interface Manufacturer extends RowDataPacket {
  id: number;
  name: string;
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

      // Check if we have any manufacturers
      const [countResult] = await connection.query<ManufacturerCount[]>('SELECT COUNT(*) as count FROM manufacturers');
      const count = countResult[0].count;
      console.log('Manufacturer count:', count);

      // If no manufacturers exist, insert some test data
      if (count === 0) {
        console.log('No manufacturers found, inserting test data...');
        await connection.query(
          `INSERT INTO manufacturers (name) VALUES 
          ('BMW'),
          ('Mercedes-Benz'),
          ('Audi'),
          ('Volkswagen'),
          ('Porsche'),
          ('Toyota'),
          ('Honda'),
          ('Nissan'),
          ('Ford'),
          ('Chevrolet')`
        );
        console.log('Test data inserted successfully');
      }

      // Get all manufacturers
      const [manufacturers] = await connection.query<Manufacturer[]>('SELECT id, name FROM manufacturers ORDER BY name');
      console.log('Retrieved manufacturers:', manufacturers);

      if (!manufacturers || !Array.isArray(manufacturers)) {
        console.error('Invalid manufacturers data:', manufacturers);
        return NextResponse.json([], { status: 200 });
      }

      return NextResponse.json(manufacturers);
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
    console.error('Unexpected error in manufacturers API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred', details: error.message },
      { status: 500 }
    );
  }
}