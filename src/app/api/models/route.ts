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

    // Get manufacturer ID from query params
    const { searchParams } = new URL(request.url);
    const manufacturerId = searchParams.get('manufacturerId');

    if (!manufacturerId) {
      return NextResponse.json({ error: 'Manufacturer ID is required' }, { status: 400 });
    }

    // Get models for the manufacturer
    const [models] = await executeQuery<any[]>(
      'SELECT id, name, manufacturer_id FROM vehicle_models WHERE manufacturer_id = ? ORDER BY name',
      [manufacturerId]
    );

    if (!models || !Array.isArray(models)) {
      return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(models);
  } catch (error) {
    console.error('Error fetching models:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching models' },
      { status: 500 }
    );
  }
}