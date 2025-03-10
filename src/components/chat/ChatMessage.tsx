import React, { useState } from "react";
import { ChatMessage as ChatMessageType, User } from "./types";
import { getUserColor, getUserTextColor, formatTime } from "./utils";

type ChatMessageProps = {
  message: ChatMessageType;
  currentUser: User;
  onEdit: (message: ChatMessageType) => void;
  onDelete: (messageId: number, isPrivate: boolean) => void;
  onSaveEdit: (messageId: number, editText: string) => void;
  onCancelEdit: () => void;
  editingMessageId: number | null;
  editText: string;
  setEditText: (text: string) => void;
  setModerationUserId: (userId: string) => void;
  setModerationAction: (action: string) => void;
};

const ChatMessageComponent: React.FC<ChatMessageProps> = ({
  message,
  currentUser,
  onEdit,
  onDelete,
  onSaveEdit,
  onCancelEdit,
  editingMessageId,
  editText,
  setEditText,
  setModerationUserId,
  setModerationAction,
}) => {
  return (
    <div
      className={`p-2 rounded-lg ${
        message.senderId === currentUser.id
          ? "bg-blue-50 dark:bg-blue-900/30 ml-4"
          : "bg-white dark:bg-gray-800 mr-4"
      }`}
    >
      {/* Message header with user info and actions */}
      <div className="flex justify-between items-start mb-1">
        <div className="flex items-center">
          {/* User avatar */}
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${getUserColor(
              message.senderId
            )}`}
          >
            <span className="text-xs font-bold text-white">
              {message.senderUsername.charAt(0).toUpperCase()}
            </span>
          </div>
          
          {/* Username with role indicator */}
          <div>
            <span
              className={`font-medium text-xs ${
                message.senderRole === "admin"
                  ? "text-red-600 dark:text-red-400"
                  : getUserTextColor(message.senderId)
              }`}
            >
              {message.senderUsername}
              {message.senderRole === "admin" && (
                <span className="ml-1 text-xs bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 px-1 py-0.5 rounded-full text-[10px]">
                  admin
                </span>
              )}
            </span>
            {message.isPrivate && (
              <span className="ml-1 text-xs bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200 px-1 py-0.5 rounded-full text-[10px]">
                private
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center">
          {/* Timestamp */}
          <span className="text-gray-500 dark:text-gray-400 text-xs mr-2">
            {formatTime(message.createdAt)}
          </span>

          {/* Message actions menu */}
          {(message.senderId === currentUser.id || currentUser.role === "admin") && (
            <div className="relative group">
              <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 p-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                  />
                </svg>
              </button>
              <div className="absolute right-0 mt-1 w-24 bg-white dark:bg-gray-700 rounded-md shadow-lg border border-gray-200 dark:border-gray-600 invisible group-hover:visible z-10">
                <button
                  onClick={() => onEdit(message)}
                  className="block w-full text-left px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(message.id, message.isPrivate)}
                  className="block w-full text-left px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  Delete
                </button>
                {currentUser.role === "admin" && message.senderId !== currentUser.id && (
                  <>
                    <hr className="border-gray-200 dark:border-gray-600" />
                    <button
                      onClick={() => {
                        setModerationUserId(message.senderId.toString());
                        setModerationAction("mute");
                      }}
                      className="block w-full text-left px-3 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      Mute User
                    </button>
                    <button
                      onClick={() => {
                        setModerationUserId(message.senderId.toString());
                        setModerationAction("ban");
                      }}
                      className="block w-full text-left px-3 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      Ban User
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Message content or edit form */}
      {editingMessageId === message.id ? (
        <div className="mt-1">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full p-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            rows={2}
          />
          <div className="flex justify-end space-x-2 mt-1">
            <button
              onClick={onCancelEdit}
              className="px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={() => onSaveEdit(message.id, editText)}
              className="px-2 py-0.5 text-xs bg-blue-500 text-white rounded-md"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap text-xs">
            {message.message}
          </p>

          {message.isEdited && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Edited{" "}
              {message.editorUsername ? `by ${message.editorUsername}` : ""}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ChatMessageComponent;