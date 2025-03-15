import { NextRequest, NextResponse } from "next/server";
import { executeQuery, getRow } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import {
  DecodedToken,
  TicketDB,
  TicketResponseDB,
  TicketResponse,
} from "../../types";

// GET /api/tickets/[id]/responses - Get responses for a specific ticket
export async function GET(
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

    // Check if the user has access to this ticket
    const ticket = await getRow<TicketDB>(
      `SELECT * FROM tickets WHERE id = ?`,
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

    // Get responses for the ticket
    const responses = await executeQuery<
      (TicketResponseDB & { username: string; userRole: string })[]
    >(
      `SELECT r.*, u.username, u.role as userRole
       FROM ticket_responses r
       JOIN users u ON r.user_id = u.id
       WHERE r.ticket_id = ?
       ORDER BY r.created_at ASC`,
      [ticketId]
    );

    // Transform database column names to camelCase for frontend
    const formattedResponses = responses.map(
      (response: TicketResponseDB): TicketResponse => ({
        id: response.id,
        ticketId: response.ticket_id,
        userId: response.user_id,
        username: response.username || "",
        userRole: response.userRole || "",
        message: response.message,
        isInternal: response.is_internal === 1, // Convert from 0/1 to boolean
        createdAt: response.created_at,
      })
    );

    return NextResponse.json({ responses: formattedResponses });
  } catch (error) {
    console.error("Error fetching ticket responses:", error);
    return NextResponse.json(
      { error: "Failed to fetch ticket responses" },
      { status: 500 }
    );
  }
}

// POST /api/tickets/[id]/responses - Add a response to a ticket
export async function POST(
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

    // Parse request body
    const { message, isInternal = false } = await request.json();

    // Validate required fields
    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
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

    // Regular users can only respond to their own tickets
    // and cannot create internal notes
    if (userRole !== "admin") {
      if (ticket.user_id !== userId) {
        return NextResponse.json(
          { error: "You don't have permission to respond to this ticket" },
          { status: 403 }
        );
      }

      // Regular users cannot create internal notes
      if (isInternal) {
        return NextResponse.json(
          { error: "You don't have permission to create internal notes" },
          { status: 403 }
        );
      }
    }

    // Insert the response
    const result = await executeQuery<{ insertId: number }>(
      `INSERT INTO ticket_responses (ticket_id, user_id, message, is_internal) 
       VALUES (?, ?, ?, ?)`,
      [ticketId, userId, message, isInternal ? 1 : 0]
    );

    const responseId = result.insertId;

    // Update ticket status if needed
    // If a user responds to their ticket, set it back to 'open'
    // If an admin responds to a ticket, set it to 'in_progress' unless it's an internal note
    let newStatus = null;

    if (
      userRole === "admin" &&
      !isInternal &&
      ticket.status !== "resolved" &&
      ticket.status !== "closed"
    ) {
      newStatus = "in_progress";
    } else if (userRole !== "admin" && ticket.status !== "open") {
      newStatus = "open";
    }

    if (newStatus) {
      await executeQuery(`UPDATE tickets SET status = ? WHERE id = ?`, [
        newStatus,
        ticketId,
      ]);
    }

    // Get the created response with user info
    const response = await getRow<
      TicketResponseDB & { username: string; userRole: string }
    >(
      `SELECT r.*, u.username, u.role as userRole
       FROM ticket_responses r
       JOIN users u ON r.user_id = u.id
       WHERE r.id = ?`,
      [responseId]
    );

    if (!response) {
      return NextResponse.json(
        { error: "Failed to retrieve created response" },
        { status: 500 }
      );
    }

    // Format the response for the frontend
    const formattedResponse: TicketResponse = {
      id: response.id,
      ticketId: response.ticket_id,
      userId: response.user_id,
      username: response.username || "",
      userRole: response.userRole || "",
      message: response.message,
      isInternal: response.is_internal === 1,
      createdAt: response.created_at,
    };

    return NextResponse.json({ response: formattedResponse });
  } catch (error) {
    console.error("Error adding ticket response:", error);
    return NextResponse.json(
      { error: "Failed to add response" },
      { status: 500 }
    );
  }
}
