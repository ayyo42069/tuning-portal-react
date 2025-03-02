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
    const { status, message } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ["pending", "processing", "completed", "failed"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    // Update file status in database
    await executeQuery(
      `UPDATE ecu_files 
       SET status = ?, message = ?, updated_at = NOW() 
       WHERE id = ?`,
      [status, message || null, fileId]
    );

    return NextResponse.json({
      success: true,
      message: "Status updated successfully",
    });
  } catch (error) {
    console.error("Error updating tuning request status:", error);
    return NextResponse.json(
      { error: "An error occurred while updating the status" },
      { status: 500 }
    );
  }
}
