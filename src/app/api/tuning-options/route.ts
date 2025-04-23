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

    // Get model ID from query params
    const { searchParams } = new URL(request.url);
    const modelId = searchParams.get('modelId');

    if (!modelId) {
      return NextResponse.json({ error: 'Model ID is required' }, { status: 400 });
    }

    // Get tuning options for the model
    const [tuningOptions] = await executeQuery<any[]>(
      `SELECT t.id, t.name, t.description, t.credit_cost 
       FROM tuning_options t
       INNER JOIN model_tuning_options mto ON t.id = mto.tuning_option_id
       WHERE mto.model_id = ?
       ORDER BY t.name`,
      [modelId]
    );

    if (!tuningOptions || !Array.isArray(tuningOptions)) {
      return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(tuningOptions);
  } catch (error) {
    console.error('Error fetching tuning options:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching tuning options' },
      { status: 500 }
    );
  }
}