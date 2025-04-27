import { NextResponse } from "next/server";
import { db } from "@/lib/db";

interface FileStats {
  total_files: number;
  completed_files: number;
  avg_process_time: number;
}

interface Activity {
  id: number;
  type: string;
  message: string;
  timestamp: Date;
}

export async function GET() {
  try {
    // Get total files and success rate
    const fileStatsResult = await db.query(`
      SELECT 
        COUNT(*) as total_files,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_files,
        AVG(TIMESTAMPDIFF(HOUR, created_at, updated_at)) as avg_process_time
      FROM ecu_files
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `) as [FileStats[], any];

    // Get recent activities from notifications and feedback events
    const activitiesResult = await db.query(`
      SELECT * FROM (
        SELECT 
          id,
          'info' as type,
          message,
          created_at as timestamp
        FROM notifications
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        ORDER BY created_at DESC
        LIMIT 5
      ) AS notifications
      UNION ALL
      SELECT * FROM (
        SELECT 
          id,
          type,
          message,
          created_at as timestamp
        FROM feedback_events
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        ORDER BY created_at DESC
        LIMIT 5
      ) AS feedback_events
      ORDER BY timestamp DESC
      LIMIT 5
    `) as [Activity[], any];

    const fileStats = fileStatsResult[0][0];
    const activities = activitiesResult[0];

    const successRate = fileStats.completed_files / fileStats.total_files * 100;

    return NextResponse.json({
      totalFiles: fileStats.total_files,
      successRate: Math.round(successRate),
      avgProcessTime: Math.round(fileStats.avg_process_time),
      activities: activities.map((activity) => ({
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