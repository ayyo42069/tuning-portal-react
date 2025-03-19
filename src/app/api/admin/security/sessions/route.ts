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
      `SELECT s.*, u.username, u.email, COALESCE(ua.ip_address, 'Unknown') as ip_address, 
       COALESCE(ua.user_agent, 'Unknown') as user_agent,
       ua.last_activity
       FROM sessions s
       JOIN users u ON s.user_id = u.id
       LEFT JOIN user_activity_logs ua ON s.user_id = ua.user_id
       WHERE s.expires_at > NOW()
       GROUP BY s.id
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
