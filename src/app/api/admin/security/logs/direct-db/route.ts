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
 * This endpoint uses a simplified query approach to avoid parameter issues
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
        "/api/admin/security/logs/direct-db",
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

    // Handle userId filter with explicit type conversion
    if (searchParams.has("userId")) {
      const userId = parseInt(searchParams.get("userId") || "0", 10);
      if (!isNaN(userId) && userId > 0) {
        whereClause += " AND se.user_id = ?";
        params.push(userId);
      }
    }

    // Handle eventType filter with validation
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

    // Handle severity filter with validation
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

    // Handle date filters with explicit date formatting
    if (searchParams.has("startDate")) {
      const startDateStr = searchParams.get("startDate");
      const startDate = new Date(startDateStr || "");
      if (!isNaN(startDate.getTime())) {
        whereClause += " AND se.created_at >= ?";
        // Format date as MySQL-compatible string
        params.push(startDate.toISOString().slice(0, 19).replace("T", " "));
      }
    }

    if (searchParams.has("endDate")) {
      const endDateStr = searchParams.get("endDate");
      const endDate = new Date(endDateStr || "");
      if (!isNaN(endDate.getTime())) {
        whereClause += " AND se.created_at <= ?";
        // Format date as MySQL-compatible string
        params.push(endDate.toISOString().slice(0, 19).replace("T", " "));
      }
    }

    // Log the API access
    await logApiAccess(
      authResult.user.id,
      request,
      "/api/admin/security/logs/direct-db",
      true
    );

    // Log query details for debugging
    console.log("Direct-DB API: Executing database query for security logs");
    console.log(`Direct-DB API: Where clause: ${whereClause}`);
    console.log(`Direct-DB API: Params:`, params);

    // Get total count with a simpler query
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM security_events se 
      ${whereClause}
    `;

    try {
      const countResults = await executeQuery(countQuery, params);
      const total =
        Array.isArray(countResults) && countResults.length > 0
          ? countResults[0].total
          : 0;

      console.log(`Direct-DB API: Total security logs count: ${total}`);

      // Get the actual data with a simpler query
      // Use explicit column selection instead of * to avoid potential issues
      const dataQuery = `
        SELECT 
          se.id, 
          se.user_id, 
          se.event_type, 
          se.severity, 
          se.ip_address, 
          se.user_agent, 
          se.details, 
          se.created_at, 
          u.username, 
          u.email 
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
        `Direct-DB API: Retrieved ${
          Array.isArray(logs) ? logs.length : 0
        } security logs`
      );

      if (Array.isArray(logs) && logs.length > 0) {
        console.log(
          "Direct-DB API: First log sample:",
          JSON.stringify(logs[0]).substring(0, 200)
        );
      } else {
        console.log("Direct-DB API: No logs found");
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
        direct_db: true,
        message:
          "This is the direct-db endpoint for security logs with improved error handling",
      });
    } catch (dbError) {
      console.error("Direct-DB API: Database query error:", dbError);
      return NextResponse.json(
        {
          error: "Database query error",
          details: dbError instanceof Error ? dbError.message : String(dbError),
          query: countQuery,
          params: params,
          direct_db: true,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Direct-DB API: Error fetching security logs:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch security logs",
        details: error instanceof Error ? error.message : String(error),
        direct_db: true,
      },
      { status: 500 }
    );
  }
}
