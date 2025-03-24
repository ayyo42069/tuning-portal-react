import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/authMiddleware";
import { executeQuery } from "@/lib/db";

/**
 * GET handler for checking session termination status
 * This endpoint is used by the client to detect when a session has been terminated
 */
export async function GET(request: NextRequest) {
  try {
    // Get the user ID from the query parameters
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Authenticate the user
    const authResult = await authenticateUser(request);

    // If authentication fails, the session is already terminated or invalid
    if (!authResult.success) {
      return NextResponse.json({ terminated: true, reason: "Session invalid" });
    }

    // Verify that the authenticated user matches the requested user ID
    if (authResult.user?.id.toString() !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if there are any active sessions for this user
    const sessions = await executeQuery<any[]>(
      "SELECT COUNT(*) as count FROM sessions WHERE user_id = ?",
      [userId]
    );

    // Check if there are any termination records for this user
    const terminations = await executeQuery<any[]>(
      "SELECT * FROM session_terminations WHERE user_id = ? AND acknowledged = FALSE ORDER BY terminated_at DESC LIMIT 1",
      [userId]
    );

    // If there are no active sessions or there is a termination record, the session is terminated
    const isTerminated = sessions[0].count === 0 || terminations.length > 0;

    // If there is a termination record, mark it as acknowledged
    if (terminations.length > 0) {
      await executeQuery(
        "UPDATE session_terminations SET acknowledged = TRUE WHERE id = ?",
        [terminations[0].id]
      );
    }

    return NextResponse.json({
      terminated: isTerminated,
      reason: isTerminated
        ? terminations.length > 0
          ? terminations[0].reason
          : "No active sessions"
        : null,
    });
  } catch (error) {
    console.error("Error checking session status:", error);
    return NextResponse.json(
      { error: "Failed to check session status" },
      { status: 500 }
    );
  }
}
