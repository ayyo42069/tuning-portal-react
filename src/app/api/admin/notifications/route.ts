import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

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

    // Fetch notifications for the user
    const notifications = await executeQuery<any[]>(
      `SELECT 
        n.id,
        n.title,
        n.message,
        n.type,
        n.reference_id as referenceId,
        n.reference_type as referenceType,
        n.is_read as isRead,
        n.is_global as isGlobal,
        n.created_at as createdAt
      FROM notifications n
      WHERE (n.user_id = ? OR n.is_global = 1)
      ORDER BY n.created_at DESC
      LIMIT 50`,
      [user.id]
    );

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication and admin role
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
        { error: "Admin privileges required" },
        { status: 403 }
      );
    }

    // Parse request body
    const {
      title,
      message,
      type,
      userId,
      isGlobal = false,
      referenceId = null,
      referenceType = null,
    } = await request.json();

    // Validate required fields
    if (!title || !message || !type) {
      return NextResponse.json(
        { error: "Title, message, and type are required" },
        { status: 400 }
      );
    }

    // If not global, userId is required
    if (!isGlobal && !userId) {
      return NextResponse.json(
        { error: "User ID is required for non-global notifications" },
        { status: 400 }
      );
    }

    // Insert notification into database
    const result = await executeQuery(
      `INSERT INTO notifications 
        (title, message, type, user_id, is_global, reference_id, reference_type, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        title,
        message,
        type,
        isGlobal ? null : userId,
        isGlobal ? 1 : 0,
        referenceId,
        referenceType,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Notification sent successfully",
      notificationId: (result as any).insertId,
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
}
