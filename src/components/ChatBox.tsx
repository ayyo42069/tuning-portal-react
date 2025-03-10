"use client";

import { useState } from "react";
import ChatBox from "./chat/ChatBox";
import { User } from "./chat/types";

/**
 * ChatBox Wrapper Component
 *
 * This component serves as the main entry point for the chat functionality.
 * It wraps the modularized ChatBox component and handles passing the current user.
 */
const ChatBoxWrapper = () => {
  // In a real application, this would likely come from a context or auth provider
  // For now, we'll use a placeholder user
  const [currentUser] = useState<User>({
    id: 1,
    username: "CurrentUser",
    role: "user", // or "admin" for testing admin features
  });

  return (
    <div className="chat-box-container">
      <ChatBox currentUser={currentUser} />
    </div>
  );
};

export default ChatBoxWrapper;
