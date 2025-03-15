import { NextRequest, NextResponse } from "next/server";
import { executeQuery, getRow } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { DecodedToken, TicketDB, Ticket, TicketCountResult } from "./types";

// GET /api/tickets - Get all tickets or filtered by user
export async function GET(request: NextRequest) {
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

    // Get filter parameter
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Validate pagination parameters
    if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1 || limit > 50) {
      return NextResponse.json(
        { error: "Invalid pagination parameters" },
        { status: 400 }
      );
    }

    let query = `
      SELECT t.*, 
        u1.username, 
        u2.username as assignedUsername
      FROM tickets t
      JOIN users u1 ON t.user_id = u1.id
      LEFT JOIN users u2 ON t.assigned_to = u2.id
    `;

    const queryParams = [];

    // Apply filters based on user role and filter parameter
    if (userRole !== "admin") {
      // Regular users can only see their own tickets
      query += " WHERE t.user_id = ?";
      queryParams.push(userId);
    } else {
      // Admin filters
      if (filter === "my") {
        query += " WHERE t.user_id = ?";
        queryParams.push(userId);
      } else if (filter === "assigned") {
        query += " WHERE t.assigned_to = ?";
        queryParams.push(userId);
      }
      // For 'all', no WHERE clause needed for admins
    }

    // Add status filter if provided
    const status = searchParams.get("status");
    if (status) {
      const validStatuses = ["open", "in_progress", "resolved", "closed"];
      if (validStatuses.includes(status)) {
        if (query.includes("WHERE")) {
          query += " AND t.status = ?";
        } else {
          query += " WHERE t.status = ?";
        }
        queryParams.push(status);
      }
    }

    // Add priority filter if provided
    const priority = searchParams.get("priority");
    if (priority) {
      const validPriorities = ["low", "medium", "high", "urgent"];
      if (validPriorities.includes(priority)) {
        if (query.includes("WHERE")) {
          query += " AND t.priority = ?";
        } else {
          query += " WHERE t.priority = ?";
        }
        queryParams.push(priority);
      }
    }

    // Count total tickets for pagination
    const countQuery = `SELECT COUNT(*) as total FROM (${query}) as filtered_tickets`;

    const countResult = await getRow<TicketCountResult>(
      countQuery,
      queryParams
    );
    const total = countResult?.total || 0;

    // Add sorting and pagination
    query += " ORDER BY t.created_at DESC LIMIT ? OFFSET ?";

    // Calculate pagination values
    const offset = (page - 1) * limit;

    // Add pagination parameters to the query params array
    // Explicitly convert to numbers to ensure proper type handling
    queryParams.push(Number(limit));
    queryParams.push(Number(offset));

    // Log the query and parameters for debugging
    console.log("Query:", query);
    console.log("Parameters:", queryParams);

    const tickets = await executeQuery<TicketDB[]>(query, queryParams);

    // Transform database column names to camelCase for frontend
    const formattedTickets = tickets.map((ticket: TicketDB) => ({
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
    }));

    // Return with pagination metadata
    return NextResponse.json({
      tickets: formattedTickets,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json(
      { error: "Failed to fetch tickets" },
      { status: 500 }
    );
  }
}

// POST /api/tickets - Create a new ticket
export async function POST(request: NextRequest) {
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

    // Parse request body
    const { subject, description, priority } = await request.json();

    // Validate required fields
    if (!subject || !description) {
      return NextResponse.json(
        { error: "Subject and description are required" },
        { status: 400 }
      );
    }

    // Validate priority
    const validPriorities = ["low", "medium", "high", "urgent"];
    if (!priority || !validPriorities.includes(priority)) {
      return NextResponse.json(
        { error: "Invalid priority value" },
        { status: 400 }
      );
    }

    // Insert the new ticket
    const result = await executeQuery<{ insertId: number }>(
      `INSERT INTO tickets (user_id, subject, description, priority, status) 
       VALUES (?, ?, ?, ?, 'open')`,
      [userId, subject, description, priority || "medium"]
    );

    // Get the created ticket
    const ticketId = result.insertId;
    const ticket = await getRow<TicketDB>(
      `SELECT t.*, u1.username, u2.username as assignedUsername
       FROM tickets t
       JOIN users u1 ON t.user_id = u1.id
       LEFT JOIN users u2 ON t.assigned_to = u2.id
       WHERE t.id = ?`,
      [ticketId]
    );

    if (!ticket) {
      return NextResponse.json(
        { error: "Failed to retrieve created ticket" },
        { status: 500 }
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

    return NextResponse.json({ ticket: formattedTicket }, { status: 201 });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return NextResponse.json(
      { error: "Failed to create ticket" },
      { status: 500 }
    );
  }
}
