import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

/**
 * GET handler for retrieving the termination reason for a user
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

    // Get the most recent termination record for this user
    const terminations = await executeQuery<any[]>(
      `SELECT st.reason, st.terminated_at, u.username as terminated_by_username 
       FROM session_terminations st 
       JOIN users u ON st.terminated_by = u.id 
       WHERE st.user_id = ? 
       ORDER BY st.terminated_at DESC LIMIT 1`,
      [userId]
    );

    if (terminations.length === 0) {
      return NextResponse.json({ reason: "Administrative action" });
    }

    const termination = terminations[0];
    let reason = termination.reason || "Administrative action";

    // Format the termination reason with additional details
    const terminationTime = new Date(
      termination.terminated_at
    ).toLocaleString();
    reason = `${reason} (by ${termination.terminated_by_username} at ${terminationTime})`;

    return NextResponse.json({ reason });
  } catch (error) {
    console.error("Error retrieving termination reason:", error);
    return NextResponse.json(
      { error: "Failed to retrieve termination reason" },
      { status: 500 }
    );
  }
}
