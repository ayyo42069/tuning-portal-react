import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/authMiddleware";
import { executeQuery } from "@/lib/db";
import { logApiAccess, logAdminAction } from "@/lib/securityMiddleware";
import { SecurityEventType } from "@/lib/securityLogging";

/**
 * POST handler for banning a user
 * This endpoint is restricted to admin users only
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const params = await context.params;
    const { userId } = params;

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
        `/api/admin/security/users/${userId}/ban`,
        true
      );

      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    // Parse request body
    const { reason, duration } = await request.json();

    // Validate inputs
    if (!reason || !duration) {
      return NextResponse.json(
        { error: "Reason and duration are required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const userExists = await executeQuery<any[]>(
      "SELECT id FROM users WHERE id = ?",
      [userId]
    );

    if (!userExists || userExists.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate ban expiry date based on duration
    let banExpiresAt = null;
    if (duration !== "permanent") {
      banExpiresAt = new Date();
      const [amount, unit] = duration.split("_");
      const days =
        unit === "days"
          ? parseInt(amount)
          : unit === "day"
          ? 1
          : amount === "30"
          ? 30
          : amount === "90"
          ? 90
          : 7;

      banExpiresAt.setDate(banExpiresAt.getDate() + days);
    }

    // Ban the user
    await executeQuery(
      `UPDATE users SET 
       is_banned = TRUE, 
       ban_reason = ?, 
       ban_expires_at = ?, 
       banned_by = ?, 
       banned_at = NOW() 
       WHERE id = ?`,
      [reason, banExpiresAt, authResult.user.id, userId]
    );

    // Terminate all active sessions for this user
    await executeQuery("DELETE FROM sessions WHERE user_id = ?", [userId]);

    // Log admin action
    await logAdminAction(
      authResult.user.id,
      SecurityEventType.ADMIN_USER_UPDATE,
      request,
      {
        action: "ban_user",
        target_user_id: parseInt(userId),
        reason,
        duration,
        ban_expires_at: banExpiresAt,
      }
    );

    // Log successful API access
    await logApiAccess(
      authResult.user.id,
      request,
      `/api/admin/security/users/${userId}/ban`,
      false
    );

    return NextResponse.json({
      success: true,
      message: `User has been banned ${
        duration === "permanent"
          ? "permanently"
          : `until ${banExpiresAt?.toISOString()}`
      }`,
    });
  } catch (error) {
    console.error("Error banning user:", error);
    return NextResponse.json({ error: "Failed to ban user" }, { status: 500 });
  }
}
