import React, { useEffect } from "react";
import { Ticket, User } from "./types";
import { useInView } from "react-intersection-observer";

interface TicketListProps {
  tickets: Ticket[];
  onSelectTicket: (ticket: Ticket) => void;
  currentUser: User;
  onLoadMore: () => void;
}

const TicketList = ({ tickets, onSelectTicket, currentUser, onLoadMore }: TicketListProps) => {
  const { ref, inView } = useInView({
    threshold: 0,
  });

  useEffect(() => {
    if (inView) {
      onLoadMore();
    }
  }, [inView, onLoadMore]);

  return (
    <div className="flex-1 overflow-y-auto">
      {tickets.map((ticket) => (
        <div
          key={ticket.id}
          onClick={() => onSelectTicket(ticket)}
          className="p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors duration-200"
        >
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {ticket.subject}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {ticket.description.substring(0, 100)}
                {ticket.description.length > 100 ? "..." : ""}
              </p>
            </div>
            <div className="flex flex-col items-end">
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  ticket.status === "open"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                    : ticket.status === "in_progress"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                    : ticket.status === "resolved"
                    ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
                }`}
              >
                {ticket.status.replace("_", " ")}
              </span>
              <span
                className={`text-xs mt-2 px-2 py-1 rounded-full ${
                  ticket.priority === "urgent"
                    ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                    : ticket.priority === "high"
                    ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
                    : ticket.priority === "medium"
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
                }`}
              >
                {ticket.priority}
              </span>
            </div>
          </div>
          <div className="mt-2 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
            <span>Created by {ticket.username}</span>
            <span>
              {ticket.assignedUsername
                ? `Assigned to ${ticket.assignedUsername}`
                : "Unassigned"}
            </span>
          </div>
        </div>
      ))}
      <div ref={ref} className="h-10" />
    </div>
  );
};

export default TicketList;
