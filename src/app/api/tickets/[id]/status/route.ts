import { NextRequest, NextResponse } from "next/server";
import { executeQuery, getRow } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { DecodedToken, TicketDB } from "../../types";

// PUT /api/tickets/[id]/status - Update ticket status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the auth token from cookies
    const authToken = request.cookies.get("auth_token")?.value;
    if (!authToken) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify the token
    const decodedToken = verifyToken(authToken);
    if (!decodedToken) {
      return NextResponse.json(
        { error: "Invalid authentication token" },
        { status: 401 }
      );
    }

    const userId = decodedToken.id;
    const userRole = decodedToken.role;
    const ticketId = parseInt(params.id);

    // Validate ticket ID
    if (isNaN(ticketId)) {
      return NextResponse.json({ error: "Invalid ticket ID" }, { status: 400 });
    }

    // Parse request body
    const { status } = await request.json();

    // Validate status
    const validStatuses = ["open", "in_progress", "resolved", "closed"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    // Check if the user has access to this ticket
    const ticket = await getRow<TicketDB>(
      `SELECT * FROM tickets WHERE id = ?`,
      [ticketId]
    );

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Regular users can only update status of their own tickets
    // and have limited status change options
    if (userRole !== "admin") {
      if (ticket.user_id !== userId) {
        return NextResponse.json(
          { error: "You don't have permission to update this ticket" },
          { status: 403 }
        );
      }

      // Regular users can only set tickets to 'closed'
      if (status !== "closed") {
        return NextResponse.json(
          { error: "You can only close your tickets" },
          { status: 403 }
        );
      }
    }

    // Get the old status for history tracking
    const oldStatus = ticket.status;

    // Update the ticket status
    await executeQuery(
      `UPDATE tickets SET 
       status = ?, 
       resolved_at = ${
         status === "resolved"
           ? "NOW()"
           : status === "closed" && oldStatus === "resolved"
           ? "resolved_at"
           : "NULL"
       }
       WHERE id = ?`,
      [status, ticketId]
    );

    // Add to ticket history
    await executeQuery(
      `INSERT INTO ticket_history 
       (ticket_id, changed_by, old_status, new_status, comment) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        ticketId,
        userId,
        oldStatus,
        status,
        `Status changed from ${oldStatus} to ${status}`,
      ]
    );

    // Add a system response to show the status change
    await executeQuery(
      `INSERT INTO ticket_responses 
       (ticket_id, user_id, message, is_internal) 
       VALUES (?, ?, ?, ?)`,
      [ticketId, userId, `Status changed from ${oldStatus} to ${status}`, 0]
    );

    return NextResponse.json({ success: true, status });
  } catch (error) {
    console.error("Error updating ticket status:", error);
    return NextResponse.json(
      { error: "Failed to update ticket status" },
      { status: 500 }
    );
  }
}
