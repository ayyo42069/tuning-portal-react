"use client";

import { useState } from "react";
import TicketSystem from "./tickets/TicketSystem";
import { User } from "./tickets/types";

/**
 * TicketSystem Wrapper Component
 *
 * This component serves as the main entry point for the ticket support system.
 * It wraps the modularized TicketSystem component and handles passing the current user.
 */
const TicketSystemWrapper = () => {
  // In a real application, this would likely come from a context or auth provider
  // For now, we'll use a placeholder user
  const [currentUser] = useState<User>({
    id: 1,
    username: "CurrentUser",
    role: "user", // or "admin" for testing admin features
  });

  return (
    <div className="ticket-system-container">
      <TicketSystem currentUser={currentUser} />
    </div>
  );
};

export default TicketSystemWrapper;
