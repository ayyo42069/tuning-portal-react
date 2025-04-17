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

    // Get security statistics
    const stats = await getSecurityLogStats(days);

    // Get unresolved alerts (limited to top 10)
    const unresolvedAlerts = await getUnresolvedAlerts(10);

    // Return the statistics and alerts
    return NextResponse.json({
      stats,
      unresolvedAlerts,
    });
  } catch (error) {
    console.error("Error fetching security statistics:", error);
    return NextResponse.json(
      { error: "Failed to fetch security statistics" },
      { status: 500 }
    );
  }
}
