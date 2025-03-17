import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication and admin role
    const token = req.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Get file ID from URL
    const { id: fileId } = await context.params;
    if (!fileId) {
      return NextResponse.json(
        { error: "File ID is required" },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { priority } = body;

    if (priority === undefined) {
      return NextResponse.json(
        { error: "Priority value is required" },
        { status: 400 }
      );
    }

    // Validate priority (must be a non-negative integer)
    if (
      typeof priority !== "number" ||
      priority < 0 ||
      !Number.isInteger(priority)
    ) {
      return NextResponse.json(
        { error: "Priority must be a non-negative integer" },
        { status: 400 }
      );
    }

    // Update priority in database
    await executeQuery(
      `UPDATE ecu_files SET priority = ?, updated_at = NOW() WHERE id = ?`,
      [priority, fileId]
    );

    // Create notification for the file owner
    const priorityLevel =
      priority >= 3 ? "high" : priority >= 1 ? "medium" : "low";
    await executeQuery(
      `INSERT INTO notifications (user_id, title, message, type, reference_id, reference_type)
       SELECT user_id, 'Tuning Request Priority Updated', 
       CONCAT('Your tuning request has been set to ', ?, ' priority.'), 
       'file_status', id, 'ecu_file'
       FROM ecu_files WHERE id = ?`,
      [priorityLevel, fileId]
    );

    return NextResponse.json({
      success: true,
      message: "Priority updated successfully",
    });
  } catch (error) {
    console.error("Error updating priority:", error);
    return NextResponse.json(
      { error: "An error occurred while updating the priority" },
      { status: 500 }
    );
  }
}
