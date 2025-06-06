import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/authMiddleware";
import {
  getSecurityLogs,
  SecurityLogQueryOptions,
  SecurityEventType,
  SecurityEventSeverity,
} from "@/lib/securityLogging";
import { logApiAccess } from "@/lib/securityMiddleware";

/**
 * GET handler for retrieving security logs
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
        "/api/admin/security/logs",
        true
      );

      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryOptions: SecurityLogQueryOptions = {};

    // Extract and validate query parameters
    if (searchParams.has("userId")) {
      const userId = parseInt(searchParams.get("userId") || "0", 10);
      if (!isNaN(userId) && userId > 0) {
        queryOptions.userId = userId;
      }
    }

    if (searchParams.has("eventType")) {
      const eventType = searchParams.get("eventType");
      if (eventType) {
        queryOptions.eventType = eventType as SecurityEventType;
      }
    }

    if (searchParams.has("severity")) {
      const severity = searchParams.get("severity");
      if (severity) {
        queryOptions.severity = severity as SecurityEventSeverity;
      }
    }

    if (searchParams.has("startDate")) {
      const startDate = new Date(searchParams.get("startDate") || "");
      if (!isNaN(startDate.getTime())) {
        queryOptions.startDate = startDate;
      }
    }

    if (searchParams.has("endDate")) {
      const endDate = new Date(searchParams.get("endDate") || "");
      if (!isNaN(endDate.getTime())) {
        queryOptions.endDate = endDate;
      }
    }

    // Parse pagination parameters
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    if (!isNaN(limit) && limit > 0) {
      queryOptions.limit = Math.min(limit, 100); // Cap at 100 records per request
    }

    if (!isNaN(offset) && offset >= 0) {
      queryOptions.offset = offset;
    }

    // Log the API access
    await logApiAccess(
      authResult.user.id,
      request,
      "/api/admin/security/logs",
      true
    );

    // Get security logs
    const { logs, total } = await getSecurityLogs(queryOptions);

    console.log(
      `API: Retrieved ${logs.length} security logs, total count: ${total}`
    );

    // Debug log the actual logs being returned
    if (logs.length === 0) {
      console.log(
        "No logs found in API response despite database having records"
      );
      console.log("Query options:", JSON.stringify(queryOptions));
    } else {
      console.log(
        "First log sample:",
        JSON.stringify(logs[0]).substring(0, 200)
      );
    }

    // Return the logs and total count
    return NextResponse.json({ logs, total });
  } catch (error) {
    console.error("Error in security logs API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
