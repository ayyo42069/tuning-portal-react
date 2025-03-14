import { NextRequest, NextResponse } from "next/server";
import { executeQuery, getRow } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { DecodedToken, TicketDB, UpdatedTicket } from "../../types";

// PUT /api/tickets/[id]/assign - Assign ticket to a user
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
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
    const params = await context.params;
    const ticketId = parseInt(params.id);

    // Validate ticket ID
    if (isNaN(ticketId)) {
      return NextResponse.json({ error: "Invalid ticket ID" }, { status: 400 });
    }

    // Only admins can assign tickets
    if (userRole !== "admin") {
      return NextResponse.json(
        { error: "You don't have permission to assign tickets" },
        { status: 403 }
      );
    }

    // Parse request body
    const { assignedTo } = await request.json();

    // Validate assignedTo
    if (!assignedTo && assignedTo !== null) {
      return NextResponse.json(
        { error: "Invalid assignedTo value" },
        { status: 400 }
      );
    }

    // Check if the ticket exists
    const ticket = await getRow<TicketDB>(
      `SELECT * FROM tickets WHERE id = ?`,
      [ticketId]
    );

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // If assignedTo is provided, check if the user exists
    let assignedUsername = null;
    if (assignedTo) {
      const assignedUser = await getRow<{ username: string }>(
        `SELECT username FROM users WHERE id = ?`,
        [assignedTo]
      );

      if (!assignedUser) {
        return NextResponse.json(
          { error: "Assigned user not found" },
          { status: 404 }
        );
      }

      assignedUsername = assignedUser.username;
    }

    // Get the old assigned user for history tracking
    const oldAssignedTo = ticket.assigned_to;

    // Update the ticket
    await executeQuery(`UPDATE tickets SET assigned_to = ? WHERE id = ?`, [
      assignedTo || null,
      ticketId,
    ]);

    // Add to ticket history
    await executeQuery(
      `INSERT INTO ticket_history 
       (ticket_id, changed_by, old_assigned_to, new_assigned_to, comment) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        ticketId,
        userId,
        oldAssignedTo || null,
        assignedTo || null,
        assignedTo
          ? `Ticket assigned to ${assignedUsername}`
          : "Ticket unassigned",
      ]
    );

    // Add a system response to show the assignment change
    await executeQuery(
      `INSERT INTO ticket_responses 
       (ticket_id, user_id, message, is_internal) 
       VALUES (?, ?, ?, ?)`,
      [
        ticketId,
        userId,
        assignedTo && assignedUsername
          ? `Ticket assigned to ${assignedUsername}`
          : "Ticket unassigned",
        0,
      ]
    );

    return NextResponse.json({
      success: true,
      assignedTo: assignedTo || null,
      assignedUsername: assignedUsername,
    });
  } catch (error) {
    console.error("Error assigning ticket:", error);
    return NextResponse.json(
      { error: "Failed to assign ticket" },
      { status: 500 }
    );
  }
}
