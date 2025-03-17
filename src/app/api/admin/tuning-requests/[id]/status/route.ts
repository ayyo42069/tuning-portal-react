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

    // Get the file details to get user_id
    const [fileDetails] = await executeQuery<any[]>(
      `SELECT user_id, original_filename FROM ecu_files WHERE id = ?`,
      [fileId]
    );

    if (!fileDetails) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Update file status in database
    await executeQuery(
      `UPDATE ecu_files 
       SET status = ?, message = ?, updated_at = NOW() 
       WHERE id = ?`,
      [status, message || null, fileId]
    );

    // Create notification for the user
    let notificationTitle = "";
    let notificationMessage = "";

    switch (status) {
      case "processing":
        notificationTitle = "Tuning File Processing Started";
        notificationMessage = `Your file ${fileDetails.original_filename} is now being processed by our tuning experts.`;
        break;
      case "completed":
        notificationTitle = "Tuning File Completed";
        notificationMessage = `Great news! Your file ${fileDetails.original_filename} has been successfully tuned and is ready for download.`;
        break;
      case "failed":
        notificationTitle = "Tuning Process Failed";
        notificationMessage = `We encountered an issue with your file ${
          fileDetails.original_filename
        }. ${message || "Please contact support for assistance."}`;
        break;
      default:
        notificationTitle = "Tuning File Status Updated";
        notificationMessage = `The status of your file ${fileDetails.original_filename} has been updated to ${status}.`;
    }

    // Insert notification into database
    await executeQuery(
      `INSERT INTO notifications 
        (user_id, title, message, type, reference_id, reference_type, is_read, is_global) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        fileDetails.user_id,
        notificationTitle,
        notificationMessage,
        "file_status",
        fileId,
        "ecu_file",
        false,
        false,
      ]
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
