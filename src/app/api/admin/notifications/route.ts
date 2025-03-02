import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
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

    // Check if user is admin
    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json().catch(() => ({}));
    const { title, message, type } = body;

    // Validate required fields
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Title is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    if (
      !message ||
      typeof message !== "string" ||
      message.trim().length === 0
    ) {
      return NextResponse.json(
        { error: "Message is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    // Validate notification type
    const validTypes = ["system", "admin_message"] as const;
    if (!type || !validTypes.includes(type as (typeof validTypes)[number])) {
      return NextResponse.json(
        {
          error:
            'Invalid notification type. Must be either "system" or "admin_message"',
        },
        { status: 400 }
      );
    }

    // Create global notification
    const result = await executeQuery<{ insertId: number }>(
      `INSERT INTO notifications (title, message, type, is_global) 
       VALUES (?, ?, ?, true)`,
      [title, message, type]
    );

    return NextResponse.json({
      success: true,
      message: "Notification sent successfully",
      notificationId: result.insertId,
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    return NextResponse.json(
      { error: "An error occurred while sending the notification" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
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

    // Check if user is admin
    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Get all global notifications
    const notifications = await executeQuery<any[]>(
      `SELECT 
        id,
        title,
        message,
        type,
        is_global as isGlobal,
        created_at as createdAt,
        (SELECT COUNT(*) FROM notifications WHERE is_read = true AND id = n.id) as readCount
      FROM notifications n
      WHERE is_global = true
      ORDER BY created_at DESC
      LIMIT 50`
    );

    return NextResponse.json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching notifications" },
      { status: 500 }
    );
  }
}
