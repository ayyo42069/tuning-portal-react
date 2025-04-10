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
      // Use the status from authResult to maintain consistency with other routes
      return NextResponse.json(
        { error: authResult.error || "Not authenticated" },
        { status: authResult.status || 401 }
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
    const limit = parseInt(searchParams.get("limit") || "1000", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // Build query filters
    let whereClause = "";
    const queryParams = [];

    // Handle userId filter with explicit type conversion
    if (searchParams.has("userId")) {
      const userId = parseInt(searchParams.get("userId") || "0", 10);
      if (!isNaN(userId) && userId > 0) {
        whereClause += whereClause ? " AND se.user_id = ?" : "se.user_id = ?";
        queryParams.push(userId);
        console.log(`Direct-DB API: Added userId filter: ${userId}`);
      }
    }

    // Handle eventType filter with validation
    if (searchParams.has("eventType")) {
      const eventType = searchParams.get("eventType");
      if (
        eventType &&
        (Object.values(SecurityEventType).includes(
          eventType as SecurityEventType
        ) || eventType === "api_access")
      ) {
        if (eventType === "api_access") {
          whereClause += whereClause
            ? " AND (se.event_type = ? OR se.event_type = ?)"
            : "(se.event_type = ? OR se.event_type = ?)";
          queryParams.push("api_access");
          queryParams.push("sensitive_data_access");
          console.log(`Direct-DB API: Added api_access filter`);
        } else {
          whereClause += whereClause
            ? " AND se.event_type = ?"
            : "se.event_type = ?";
          queryParams.push(eventType);
          console.log(`Direct-DB API: Added eventType filter: ${eventType}`);
        }
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
        whereClause += whereClause ? " AND se.severity = ?" : "se.severity = ?";
        queryParams.push(severity);
        console.log(`Direct-DB API: Added severity filter: ${severity}`);
      }
    }

    // Handle date filters with simplified string handling
    if (searchParams.has("startDate")) {
      const startDateStr = searchParams.get("startDate");
      if (startDateStr && startDateStr.trim() !== "") {
        try {
          // Add time to ensure full day coverage
          const startDateWithTime = `${startDateStr} 00:00:00`;
          whereClause += whereClause
            ? " AND se.created_at >= ?"
            : "se.created_at >= ?";
          queryParams.push(startDateWithTime);
          console.log(
            `Direct-DB API: Added startDate filter: ${startDateWithTime}`
          );
        } catch (e) {
          console.error(
            "Direct-DB API: Invalid startDate format:",
            startDateStr,
            e
          );
        }
      }
    }

    if (searchParams.has("endDate")) {
      const endDateStr = searchParams.get("endDate");
      if (endDateStr && endDateStr.trim() !== "") {
        try {
          // Add time to ensure full day coverage
          const endDateWithTime = `${endDateStr} 23:59:59`;
          whereClause += whereClause
            ? " AND se.created_at <= ?"
            : "se.created_at <= ?";
          queryParams.push(endDateWithTime);
          console.log(
            `Direct-DB API: Added endDate filter: ${endDateWithTime}`
          );
        } catch (e) {
          console.error(
            "Direct-DB API: Invalid endDate format:",
            endDateStr,
            e
          );
        }
      }
    }

    // Log the API access
    await logApiAccess(
      authResult.user.id,
      request,
      "/api/admin/security/logs/direct-db",
      true
    );

    // Prepare the WHERE clause for the SQL query
    const finalWhereClause = whereClause ? `WHERE ${whereClause}` : "";

    // Log query details for debugging
    console.log("Direct-DB API: Executing database query for security logs");
    console.log(`Direct-DB API: Where clause: ${finalWhereClause}`);
    console.log(`Direct-DB API: Params:`, queryParams);

    try {
      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM security_events se 
        LEFT JOIN users u ON se.user_id = u.id
        ${finalWhereClause}
      `;

      console.log(`Direct-DB API: Count query: ${countQuery}`);
      console.log(`Direct-DB API: Count params:`, queryParams);

      // Execute count query
      const countResults = await executeQuery(countQuery, queryParams);

      // Extract total count with proper type checking
      const total =
        Array.isArray(countResults) &&
        countResults.length > 0 &&
        countResults[0].total !== undefined
          ? Number(countResults[0].total)
          : 0;

      console.log(`Direct-DB API: Total security logs count: ${total}`);

      // Prepare data query with explicit column selection
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
        ${finalWhereClause}
        ORDER BY se.created_at DESC 
        LIMIT ? OFFSET ?
      `;

      // Create a new array with all parameters including pagination
      const dataParams = [...queryParams, limit, offset];

      console.log(`Direct-DB API: Data query: ${dataQuery}`);
      console.log(`Direct-DB API: Data params:`, dataParams);

      // Execute data query
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
