// Types for the ticket system API

// User interface
export interface User {
  id: number;
  username: string;
  role: string;
}

// Decoded token interface
export interface DecodedToken {
  id: number;
  username: string;
  role: string;
}

// Ticket interface from database
export interface TicketDB {
  id: number;
  user_id: number;
  subject: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  assigned_to: number | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  username: string;
  assignedUsername: string | null;
}

// Formatted ticket for API responses
export interface Ticket {
  id: number;
  userId: number;
  username: string;
  subject: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  assignedTo: number | null;
  assignedUsername: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
}

// Ticket response from database
export interface TicketResponseDB {
  id: number;
  ticket_id: number;
  user_id: number;
  message: string;
  is_internal: number; // 0 or 1
  created_at: string;
  username?: string;
  userRole?: string;
}

// Formatted ticket response for API
export interface TicketResponse {
  id: number;
  ticketId: number;
  userId: number;
  username: string;
  userRole: string;
  message: string;
  isInternal: boolean;
  createdAt: string;
}

// Ticket count result
export interface TicketCountResult {
  total: number;
}

// Updated ticket data
export interface UpdatedTicket {
  ticket: Ticket;
}
