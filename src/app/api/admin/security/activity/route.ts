import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/authMiddleware";
import { logApiAccess } from "@/lib/securityMiddleware";
import { getUserActivityLogs } from "@/lib/activityLogging";

/**
 * GET handler for retrieving user activity logs
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
        "/api/admin/security/activity",
        true
      );

      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    // Get query parameters
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const offset = parseInt(url.searchParams.get("offset") || "0");

    // Get user activity logs
    const logs = await getUserActivityLogs(
      userId ? parseInt(userId) : authResult.user.id,
      limit,
      offset
    );

    // Log successful API access
    await logApiAccess(
      authResult.user.id,
      request,
      "/api/admin/security/activity",
      false
    );

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Error fetching user activity logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch user activity logs" },
      { status: 500 }
    );
  }
}
