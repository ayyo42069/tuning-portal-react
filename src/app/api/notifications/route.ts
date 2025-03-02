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
      WHERE (n.user_id = ? OR n.is_global = true)
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
