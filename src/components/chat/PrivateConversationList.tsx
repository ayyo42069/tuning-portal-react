import React from "react";
import { PrivateConversation } from "./types";

type PrivateConversationListProps = {
  privateConversations: PrivateConversation;
  setSelectedConversationUserId: (userId: number) => void;
  setShowUserList: (show: boolean) => void;
  currentUser: { role: string };
};

const PrivateConversationList: React.FC<PrivateConversationListProps> = ({
  privateConversations,
  setSelectedConversationUserId,
  setShowUserList,
  currentUser,
}) => {
  return (
    <div className="space-y-2 p-2">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Select a conversation:
      </h3>
      {Object.entries(privateConversations).map(([userId, conversation]) => (
        <div
          key={userId}
          onClick={() => setSelectedConversationUserId(Number(userId))}
          className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span
                className={`w-2 h-2 rounded-full mr-2 ${
                  conversation.user.role === "admin"
                    ? "bg-red-500"
                    : "bg-green-500"
                }`}
              ></span>
              <span className="font-medium text-sm">
                {conversation.user.username}
              </span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(conversation.messages[0].createdAt).toLocaleString([], {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
            {conversation.messages[conversation.messages.length - 1].message}
          </p>
        </div>
      ))}
      {Object.keys(privateConversations).length === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400 py-6 text-xs">
          No private messages yet.
          {currentUser.role === "admin" && (
            <div className="mt-2">
              <button
                onClick={() => setShowUserList(true)}
                className="text-xs text-blue-600 hover:underline"
              >
                Click here to start a private conversation
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PrivateConversationList;
