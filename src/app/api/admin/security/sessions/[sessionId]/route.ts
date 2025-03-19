import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/authMiddleware";
import { executeQuery } from "@/lib/db";
import {
  logApiAccess,
  logAdminAction,
  logSessionEvent,
} from "@/lib/securityMiddleware";
import { SecurityEventType } from "@/lib/securityLogging";

/**
 * DELETE handler for terminating a specific session
 * This endpoint is restricted to admin users only
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
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

    // Delete the session
    await executeQuery("DELETE FROM sessions WHERE id = ?", [sessionId]);

    // Log successful API access
    await logApiAccess(
      authResult.user.id,
      request,
      `/api/admin/security/sessions/${sessionId}`,
      false
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error terminating session:", error);
    return NextResponse.json(
      { error: "Failed to terminate session" },
      { status: 500 }
    );
  }
}
