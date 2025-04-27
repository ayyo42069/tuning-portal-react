import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // Get total files and success rate
    const [fileStats] = await db.query(`
      SELECT 
        COUNT(*) as total_files,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_files,
        AVG(TIMESTAMPDIFF(HOUR, created_at, updated_at)) as avg_process_time
      FROM ecu_files
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);

    // Get recent activities from notifications and feedback events
    const [activities] = await db.query(`
      (SELECT 
        id,
        'info' as type,
        message,
        created_at as timestamp
      FROM notifications
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      ORDER BY created_at DESC
      LIMIT 5)
      UNION ALL
      (SELECT 
        id,
        type,
        message,
        created_at as timestamp
      FROM feedback_events
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      ORDER BY created_at DESC
      LIMIT 5)
      ORDER BY timestamp DESC
      LIMIT 5
    `);

    const stats = fileStats[0];
    const successRate = stats.completed_files / stats.total_files * 100;

    return NextResponse.json({
      totalFiles: stats.total_files,
      successRate: Math.round(successRate),
      avgProcessTime: Math.round(stats.avg_process_time),
      activities: activities.map((activity: any) => ({
        id: activity.id,
        type: activity.type,
        message: activity.message,
        timestamp: new Date(activity.timestamp).toISOString()
      }))
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    );
  }
} 