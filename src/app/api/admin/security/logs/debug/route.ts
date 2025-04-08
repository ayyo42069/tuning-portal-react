import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/authMiddleware";
import { executeQuery } from "@/lib/db";
import { logApiAccess } from "@/lib/securityMiddleware";

/**
 * GET handler for retrieving security logs directly from the database
 * This is a debug endpoint to bypass the regular security logs API
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
        "/api/admin/security/logs/debug",
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

    // Log the API access
    await logApiAccess(
      authResult.user.id,
      request,
      "/api/admin/security/logs/debug",
      true
    );

    // Direct database query to get security logs
    console.log("Debug API: Executing direct database query for security logs");

    // First check if the table exists
    const tableCheckResult = await executeQuery(
      "SHOW TABLES LIKE 'security_events'"
    );

    if (!Array.isArray(tableCheckResult) || tableCheckResult.length === 0) {
      console.log("Debug API: security_events table does not exist");
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
    `;

    const countResults = await executeQuery(countQuery);
    const total =
      Array.isArray(countResults) && countResults.length > 0
        ? countResults[0].total
        : 0;

    console.log(`Debug API: Total security logs count: ${total}`);

    // Get the actual data with a simpler query
    const dataQuery = `
      SELECT se.*, u.username, u.email 
      FROM security_events se 
      LEFT JOIN users u ON se.user_id = u.id 
      ORDER BY se.created_at DESC 
      LIMIT ? OFFSET ?
    `;

    const logs = await executeQuery(dataQuery, [limit, offset]);

    console.log(
      `Debug API: Retrieved ${
        Array.isArray(logs) ? logs.length : 0
      } security logs`
    );

    if (Array.isArray(logs) && logs.length > 0) {
      console.log(
        "Debug API: First log sample:",
        JSON.stringify(logs[0]).substring(0, 200)
      );
    } else {
      console.log("Debug API: No logs found");
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
      debug: true,
      message: "This is the debug endpoint for security logs",
    });
  } catch (error) {
    console.error("Debug API: Error fetching security logs:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch security logs",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
