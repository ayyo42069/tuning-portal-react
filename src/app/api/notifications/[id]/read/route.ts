import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    // Verify authentication
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Get the notification and verify ownership
    const params = await context.params;
    const [notification] = await executeQuery<any[]>(
      `SELECT id, user_id, is_global FROM notifications WHERE id = ?`,
      [params.id]
    );

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    // Check if user has permission to mark this notification as read
    if (!notification.is_global && notification.user_id !== user.id) {
      return NextResponse.json(
        { error: "Permission denied" },
        { status: 403 }
      );
    }

    // Mark the notification as read
    await executeQuery(
      `UPDATE notifications SET is_read = true WHERE id = ?`,
      [params.id]
    );

    return NextResponse.json({
      success: true,
      message: "Notification marked as read"
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json(
      { error: "Failed to mark notification as read" },
      { status: 500 }
    );
  }
}
