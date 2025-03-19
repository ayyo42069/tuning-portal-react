import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/authMiddleware";
import { executeQuery } from "@/lib/db";
import { logApiAccess } from "@/lib/securityMiddleware";

/**
 * GET handler for retrieving active sessions
 * This endpoint is restricted to admin users only
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate the user
    const authResult = await authenticateUser(request);

    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    // Check if user is an admin
    if (!authResult.user || authResult.user.role !== "admin") {
      // Log unauthorized access attempt
      await logApiAccess(
        authResult.user?.id || undefined,
        request,
        "/api/admin/security/sessions",
        true
      );

      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    // Get all active sessions with user details
    const sessions = await executeQuery(
      `SELECT s.*, u.username, u.email, 
       COALESCE(latest_activity.ip_address, 'Unknown') as ip_address,
       COALESCE(latest_activity.user_agent, 'Unknown') as user_agent,
       COALESCE(latest_activity.created_at, s.created_at) as last_activity
       FROM sessions s
       JOIN users u ON s.user_id = u.id
       LEFT JOIN (
         SELECT user_id, ip_address, user_agent, created_at,
         ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rn
         FROM user_activity_logs
       ) latest_activity ON s.user_id = latest_activity.user_id AND latest_activity.rn = 1
       WHERE s.expires_at > NOW()
       ORDER BY s.created_at DESC`,
      []
    );

    // Log successful API access
    await logApiAccess(
      authResult.user.id,
      request,
      "/api/admin/security/sessions",
      false
    );

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Error fetching active sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch active sessions" },
      { status: 500 }
    );
  }
}
