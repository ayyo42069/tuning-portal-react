import React from "react";
import { User } from "./types";

type ChatInputProps = {
  newMessage: string;
  setNewMessage: (message: string) => void;
  sendMessage: (e: React.FormEvent) => void;
  loading: boolean;
  activeTab: "public" | "private";
  selectedConversationUserId: number | null;
  privateConversations: {
    [key: string]: { user: { username: string }; messages: any[] };
  };
};

const ChatInput: React.FC<ChatInputProps> = ({
  newMessage,
  setNewMessage,
  sendMessage,
  loading,
  activeTab,
  selectedConversationUserId,
  privateConversations,
}) => {
  return (
    <div className="border-t border-gray-200 dark:border-gray-700 p-2 bg-white dark:bg-gray-800">
      <form onSubmit={sendMessage} className="flex space-x-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={`Type your ${activeTab === "private" ? "private" : "public"} message...`}
          className="flex-1 p-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !newMessage.trim()}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-1 h-3 w-3 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Send
            </span>
          ) : (
            "Send"
          )}
        </button>
      </form>
      {activeTab === "private" &&
        selectedConversationUserId &&
        privateConversations[selectedConversationUserId.toString()] && (
          <div className="mt-1 text-xs text-center text-purple-600 dark:text-purple-400">
            Messaging privately to{" "}
            {privateConversations[selectedConversationUserId.toString()].user.username}
          </div>
        )}
      {activeTab === "private" && !selectedConversationUserId && (
        <div className="mt-1 text-xs text-center text-gray-500 dark:text-gray-400">
          Select a conversation to send a message
        </div>
      )}
    </div>
  );
};

export default ChatInput;