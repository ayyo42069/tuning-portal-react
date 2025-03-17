import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

// DELETE handler to remove a comment
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
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

    // Get comment ID from URL
    const { id: commentId } = await context.params;
    if (!commentId) {
      return NextResponse.json(
        { error: "Comment ID is required" },
        { status: 400 }
      );
    }

    // Check if the comment exists and user has permission to delete it
    // Users can delete their own comments, admins can delete any comment
    const comments = await executeQuery<any[]>(
      `SELECT c.id, c.user_id, c.ecu_file_id 
       FROM ecu_file_comments c
       WHERE c.id = ?`,
      [commentId]
    );

    if (!comments || comments.length === 0) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    const comment = comments[0];

    // Check if user has permission to delete this comment
    if (comment.user_id !== user.id && user.role !== "admin") {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    // Delete the comment
    await executeQuery(`DELETE FROM ecu_file_comments WHERE id = ?`, [
      commentId,
    ]);

    return NextResponse.json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}
