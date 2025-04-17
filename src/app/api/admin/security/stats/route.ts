import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/authMiddleware";
import {
  getSecurityLogStats,
  getUnresolvedAlerts,
} from "@/lib/securityLogging";
import { logApiAccess } from "@/lib/securityMiddleware";

/**
 * GET handler for retrieving security statistics
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
        "/api/admin/security/stats",
        true
      );

      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get("days") || "30", 10);

    // Log the API access
    await logApiAccess(
      authResult.user.id,
      request,
      "/api/admin/security/stats",
      true
    );

    // Initialize default values
    let stats = {
      totalEvents: 0,
      eventsByType: {},
      eventsBySeverity: {},
      recentFailedLogins: 0,
      recentSuspiciousActivities: 0,
      recentApiAccess: 0,
    };
    let unresolvedAlerts = [];

    // Get security statistics with error handling
    try {
      stats = await getSecurityLogStats(days);
    } catch (error) {
      console.error("Error fetching security log stats:", error);
      // Continue with default stats object
    }

    // Get unresolved alerts with error handling
    try {
      unresolvedAlerts = await getUnresolvedAlerts(10);
    } catch (error) {
      console.error("Error fetching unresolved alerts:", error);
      // Continue with empty alerts array
    }

    // Return the statistics and alerts
    return NextResponse.json({
      success: true,
      stats,
      unresolvedAlerts,
    });
  } catch (error) {
    console.error("Error fetching security statistics:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch security statistics" },
      { status: 500 }
    );
  }
}
