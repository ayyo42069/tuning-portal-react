import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { logAdminAction } from "@/lib/securityMiddleware";
import { SecurityEventType } from "@/lib/securityLogging";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
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

    // Get the user ID from the URL
    const params = await context.params;
    const userId = parseInt(params.userId);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Get the role from the request body
    const body = await request.json();
    const { role } = body;

    if (!role || (role !== "user" && role !== "admin")) {
      return NextResponse.json(
        { error: 'Invalid role. Must be "user" or "admin"' },
        { status: 400 }
      );
    }

    // Update the user's role
    await executeQuery("UPDATE users SET role = ? WHERE id = ?", [
      role,
      userId,
    ]);

    // Log admin action for role change
    await logAdminAction(
      user.id,
      SecurityEventType.ADMIN_PERMISSION_CHANGE,
      request,
      {
        action: "role_update",
        targetUserId: userId,
        oldRole: "unknown", // We don't have the previous role here
        newRole: role,
        timestamp: new Date().toISOString(),
      }
    );

    return NextResponse.json({
      success: true,
      message: `User role updated to ${role}`,
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { error: "An error occurred while updating user role" },
      { status: 500 }
    );
  }
}
