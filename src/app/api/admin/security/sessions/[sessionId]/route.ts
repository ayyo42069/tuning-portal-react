import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/authMiddleware";
import { executeQuery } from "@/lib/db";
import {
  logApiAccess,
  logAdminAction,
  logSessionEvent,
} from "@/lib/securityMiddleware";
import { SecurityEventType } from "@/lib/securityLogging";
import { cookies } from "next/headers";

/**
 * DELETE handler for terminating a specific session
 * This endpoint is restricted to admin users only
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    const params = await context.params;
    const { sessionId } = params;

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
        `/api/admin/security/sessions/${sessionId}`,
        true
      );

      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    // Get session details before deletion for logging
    const sessionDetails = await executeQuery<any[]>(
      "SELECT * FROM sessions WHERE id = ?",
      [sessionId]
    );

    if (!sessionDetails || sessionDetails.length === 0) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const session = sessionDetails[0];

    // Get all active sessions for this user to terminate them all
    const userSessions = await executeQuery<any[]>(
      "SELECT id FROM sessions WHERE user_id = ?",
      [session.user_id]
    );

    // Log session termination event
    await logSessionEvent(
      session.user_id,
      sessionId,
      SecurityEventType.SESSION_INVALIDATED,
      request
    );

    // Log admin action
    await logAdminAction(
      authResult.user.id,
      SecurityEventType.ADMIN_USER_UPDATE,
      request,
      {
        action: "terminate_session",
        target_user_id: session.user_id,
        session_id: sessionId,
      }
    );

    // Delete all sessions for this user instead of just the one
    // This ensures the user is completely logged out from all devices
    await executeQuery("DELETE FROM sessions WHERE user_id = ?", [
      session.user_id,
    ]);

    // Add a termination record to notify clients
    await executeQuery(
      "INSERT INTO session_terminations (user_id, terminated_by, terminated_at, reason) VALUES (?, ?, NOW(), ?)",
      [session.user_id, authResult.user.id, "Administrative action"]
    );

    // Log successful API access
    await logApiAccess(
      authResult.user.id,
      request,
      `/api/admin/security/sessions/${sessionId}`,
      false
    );

    // Create a response with success message
    const response = NextResponse.json({
      success: true,
      message: "All sessions for user terminated successfully",
      terminatedSessions: userSessions.length,
      userId: session.user_id,
    });

    // We don't need to set cookies here as they won't reach the terminated user
    // The terminated user's client will detect termination on their next API call

    return response;
  } catch (error) {
    console.error("Error terminating session:", error);
    return NextResponse.json(
      { error: "Failed to terminate session" },
      { status: 500 }
    );
  }
}
