import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { executeQuery } from '@/lib/db';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') as 'daily' | 'weekly' | 'monthly' || 'weekly';

    let dateRanges = [];
    const now = new Date();

    if (period === 'daily') {
      // Get data for the last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        dateRanges.push({
          start: startOfDay(date),
          end: endOfDay(date)
        });
      }
    } else if (period === 'weekly') {
      // Get data for the last 4 weeks
      for (let i = 3; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - (i * 7));
        dateRanges.push({
          start: startOfWeek(date),
          end: endOfWeek(date)
        });
      }
    } else {
      // Get data for the last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        dateRanges.push({
          start: startOfMonth(date),
          end: endOfMonth(date)
        });
      }
    }

    const analyticsData = await Promise.all(dateRanges.map(async (range) => {
      // Get files for this period
      const filesResult = await executeQuery<any[]>(
        `SELECT COUNT(*) as count 
         FROM ecu_files 
         WHERE created_at BETWEEN ? AND ?`,
        [range.start, range.end]
      );
      const files = filesResult[0]?.count || 0;

      // Get revenue for this period
      const revenueResult = await executeQuery<any[]>(
        `SELECT SUM(amount) as total 
         FROM payments 
         WHERE status = 'completed' 
         AND created_at BETWEEN ? AND ?`,
        [range.start, range.end]
      );
      const revenue = revenueResult[0]?.total || 0;

      return {
        label: format(range.start, period === 'daily' ? 'EEE' : period === 'weekly' ? "'Week' w" : 'MMM'),
        files,
        revenue
      };
    }));

    return NextResponse.json({ data: analyticsData });
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
} 