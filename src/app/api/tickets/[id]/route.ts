import { NextRequest, NextResponse } from "next/server";
import { executeQuery, getRow } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { DecodedToken, TicketDB, Ticket } from "../types";

// GET /api/tickets/[id] - Get a specific ticket by ID
export async function GET(
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

    // Get the ticket with user information
    const ticket = await getRow<TicketDB>(
      `SELECT t.*, 
        u1.username, 
        u2.username as assignedUsername
      FROM tickets t
      JOIN users u1 ON t.user_id = u1.id
      LEFT JOIN users u2 ON t.assigned_to = u2.id
      WHERE t.id = ?`,
      [ticketId]
    );

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Regular users can only access their own tickets
    if (userRole !== "admin" && ticket.user_id !== userId) {
      return NextResponse.json(
        { error: "You don't have permission to access this ticket" },
        { status: 403 }
      );
    }

    // Format the ticket for the response
    const formattedTicket: Ticket = {
      id: ticket.id,
      userId: ticket.user_id,
      username: ticket.username,
      subject: ticket.subject,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      assignedTo: ticket.assigned_to,
      assignedUsername: ticket.assignedUsername,
      createdAt: ticket.created_at,
      updatedAt: ticket.updated_at,
      resolvedAt: ticket.resolved_at,
    };

    return NextResponse.json({ ticket: formattedTicket });
  } catch (error) {
    console.error("Error fetching ticket:", error);
    return NextResponse.json(
      { error: "Failed to fetch ticket" },
      { status: 500 }
    );
  }
}

// PUT /api/tickets/[id] - Update a specific ticket
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
    const { subject, description } = await request.json();

    // Validate required fields
    if (!subject || !description) {
      return NextResponse.json(
        { error: "Subject and description are required" },
        { status: 400 }
      );
    }

    // Check if the ticket exists and user has permission
    const ticket = await getRow<TicketDB>(
      `SELECT * FROM tickets WHERE id = ?`,
      [ticketId]
    );

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Regular users can only update their own tickets
    if (userRole !== "admin" && ticket.user_id !== userId) {
      return NextResponse.json(
        { error: "You don't have permission to update this ticket" },
        { status: 403 }
      );
    }

    // Update the ticket
    await executeQuery(
      `UPDATE tickets SET subject = ?, description = ? WHERE id = ?`,
      [subject, description, ticketId]
    );

    // Get the updated ticket with user information
    const updatedTicket = await getRow<TicketDB>(
      `SELECT t.*, 
        u1.username, 
        u2.username as assignedUsername
      FROM tickets t
      JOIN users u1 ON t.user_id = u1.id
      LEFT JOIN users u2 ON t.assigned_to = u2.id
      WHERE t.id = ?`,
      [ticketId]
    );

    // Format the ticket for the response
    if (!updatedTicket) {
      return NextResponse.json(
        { error: "Failed to retrieve updated ticket" },
        { status: 500 }
      );
    }

    const formattedTicket: Ticket = {
      id: updatedTicket.id,
      userId: updatedTicket.user_id,
      username: updatedTicket.username,
      subject: updatedTicket.subject,
      description: updatedTicket.description,
      status: updatedTicket.status,
      priority: updatedTicket.priority,
      assignedTo: updatedTicket.assigned_to,
      assignedUsername: updatedTicket.assignedUsername,
      createdAt: updatedTicket.created_at,
      updatedAt: updatedTicket.updated_at,
      resolvedAt: updatedTicket.resolved_at,
    };

    return NextResponse.json({ ticket: formattedTicket });
  } catch (error) {
    console.error("Error updating ticket:", error);
    return NextResponse.json(
      { error: "Failed to update ticket" },
      { status: 500 }
    );
  }
}

// DELETE /api/tickets/[id] - Delete a specific ticket
export async function DELETE(
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

    // Check if the ticket exists and user has permission
    const ticket = await getRow<TicketDB>(
      `SELECT * FROM tickets WHERE id = ?`,
      [ticketId]
    );

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Only admins or the ticket creator can delete tickets
    if (userRole !== "admin" && ticket.user_id !== userId) {
      return NextResponse.json(
        { error: "You don't have permission to delete this ticket" },
        { status: 403 }
      );
    }

    // Delete the ticket (this will cascade delete responses and attachments)
    await executeQuery(`DELETE FROM tickets WHERE id = ?`, [ticketId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting ticket:", error);
    return NextResponse.json(
      { error: "Failed to delete ticket" },
      { status: 500 }
    );
  }
}
