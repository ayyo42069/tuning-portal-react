import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/authMiddleware";
import { resolveSecurityAlert } from "@/lib/securityLogging";
import { logApiAccess, logAdminAction } from "@/lib/securityMiddleware";
import { SecurityEventType } from "@/lib/securityLogging";

interface ResolveAlertRequest {
  alertId: number;
  notes: string;
}

/**
 * POST handler for resolving security alerts
 * This endpoint is restricted to admin users only
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate the user
    const authResult = await authenticateUser(request);

    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    // Check if user is an admin
    if (!authResult.user || authResult.user.role !== "admin") {
      // Log unauthorized access attempt
      await logApiAccess(
        authResult.user?.id || undefined,
        request,
        "/api/admin/security/alerts/resolve",
        true
      );

      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    // Parse request body
    const body: ResolveAlertRequest = await request.json();
    const { alertId, notes } = body;

    if (!alertId || !notes) {
      return NextResponse.json(
        { error: "Alert ID and resolution notes are required" },
        { status: 400 }
      );
    }

    // Log the admin action
    await logAdminAction(
      authResult.user.id,
      SecurityEventType.ADMIN_SYSTEM_SETTING_CHANGE,
      request,
      {
        action: "resolve_security_alert",
        alertId,
        notes,
      }
    );

    // Resolve the security alert
    const success = await resolveSecurityAlert(
      alertId,
      authResult.user.id,
      notes
    );

    if (!success) {
      return NextResponse.json(
        { error: "Failed to resolve security alert" },
        { status: 500 }
      );
    }

    // Return success response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error resolving security alert:", error);
    return NextResponse.json(
      { error: "Failed to resolve security alert" },
      { status: 500 }
    );
  }
}
