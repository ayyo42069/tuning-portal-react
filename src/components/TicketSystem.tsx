"use client";

import { useAuth } from "@/lib/AuthProvider";
import TicketSystem from "./tickets/TicketSystem";
import { User } from "./tickets/types";

/**
 * TicketSystem Wrapper Component
 *
 * This component serves as the main entry point for the ticket support system.
 * It wraps the modularized TicketSystem component and handles passing the current user.
 */
const TicketSystemWrapper = () => {
  // Use the auth context instead of a placeholder user
  const { user, isLoading, error } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900 p-4 rounded-md text-red-800 dark:text-red-200">
        {error}
      </div>
    );
  }

  // Show login required message if no user
  if (!user) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-md text-yellow-800 dark:text-yellow-200">
        Please log in to access the ticket system.
      </div>
    );
  }

  return (
    <div className="ticket-system-container">
      <TicketSystem currentUser={user} />
    </div>
  );
};

export default TicketSystemWrapper;
