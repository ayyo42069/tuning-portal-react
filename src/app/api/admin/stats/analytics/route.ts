import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { executeQuery } from '@/lib/db';
import { format, subDays, subWeeks, subMonths, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

export async function GET(request: Request) {
  // Verify authentication
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  
  if (!token) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const decodedToken = await verifyToken(token);
    if (!decodedToken || decodedToken.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get period from query params
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || 'weekly';
    
    let dateRanges = [];
    const now = new Date();
    
    // Define date ranges based on period
    if (period === 'daily') {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = subDays(now, i);
        const start = startOfDay(date);
        const end = endOfDay(date);
        const label = format(date, 'EEE');
        dateRanges.push({ start, end, label });
      }
    } else if (period === 'weekly') {
      // Last 4 weeks
      for (let i = 3; i >= 0; i--) {
        const date = subWeeks(now, i);
        const start = startOfWeek(date, { weekStartsOn: 1 });
        const end = endOfWeek(date, { weekStartsOn: 1 });
        const label = `Week ${4-i}`;
        dateRanges.push({ start, end, label });
      }
    } else if (period === 'monthly') {
      // Last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = subMonths(now, i);
        const start = startOfMonth(date);
        const end = endOfMonth(date);
        const label = format(date, 'MMM');
        dateRanges.push({ start, end, label });
      }
    }
    
    const results = await Promise.all(
      dateRanges.map(async (range) => {
        // Query for new users in the period
        const usersQuery = `
          SELECT COUNT(*) as count 
          FROM users 
          WHERE created_at BETWEEN ? AND ?
        `;
        const usersResult = await executeQuery<{count: number}[]>(usersQuery, [
          format(range.start, 'yyyy-MM-dd HH:mm:ss'),
          format(range.end, 'yyyy-MM-dd HH:mm:ss')
        ]);
        
        // Query for tuning files processed in the period
        const filesQuery = `
          SELECT COUNT(*) as count 
          FROM tuning_files 
          WHERE status = 'completed' AND completed_at BETWEEN ? AND ?
        `;
        const filesResult = await executeQuery<{count: number}[]>(filesQuery, [
          format(range.start, 'yyyy-MM-dd HH:mm:ss'),
          format(range.end, 'yyyy-MM-dd HH:mm:ss')
        ]);
        
        // Query for revenue (credits purchased) in the period
        const revenueQuery = `
          SELECT SUM(amount) as total 
          FROM credit_purchases 
          WHERE created_at BETWEEN ? AND ?
        `;
        const revenueResult = await executeQuery<{total: number}[]>(revenueQuery, [
          format(range.start, 'yyyy-MM-dd HH:mm:ss'),
          format(range.end, 'yyyy-MM-dd HH:mm:ss')
        ]);
        
        return {
          label: range.label,
          users: usersResult[0]?.count || 0,
          files: filesResult[0]?.count || 0,
          revenue: revenueResult[0]?.total || 0
        };
      })
    );
    
    return NextResponse.json({ 
      success: true, 
      data: results
    });
    
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
} 