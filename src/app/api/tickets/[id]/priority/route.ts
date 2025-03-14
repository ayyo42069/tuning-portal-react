import { NextRequest, NextResponse } from "next/server";
import { executeQuery, getRow } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { DecodedToken, TicketDB } from "../../types";

// PUT /api/tickets/[id]/priority - Update ticket priority
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
    const { priority } = await request.json();

    // Validate priority
    const validPriorities = ["low", "medium", "high", "urgent"];
    if (!priority || !validPriorities.includes(priority)) {
      return NextResponse.json(
        { error: "Invalid priority value" },
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

    // Only admins can update priority
    if (userRole !== "admin") {
      return NextResponse.json(
        { error: "You don't have permission to update ticket priority" },
        { status: 403 }
      );
    }

    // Get the old priority for history tracking
    const oldPriority = ticket.priority;

    // Update the ticket priority
    await executeQuery(`UPDATE tickets SET priority = ? WHERE id = ?`, [
      priority,
      ticketId,
    ]);

    // Add to ticket history
    await executeQuery(
      `INSERT INTO ticket_history 
       (ticket_id, changed_by, old_priority, new_priority, comment) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        ticketId,
        userId,
        oldPriority,
        priority,
        `Priority changed from ${oldPriority} to ${priority}`,
      ]
    );

    // Add a system response to show the priority change
    await executeQuery(
      `INSERT INTO ticket_responses 
       (ticket_id, user_id, message, is_internal) 
       VALUES (?, ?, ?, ?)`,
      [
        ticketId,
        userId,
        `Priority changed from ${oldPriority} to ${priority}`,
        0,
      ]
    );

    return NextResponse.json({ success: true, priority });
  } catch (error) {
    console.error("Error updating ticket priority:", error);
    return NextResponse.json(
      { error: "Failed to update ticket priority" },
      { status: 500 }
    );
  }
}
