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
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);
    if (!user || user.role !== "admin") {
      // Log unauthorized access attempt
      await logApiAccess(
        user?.id || undefined,
        request,
        "/api/admin/stats",
        true
      );

      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Log the API access
    await logApiAccess(user.id, request, "/api/admin/stats", false);

    // Use try-catch for each database operation
    let pendingRequests = 0;
    let pendingRequestsChange = 0;
    let activeUsers = 0;
    let activeUsersChange = 0;
    let creditsSold = 0;
    let creditsSoldChange = 0;
    let revenue = 0;
    let revenueChange = 0;
    let recentActivities = [];

    // Get pending requests count (with error handling)
    try {
      const pendingRequestsResult = await executeQuery<any[]>(
        `SELECT COUNT(*) as count FROM ecu_files WHERE status = 'pending'`
      );
      pendingRequests = pendingRequestsResult[0]?.count || 0;
    } catch (error) {
      console.error("Error fetching pending requests:", error);
    }

    // Get pending requests change (with error handling)
    try {
      const pendingRequestsChangeResult = await executeQuery<any[]>(
        `SELECT 
          (COUNT(*) - (
            SELECT COUNT(*) FROM ecu_files 
            WHERE status = 'pending' 
            AND created_at < NOW() - INTERVAL 7 DAY
          )) / NULLIF((
            SELECT COUNT(*) FROM ecu_files 
            WHERE status = 'pending' 
            AND created_at < NOW() - INTERVAL 7 DAY
          ), 0) * 100 as change_percent
        FROM ecu_files 
        WHERE status = 'pending'`
      );
      pendingRequestsChange = Math.round(pendingRequestsChangeResult[0]?.change_percent || 0);
    } catch (error) {
      console.error("Error fetching pending requests change:", error);
    }

    // Get active users (with error handling)
    try {
      const activeUsersResult = await executeQuery<any[]>(
        `SELECT COUNT(*) as count FROM users 
         WHERE last_login_date > NOW() - INTERVAL 30 DAY`
      );
      activeUsers = activeUsersResult[0]?.count || 0;
    } catch (error) {
      console.error("Error fetching active users:", error);
    }

    // Get active users change (with error handling)
    try {
      const activeUsersChangeResult = await executeQuery<any[]>(
        `SELECT 
          (COUNT(*) - (
            SELECT COUNT(*) FROM users 
            WHERE last_login_date BETWEEN NOW() - INTERVAL 60 DAY AND NOW() - INTERVAL 30 DAY
          )) / NULLIF((
            SELECT COUNT(*) FROM users 
            WHERE last_login_date BETWEEN NOW() - INTERVAL 60 DAY AND NOW() - INTERVAL 30 DAY
          ), 0) * 100 as change_percent
        FROM users 
        WHERE last_login_date > NOW() - INTERVAL 30 DAY`
      );
      activeUsersChange = Math.round(activeUsersChangeResult[0]?.change_percent || 0);
    } catch (error) {
      console.error("Error fetching active users change:", error);
    }

    // Get credits sold (with error handling)
    try {
      const creditsSoldResult = await executeQuery<any[]>(
        `SELECT SUM(amount) as total FROM credit_transactions 
         WHERE transaction_type = 'purchase' 
         AND created_at > NOW() - INTERVAL 30 DAY`
      );
      creditsSold = creditsSoldResult[0]?.total || 0;
    } catch (error) {
      console.error("Error fetching credits sold:", error);
    }

    // Get credits sold change (with error handling)
    try {
      const creditsSoldChangeResult = await executeQuery<any[]>(
        `SELECT 
          (
            (SELECT SUM(amount) FROM credit_transactions 
             WHERE transaction_type = 'purchase' 
             AND created_at > NOW() - INTERVAL 30 DAY) -
            (SELECT SUM(amount) FROM credit_transactions 
             WHERE transaction_type = 'purchase' 
             AND created_at BETWEEN NOW() - INTERVAL 60 DAY AND NOW() - INTERVAL 30 DAY)
          ) / NULLIF(
            (SELECT SUM(amount) FROM credit_transactions 
             WHERE transaction_type = 'purchase' 
             AND created_at BETWEEN NOW() - INTERVAL 60 DAY AND NOW() - INTERVAL 30 DAY)
          , 0) * 100 as change_percent`
      );
      creditsSoldChange = Math.round(creditsSoldChangeResult[0]?.change_percent || 0);
    } catch (error) {
      console.error("Error fetching credits sold change:", error);
    }

    // Get revenue (with error handling)
    try {
      const revenueResult = await executeQuery<any[]>(
        `SELECT SUM(amount) * 1.8 as total FROM credit_transactions 
         WHERE transaction_type = 'purchase' 
         AND created_at > NOW() - INTERVAL 30 DAY`
      );
      revenue = Math.round(revenueResult[0]?.total || 0);
    } catch (error) {
      console.error("Error fetching revenue:", error);
    }

    // Get revenue change (with error handling)
    try {
      const revenueChangeResult = await executeQuery<any[]>(
        `SELECT 
          (
            (SELECT SUM(amount) * 1.8 FROM credit_transactions 
             WHERE transaction_type = 'purchase' 
             AND created_at > NOW() - INTERVAL 30 DAY) -
            (SELECT SUM(amount) * 1.8 FROM credit_transactions 
             WHERE transaction_type = 'purchase' 
             AND created_at BETWEEN NOW() - INTERVAL 60 DAY AND NOW() - INTERVAL 30 DAY)
          ) / NULLIF(
            (SELECT SUM(amount) * 1.8 FROM credit_transactions 
             WHERE transaction_type = 'purchase' 
             AND created_at BETWEEN NOW() - INTERVAL 60 DAY AND NOW() - INTERVAL 30 DAY)
          , 0) * 100 as change_percent`
      );
      revenueChange = Math.round(revenueChangeResult[0]?.change_percent || 0);
    } catch (error) {
      console.error("Error fetching revenue change:", error);
    }

    // Get recent activities (with error handling)
    try {
      recentActivities = await executeQuery<any[]>(
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
      recentActivities = [];
    }

    return NextResponse.json({
      success: true,
      pendingRequests,
      pendingRequestsChange,
      activeUsers,
      activeUsersChange,
      creditsSold,
      creditsSoldChange,
      revenue,
      revenueChange,
      recentActivities
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { success: false, error: "An error occurred while fetching admin statistics" },
      { status: 500 }
    );
  }
}
