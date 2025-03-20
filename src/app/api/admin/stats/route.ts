import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { logApiAccess } from "@/lib/securityMiddleware";

export async function GET(request: NextRequest) {
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
    if (!user || user.role !== "admin") {
      // Log unauthorized access attempt
      await logApiAccess(
        user?.id || undefined,
        request,
        "/api/admin/stats",
        true
      );

      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Log the API access
    await logApiAccess(user.id, request, "/api/admin/stats", false);

    // Get pending requests count
    const pendingRequestsResult = await executeQuery<any[]>(
      `SELECT COUNT(*) as count FROM ecu_files WHERE status = 'pending'`
    );
    const pendingRequests = pendingRequestsResult[0]?.count || 0;

    // Get total users count
    const totalUsersResult = await executeQuery<any[]>(
      `SELECT COUNT(*) as count FROM users WHERE role = 'user'`
    );
    const totalUsers = totalUsersResult[0]?.count || 0;

    // Get total credits in the system
    const totalCreditsResult = await executeQuery<any[]>(
      `SELECT SUM(credits) as total FROM user_credits`
    );
    const totalCredits = totalCreditsResult[0]?.total || 0;

    return NextResponse.json({
      pendingRequests,
      totalUsers,
      totalCredits,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching admin statistics" },
      { status: 500 }
    );
  }
}
