// Ticket system related types

export type Ticket = {
  id: number;
  userId: number;
  username: string;
  subject: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  assignedTo?: number;
  assignedUsername?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
};

export type TicketResponse = {
  id: number;
  ticketId: number;
  userId: number;
  username: string;
  userRole: string;
  message: string;
  isInternal: boolean;
  createdAt: string;
};

export type TicketAttachment = {
  id: number;
  ticketId: number;
  responseId?: number;
  fileName: string;
  filePath: string;
  fileSize: number;
  fileType: string;
  uploadedBy: number;
  uploadedByUsername: string;
  createdAt: string;
};

export type TicketHistory = {
  id: number;
  ticketId: number;
  changedBy: number;
  changedByUsername: string;
  oldStatus?: string;
  newStatus?: string;
  oldPriority?: string;
  newPriority?: string;
  oldAssignedTo?: number;
  oldAssignedUsername?: string;
  newAssignedTo?: number;
  newAssignedUsername?: string;
  comment?: string;
  createdAt: string;
};

export type User = {
  id: number;
  username: string;
  role: string;
};

export type TicketSystemProps = {
  currentUser: User;
};
