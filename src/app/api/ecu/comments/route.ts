import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

// GET handler to fetch comments for a specific ECU file
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

    // Get file ID from query params
    const fileId = request.nextUrl.searchParams.get("fileId");
    if (!fileId) {
      return NextResponse.json(
        { error: "File ID is required" },
        { status: 400 }
      );
    }

    // Fetch comments for the file
    const comments = await executeQuery<any[]>(
      `SELECT 
        c.id,
        c.user_id,
        u.username as user_name,
        u.role as user_role,
        c.message,
        c.created_at
      FROM ecu_file_comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.ecu_file_id = ?
      ORDER BY c.created_at ASC`,
      [fileId]
    );

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// POST handler to add a new comment
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

    // Parse request body
    const body = await request.json();
    const { fileId, message } = body;

    if (!fileId || !message) {
      return NextResponse.json(
        { error: "File ID and message are required" },
        { status: 400 }
      );
    }

    // Check if the file exists and user has access
    const files = await executeQuery<any[]>(
      `SELECT id FROM ecu_files WHERE id = ? AND (user_id = ? OR ? = 'admin')`,
      [fileId, user.id, user.role]
    );

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "File not found or access denied" },
        { status: 404 }
      );
    }

    // Insert the comment
    const result = await executeQuery<any>(
      `INSERT INTO ecu_file_comments (ecu_file_id, user_id, message) 
       VALUES (?, ?, ?)`,
      [fileId, user.id, message]
    );

    // Create a notification for the file owner if the commenter is an admin
    if (user.role === "admin") {
      // Get the file owner
      const [fileOwner] = await executeQuery<any>(
        `SELECT user_id FROM ecu_files WHERE id = ?`,
        [fileId]
      );

      if (fileOwner && fileOwner.user_id !== user.id) {
        // Create a notification
        await executeQuery(
          `INSERT INTO notifications 
           (user_id, title, message, type, reference_id, reference_type) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            fileOwner.user_id,
            "New comment on your ECU file",
            "An admin has added a comment to your ECU file.",
            "admin_message",
            fileId,
            "ecu_file",
          ]
        );
      }
    }

    return NextResponse.json({
      success: true,
      commentId: result.insertId,
      message: "Comment added successfully",
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 }
    );
  }
}
