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

    // Check if user is admin
    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Get all users with their credits
    // Using GROUP BY to ensure each user appears only once with their total credits
    const users = await executeQuery<any[]>(
      `SELECT u.id, u.username, u.email, u.role, COALESCE(uc.credits, 0) as credits, u.created_at 
       FROM users u
       LEFT JOIN user_credits uc ON u.id = uc.user_id 
       GROUP BY u.id, u.username, u.email, u.role, u.created_at
       ORDER BY u.created_at DESC`
    );

    return NextResponse.json({
      success: true,
      users: users || [],
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching users" },
      { status: 500 }
    );
  }
}
