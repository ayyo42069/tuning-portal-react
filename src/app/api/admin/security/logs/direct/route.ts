import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/authMiddleware";
import { executeQuery } from "@/lib/db";
import { logApiAccess } from "@/lib/securityMiddleware";
import {
  SecurityEventType,
  SecurityEventSeverity,
} from "@/lib/securityLogging";

/**
 * GET handler for retrieving security logs directly from the database
 * This is an alternative endpoint that bypasses the regular security logs API
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
        "/api/admin/security/logs/direct",
        true
      );

      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // Build query filters
    let whereClause = "WHERE 1=1";
    const params: any[] = [];

    if (searchParams.has("userId")) {
      const userId = parseInt(searchParams.get("userId") || "0", 10);
      if (!isNaN(userId) && userId > 0) {
        whereClause += " AND se.user_id = ?";
        params.push(userId);
      }
    }

    if (searchParams.has("eventType")) {
      const eventType = searchParams.get("eventType");
      if (
        eventType &&
        Object.values(SecurityEventType).includes(
          eventType as SecurityEventType
        )
      ) {
        whereClause += " AND se.event_type = ?";
        params.push(eventType);
      }
    }

    if (searchParams.has("severity")) {
      const severity = searchParams.get("severity");
      if (
        severity &&
        Object.values(SecurityEventSeverity).includes(
          severity as SecurityEventSeverity
        )
      ) {
        whereClause += " AND se.severity = ?";
        params.push(severity);
      }
    }

    if (searchParams.has("startDate")) {
      const startDate = new Date(searchParams.get("startDate") || "");
      if (!isNaN(startDate.getTime())) {
        whereClause += " AND se.created_at >= ?";
        params.push(startDate);
      }
    }

    if (searchParams.has("endDate")) {
      const endDate = new Date(searchParams.get("endDate") || "");
      if (!isNaN(endDate.getTime())) {
        whereClause += " AND se.created_at <= ?";
        params.push(endDate);
      }
    }

    // Log the API access
    await logApiAccess(
      authResult.user.id,
      request,
      "/api/admin/security/logs/direct",
      true
    );

    // Direct database query to get security logs
    console.log(
      "Direct API: Executing direct database query for security logs"
    );
    console.log(`Direct API: Where clause: ${whereClause}`);
    console.log(`Direct API: Params:`, params);

    // First check if the table exists
    const tableCheckResult = await executeQuery(
      "SHOW TABLES LIKE 'security_events'"
    );

    if (!Array.isArray(tableCheckResult) || tableCheckResult.length === 0) {
      console.log("Direct API: security_events table does not exist");
      return NextResponse.json({
        error: "Security events table does not exist",
        tableExists: false,
      });
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM security_events se 
      LEFT JOIN users u ON se.user_id = u.id
      ${whereClause}
    `;

    const countResults = await executeQuery(countQuery, params);
    const total =
      Array.isArray(countResults) && countResults.length > 0
        ? countResults[0].total
        : 0;

    console.log(`Direct API: Total security logs count: ${total}`);

    // Get the actual data
    const dataQuery = `
      SELECT se.id, se.user_id, se.event_type, se.severity, se.ip_address, 
             se.user_agent, se.details, se.created_at, u.username, u.email 
      FROM security_events se 
      LEFT JOIN users u ON se.user_id = u.id 
      ${whereClause}
      ORDER BY se.created_at DESC 
      LIMIT ? OFFSET ?
    `;

    // Add limit and offset to params
    const dataParams = [...params, limit, offset];

    const logs = await executeQuery(dataQuery, dataParams);

    console.log(
      `Direct API: Retrieved ${
        Array.isArray(logs) ? logs.length : 0
      } security logs`
    );

    if (Array.isArray(logs) && logs.length > 0) {
      console.log(
        "Direct API: First log sample:",
        JSON.stringify(logs[0]).substring(0, 200)
      );
    } else {
      console.log("Direct API: No logs found");
    }

    // Process the logs to ensure details is parsed from JSON if needed
    const processedLogs = Array.isArray(logs)
      ? logs.map((log) => {
          if (log.details && typeof log.details === "string") {
            try {
              log.details = JSON.parse(log.details);
            } catch (e) {
              // If parsing fails, keep the original string
              console.error("Failed to parse log details JSON:", e);
            }
          }
          return log;
        })
      : [];

    // Return the logs and total count
    return NextResponse.json({
      logs: processedLogs,
      total,
      direct: true,
      message: "This is the direct database query endpoint for security logs",
    });
  } catch (error) {
    console.error("Direct API: Error fetching security logs:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch security logs",
        details: error instanceof Error ? error.message : String(error),
        direct: true,
      },
      { status: 500 }
    );
  }
}
