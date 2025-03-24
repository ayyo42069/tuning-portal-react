import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    let users = 0;
    let files = 0;
    let satisfaction = 98; // Default satisfaction rate

    try {
      // Get total users count
      const totalUsersResult = await executeQuery<any[]>(
        `SELECT COUNT(*) as count FROM users WHERE role = 'user'`,
        [],
        { cache: true, cacheTTL: 300000 } // Cache for 5 minutes
      );
      users = totalUsersResult[0]?.count || 0;
    } catch (userError) {
      console.warn("Error fetching user stats:", userError);
      // Continue with default value
    }

    try {
      // Get total files count
      const totalFilesResult = await executeQuery<any[]>(
        `SELECT COUNT(*) as count FROM ecu_files`,
        [],
        { cache: true, cacheTTL: 300000 } // Cache for 5 minutes
      );
      files = totalFilesResult[0]?.count || 0;
    } catch (fileError) {
      console.warn("Error fetching file stats:", fileError);
      // Continue with default value
    }

    try {
      // Get satisfaction rate from ratings
      const satisfactionResult = await executeQuery<any[]>(
        `SELECT 
          ROUND(AVG(rating) * 20) as satisfaction_percent 
         FROM (
           SELECT rating FROM ticket_responses WHERE rating IS NOT NULL
           UNION ALL
           SELECT rating FROM ecu_file_feedback WHERE rating IS NOT NULL
         ) as ratings`,
        [],
        { cache: true, cacheTTL: 300000 } // Cache for 5 minutes
      );
      satisfaction = satisfactionResult[0]?.satisfaction_percent || 98;
    } catch (satisfactionError) {
      console.warn("Error fetching satisfaction stats:", satisfactionError);
      // Continue with default value
    }

    return NextResponse.json({
      users,
      files,
      satisfaction,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    // Return fallback data instead of error
    return NextResponse.json({
      users: 5000,
      files: 25000,
      satisfaction: 98,
      fallback: true,
    });
  }
}
