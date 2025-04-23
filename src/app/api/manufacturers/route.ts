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

    // Check if we have any manufacturers
    const [count] = await executeQuery<any[]>(
      'SELECT COUNT(*) as count FROM manufacturers'
    );
    console.log('Manufacturer count:', count[0].count);

    // If no manufacturers exist, insert some test data
    if (count[0].count === 0) {
      console.log('No manufacturers found, inserting test data...');
      await executeQuery(
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
    const [manufacturers] = await executeQuery<any[]>(
      'SELECT id, name FROM manufacturers ORDER BY name'
    );
    console.log('Retrieved manufacturers:', manufacturers);

    if (!manufacturers || !Array.isArray(manufacturers)) {
      console.error('Invalid manufacturers data:', manufacturers);
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