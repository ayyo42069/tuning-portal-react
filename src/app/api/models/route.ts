import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

interface VehicleModel extends RowDataPacket {
  id: number;
  name: string;
  manufacturer_id: number;
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

    // Get manufacturer_id from query parameters
    const { searchParams } = new URL(request.url);
    const manufacturerId = searchParams.get('manufacturerId');

    if (!manufacturerId) {
      return NextResponse.json({ error: 'Manufacturer ID is required' }, { status: 400 });
    }

    let connection;
    try {
      connection = await pool.getConnection();

      // Check if we have any models for this manufacturer
      const [countResult] = await connection.query<RowDataPacket[]>(
        'SELECT COUNT(*) as count FROM vehicle_models WHERE manufacturer_id = ?',
        [manufacturerId]
      );
      const count = countResult[0].count;
      console.log('Models count for manufacturer', manufacturerId, ':', count);

      // If no models exist for this manufacturer, insert some test data
      if (count === 0) {
        console.log('No models found for manufacturer', manufacturerId, ', inserting test data...');
        
        // Get manufacturer name for better model names
        const [manufacturer] = await connection.query<RowDataPacket[]>(
          'SELECT name FROM manufacturers WHERE id = ?',
          [manufacturerId]
        );
        const manufacturerName = manufacturer[0]?.name || 'Unknown';

        // Insert test models based on manufacturer
        const models = [
          `${manufacturerName} Model 1`,
          `${manufacturerName} Model 2`,
          `${manufacturerName} Model 3`,
          `${manufacturerName} Model 4`,
          `${manufacturerName} Model 5`
        ];

        for (const modelName of models) {
          await connection.query(
            'INSERT INTO vehicle_models (name, manufacturer_id) VALUES (?, ?)',
            [modelName, manufacturerId]
          );
        }
        console.log('Test models inserted successfully');
      }

      // Get models for the specified manufacturer
      const [models] = await connection.query<VehicleModel[]>(
        'SELECT id, name, manufacturer_id FROM vehicle_models WHERE manufacturer_id = ? ORDER BY name',
        [manufacturerId]
      );
      console.log('Retrieved models for manufacturer', manufacturerId, ':', models);

      if (!models || !Array.isArray(models)) {
        console.error('Invalid models data:', models);
        return NextResponse.json([], { status: 200 });
      }

      return NextResponse.json(models);
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
    console.error('Unexpected error in models API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred', details: error.message },
      { status: 500 }
    );
  }
}