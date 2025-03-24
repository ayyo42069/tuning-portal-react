import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Get total users count
    const totalUsersResult = await executeQuery<any[]>(
      `SELECT COUNT(*) as count FROM users WHERE role = 'user'`
    );
    const users = totalUsersResult[0]?.count || 0;

    // Get total files count
    const totalFilesResult = await executeQuery<any[]>(
      `SELECT COUNT(*) as count FROM ecu_files`
    );
    const files = totalFilesResult[0]?.count || 0;

    // Get satisfaction rate (this is a placeholder - you might want to calculate this from actual ratings)
    // For example, you could calculate this from ticket ratings or feedback
    const satisfactionResult = await executeQuery<any[]>(
      `SELECT 
        ROUND(AVG(rating) * 20) as satisfaction_percent 
       FROM (
         SELECT rating FROM ticket_responses WHERE rating IS NOT NULL
         UNION ALL
         SELECT rating FROM ecu_file_feedback WHERE rating IS NOT NULL
       ) as ratings`
    );
    const satisfaction = satisfactionResult[0]?.satisfaction_percent || 98; // Default to 98% if no data

    return NextResponse.json({
      users,
      files,
      satisfaction,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching statistics" },
      { status: 500 }
    );
  }
}
