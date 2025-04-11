import React from "react";
import { Ticket, User } from "./types";

type TicketListProps = {
  tickets: Ticket[];
  onSelectTicket: (ticket: Ticket) => void;
  currentUser: User;
};

const TicketList: React.FC<TicketListProps> = ({
  tickets,
  onSelectTicket,
  currentUser,
}) => {
  // Helper function to get status color
  const getStatusColor = (status: Ticket["status"]) => {
    switch (status) {
      case "open":
        return "bg-blue-100/80 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200/50 dark:border-blue-700/50";
      case "in_progress":
        return "bg-yellow-100/80 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 border border-yellow-200/50 dark:border-yellow-700/50";
      case "resolved":
        return "bg-green-100/80 text-green-800 dark:bg-green-900/40 dark:text-green-300 border border-green-200/50 dark:border-green-700/50";
      case "closed":
        return "bg-gray-100/80 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300 border border-gray-200/50 dark:border-gray-700/50";
      default:
        return "bg-gray-100/80 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300 border border-gray-200/50 dark:border-gray-700/50";
    }
  };

  // Helper function to get priority color
  const getPriorityColor = (priority: Ticket["priority"]) => {
    switch (priority) {
      case "low":
        return "bg-green-100/80 text-green-800 dark:bg-green-900/40 dark:text-green-300 border border-green-200/50 dark:border-green-700/50";
      case "medium":
        return "bg-blue-100/80 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200/50 dark:border-blue-700/50";
      case "high":
        return "bg-orange-100/80 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300 border border-orange-200/50 dark:border-orange-700/50";
      case "urgent":
        return "bg-red-100/80 text-red-800 dark:bg-red-900/40 dark:text-red-300 border border-red-200/50 dark:border-red-700/50";
      default:
        return "bg-blue-100/80 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200/50 dark:border-blue-700/50";
    }
  };

  // Format date to a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="space-y-3">
      {tickets.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-6 text-sm">
          No tickets found. Create a new ticket to get started.
        </div>
      ) : (
        tickets.map((ticket) => (
          <div
            key={ticket.id}
            onClick={() => onSelectTicket(ticket)}
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-4 rounded-xl shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 hover:translate-y-[-2px] border border-gray-200/50 dark:border-gray-700/50 group"
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium text-sm text-gray-900 dark:text-white">
                #{ticket.id}: {ticket.subject}
              </h4>
              <div className="flex space-x-2">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium shadow-sm backdrop-blur-sm ${getStatusColor(
                    ticket.status
                  )}`}
                >
                  {ticket.status.replace("_", " ")}
                </span>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium shadow-sm backdrop-blur-sm ${getPriorityColor(
                    ticket.priority
                  )}`}
                >
                  {ticket.priority}
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
              {ticket.description}
            </p>

            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
              <div>
                <span className="font-medium">From:</span> {ticket.username}
              </div>
              <div>
                {ticket.assignedUsername ? (
                  <>
                    <span className="font-medium">Assigned to:</span>{" "}
                    {ticket.assignedUsername}
                  </>
                ) : (
                  <span className="italic">Unassigned</span>
                )}
              </div>
              <div>{formatDate(ticket.createdAt)}</div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default TicketList;
