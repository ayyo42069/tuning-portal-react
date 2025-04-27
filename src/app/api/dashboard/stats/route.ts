import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

interface FileStats {
  total_files: number;
  completed_files: number;
  avg_process_time: number;
}

interface CreditStats {
  total_credits: number;
  credits_used: number;
  credits_remaining: number;
  recent_transactions: number;
}

interface ProcessingStats {
  files_in_queue: number;
  avg_queue_time: number;
  processing_success_rate: number;
  high_priority: number;
  medium_priority: number;
  low_priority: number;
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
    const fileStats = await executeQuery<FileStats[]>(
      `SELECT 
        COUNT(*) as total_files,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_files,
        AVG(TIMESTAMPDIFF(HOUR, created_at, updated_at)) as avg_process_time
      FROM ecu_files
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`
    );

    // Get credit statistics
    const creditStats = await executeQuery<CreditStats[]>(
      `SELECT 
        (SELECT credits FROM user_credits WHERE user_id = ?) as total_credits,
        (SELECT COUNT(*) FROM credit_transactions WHERE user_id = ? AND transaction_type = 'usage') as credits_used,
        (SELECT COUNT(*) FROM credit_transactions WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)) as recent_transactions`
    );

    // Get processing statistics
    const processingStats = await executeQuery<ProcessingStats[]>(
      `SELECT 
        COUNT(*) as files_in_queue,
        AVG(TIMESTAMPDIFF(HOUR, created_at, NOW())) as avg_queue_time,
        (SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) / COUNT(*)) * 100 as processing_success_rate,
        SUM(CASE WHEN priority = 2 THEN 1 ELSE 0 END) as high_priority,
        SUM(CASE WHEN priority = 1 THEN 1 ELSE 0 END) as medium_priority,
        SUM(CASE WHEN priority = 0 THEN 1 ELSE 0 END) as low_priority
      FROM ecu_files
      WHERE status IN ('pending', 'processing')`
    );

    // Get notifications
    const notifications = await executeQuery<Activity[]>(
      `SELECT 
        id,
        'info' as type,
        message,
        created_at as timestamp
      FROM notifications
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      ORDER BY created_at DESC
      LIMIT 5`
    );

    // Get feedback events
    const feedbackEvents = await executeQuery<Activity[]>(
      `SELECT 
        id,
        type,
        message,
        created_at as timestamp
      FROM feedback_events
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      ORDER BY created_at DESC
      LIMIT 5`
    );

    // Combine and sort activities
    const activities = [...notifications, ...feedbackEvents]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);

    const stats = fileStats[0];
    const credits = creditStats[0];
    const processing = processingStats[0];
    const successRate = stats.completed_files / stats.total_files * 100;

    return NextResponse.json({
      totalFiles: stats.total_files,
      successRate: Math.round(successRate),
      avgProcessTime: Math.round(stats.avg_process_time),
      credits: {
        total: credits.total_credits,
        used: credits.credits_used,
        remaining: credits.total_credits - credits.credits_used,
        recentTransactions: credits.recent_transactions
      },
      processing: {
        inQueue: processing.files_in_queue,
        avgQueueTime: Math.round(processing.avg_queue_time),
        successRate: Math.round(processing.processing_success_rate),
        priorityDistribution: {
          high: processing.high_priority,
          medium: processing.medium_priority,
          low: processing.low_priority
        }
      },
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