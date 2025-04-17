import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { logApiAccess } from "@/lib/securityMiddleware";

export async function GET(request: NextRequest) {
  try {
    // Verify authentication and admin role
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);
    if (!user || user.role !== "admin") {
      // Log unauthorized access attempt
      await logApiAccess(
        user?.id || undefined,
        request,
        "/api/admin/activities",
        true
      );

      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    // Log the API access
    await logApiAccess(user.id, request, "/api/admin/activities", false);

    // Get recent activities with dedicated error handling
    let activities = [];
    
    try {
      activities = await executeQuery<any[]>(
        `(
          -- New user registrations
          SELECT 
            u.id,
            'user_registration' as type,
            'New user registered' as message,
            u.registration_date as timestamp,
            u.username as user
          FROM users u
          WHERE u.created_at > NOW() - INTERVAL 7 DAY
          
          UNION ALL
          
          -- Completed tuning files
          SELECT 
            ef.id,
            'tuning_completed' as type,
            'Tuning file completed' as message,
            ef.updated_at as timestamp,
            u.username as user
          FROM ecu_files ef
          JOIN users u ON ef.user_id = u.id
          WHERE ef.status = 'completed'
          AND ef.updated_at > NOW() - INTERVAL 7 DAY
          
          UNION ALL
          
          -- Credit purchases
          SELECT 
            ct.id,
            'credit_purchase' as type,
            CONCAT('Credits purchased: ', ct.amount) as message,
            ct.created_at as timestamp,
            u.username as user
          FROM credit_transactions ct
          JOIN users u ON ct.user_id = u.id
          WHERE ct.transaction_type = 'purchase'
          AND ct.created_at > NOW() - INTERVAL 7 DAY
        )
        ORDER BY timestamp DESC
        LIMIT 10`
      );
    } catch (error) {
      console.error("Error fetching recent activities:", error);
      // Return a specific error for activities
      return NextResponse.json(
        { 
          success: false, 
          error: "Could not load recent activity. Please try again later." 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      activities
    });
  } catch (error) {
    console.error("Error in activities endpoint:", error);
    return NextResponse.json(
      { success: false, error: "Could not load recent activity. Please try again later." },
      { status: 500 }
    );
  }
} 