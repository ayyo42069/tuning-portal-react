"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/lib/NotificationProvider";

type ChatMessage = {
  id: number;
  senderId: number;
  senderUsername: string;
  senderRole: string;
  recipientId?: number;
  recipientUsername?: string;
  message: string;
  isPrivate: boolean;
  isEdited: boolean;
  editedBy?: number;
  editorUsername?: string;
  createdAt: string;
  updatedAt?: string;
};

type User = {
  id: number;
  username: string;
  role: string;
};

type ChatBoxProps = {
  currentUser: User;
};

// Helper function to generate consistent colors for users based on their ID
const getUserColor = (userId: number) => {
  // List of background colors for user avatars
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-yellow-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-red-500",
    "bg-teal-500",
    "bg-orange-500",
    "bg-cyan-500",
  ];

  // Use modulo to ensure we always get a valid index
  return colors[userId % colors.length];
};

// Helper function to get text color for users
const getUserTextColor = (userId: number) => {
  // List of text colors that match the background colors
  const colors = [
    "text-blue-600 dark:text-blue-400",
    "text-green-600 dark:text-green-400",
    "text-purple-600 dark:text-purple-400",
    "text-yellow-600 dark:text-yellow-400",
    "text-pink-600 dark:text-pink-400",
    "text-indigo-600 dark:text-indigo-400",
    "text-red-600 dark:text-red-400",
    "text-teal-600 dark:text-teal-400",
    "text-orange-600 dark:text-orange-400",
    "text-cyan-600 dark:text-cyan-400",
  ];

  return colors[userId % colors.length];
};

// Format time in a consistent way
const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ChatBox = ({ currentUser }: ChatBoxProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [privateMessages, setPrivateMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [privateRecipient, setPrivateRecipient] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [showUserList, setShowUserList] = useState(false);
  const [banned, setBanned] = useState(false);
  const [banInfo, setBanInfo] = useState<any>(null);
  const [muted, setMuted] = useState(false);
  const [muteInfo, setMuteInfo] = useState<any>(null);
  const [moderationView, setModerationView] = useState(false);
  const [bannedUsers, setBannedUsers] = useState<any[]>([]);
  const [mutedUsers, setMutedUsers] = useState<any[]>([]);
  const [moderationAction, setModerationAction] = useState("ban");
  const [moderationUserId, setModerationUserId] = useState("");
  const [moderationReason, setModerationReason] = useState("");
  const [moderationDuration, setModerationDuration] = useState("24");
  const [moderationPermanent, setModerationPermanent] = useState(false);
  const [activeTab, setActiveTab] = useState<"public" | "private">("public");
  const [hasUnreadPrivate, setHasUnreadPrivate] = useState(false);
  const [privateConversations, setPrivateConversations] = useState<{
    [key: string]: { user: User; messages: ChatMessage[] };
  }>({});
  const [selectedConversationUserId, setSelectedConversationUserId] = useState<
    number | null
  >(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { addNotification } = useNotifications();

  // Fetch messages on component mount
  useEffect(() => {
    fetchMessages();
    if (currentUser.role === "admin") {
      fetchUsers();
      fetchModerationData();
    }

    // Set up polling for new messages
    const interval = setInterval(() => {
      fetchMessages(false);
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, privateMessages, activeTab]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Update the fetchMessages function to sort messages in chronological order
  const fetchMessages = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);

      const publicResponse = await fetch("/api/chat");
      const publicData = await publicResponse.json();

      if (!publicResponse.ok) {
        handleErrorResponse(publicData);
        return;
      }

      // Filter and sort public messages in chronological order (newest at bottom)
      const publicOnlyMessages = publicData.messages
        .filter((msg: ChatMessage) => !msg.isPrivate)
        .sort(
          (a: ChatMessage, b: ChatMessage) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      setMessages(publicOnlyMessages);

      // Fetch private messages if user is admin or has private conversations
      const privateResponse = await fetch("/api/chat?private_only=true");
      const privateData = await privateResponse.json();

      if (privateResponse.ok) {
        const newPrivateMessages = privateData.messages || [];

        // Organize private messages by conversation
        const conversations: {
          [key: string]: { user: User; messages: ChatMessage[] };
        } = {};

        newPrivateMessages.forEach((msg: ChatMessage) => {
          // Determine the other user in the conversation
          const otherUserId =
            msg.senderId === currentUser.id ? msg.recipientId : msg.senderId;
          const otherUsername =
            msg.senderId === currentUser.id
              ? msg.recipientUsername
              : msg.senderUsername;
          const otherUserRole =
            msg.senderId === currentUser.id ? "user" : msg.senderRole;

          if (otherUserId) {
            const userId = otherUserId.toString();

            // Create conversation entry if it doesn't exist
            if (!conversations[userId]) {
              conversations[userId] = {
                user: {
                  id: otherUserId,
                  username: otherUsername || "Unknown User",
                  role: otherUserRole || "user",
                },
                messages: [],
              };
            }

            // Add message to the conversation
            conversations[userId].messages.push(msg);
          }
        });

        // Sort messages within each conversation by date (newest at bottom)
        Object.keys(conversations).forEach((userId) => {
          conversations[userId].messages.sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        });

        setPrivateConversations(conversations);

        // Keep the existing privateMessages state for backward compatibility
        setPrivateMessages(newPrivateMessages);

        // Check for new private messages and notify if there are any
        if (privateMessages.length > 0 && newPrivateMessages.length > 0) {
          const latestPrivateMessageId = privateMessages[0].id;
          const newIncomingMessages = newPrivateMessages.filter(
            (msg: ChatMessage) =>
              msg.id > latestPrivateMessageId &&
              msg.recipientId === currentUser.id
          );

          if (newIncomingMessages.length > 0 && activeTab !== "private") {
            setHasUnreadPrivate(true);
            // Add notification for new private message
            newIncomingMessages.forEach((msg: ChatMessage) => {
              addNotification({
                title: `New private message from ${msg.senderUsername}`,
                message:
                  msg.message.length > 30
                    ? `${msg.message.substring(0, 30)}...`
                    : msg.message,
                type: "admin_message",
                isGlobal: false,
              });
            });
          }
        }
      }
    } catch (err) {
      setError("Error connecting to chat server");
      console.error("Error fetching messages:", err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleErrorResponse = (data: any) => {
    if (data.error === "You are banned from the chat") {
      setBanned(true);
      setBanInfo(data);
    } else if (data.error === "You are muted in the chat") {
      setMuted(true);
      setMuteInfo(data);
    } else {
      setError(data.error || "Failed to fetch messages");
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      const data = await response.json();

      if (!response.ok) {
        console.error("Failed to fetch users:", data.error);
        return;
      }

      setUsers(
        data.users.map((user: any) => ({
          id: user.id,
          username: user.username,
          role: user.role,
        }))
      );
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const fetchModerationData = async () => {
    try {
      const response = await fetch("/api/admin/chat/moderation");
      const data = await response.json();

      if (!response.ok) {
        console.error("Failed to fetch moderation data:", data.error);
        return;
      }

      setBannedUsers(data.bannedUsers);
      setMutedUsers(data.mutedUsers);
    } catch (err) {
      console.error("Error fetching moderation data:", err);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      setLoading(true);
      setError(null);

      const payload: any = { message: newMessage };

      // Add private message details if applicable
      if (privateRecipient && currentUser.role === "admin") {
        payload.recipientId = privateRecipient.id;
        payload.isPrivate = true;
      } else if (activeTab === "private" && selectedConversationUserId) {
        // Use the selected conversation user ID
        payload.recipientId = selectedConversationUserId;
        payload.isPrivate = true;
      } else if (activeTab === "private" && privateMessages.length > 0) {
        // Fallback to the old method if needed
        const otherUser =
          privateMessages[0].senderId === currentUser.id
            ? { id: privateMessages[0].recipientId }
            : { id: privateMessages[0].senderId };

        payload.recipientId = otherUser.id;
        payload.isPrivate = true;
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === "You are banned from the chat") {
          setBanned(true);
          setBanInfo(data);
        } else if (data.error === "You are muted in the chat") {
          setMuted(true);
          setMuteInfo(data);
        } else {
          setError(data.error || "Failed to send message");
        }
        return;
      }

      // Add the new message to the appropriate list
      if (data.chatMessage.isPrivate) {
        // Add to privateMessages for backward compatibility
        setPrivateMessages((prevMessages) => [
          ...prevMessages,
          data.chatMessage,
        ]);

        // Add to the conversation in privateConversations
        const otherUserId = data.chatMessage.recipientId;
        if (otherUserId) {
          const otherUserIdStr = otherUserId.toString();

          setPrivateConversations((prev) => {
            const updatedConversations = { ...prev };

            if (updatedConversations[otherUserIdStr]) {
              // Add to existing conversation
              updatedConversations[otherUserIdStr] = {
                ...updatedConversations[otherUserIdStr],
                messages: [
                  ...updatedConversations[otherUserIdStr].messages,
                  data.chatMessage,
                ],
              };
            } else if (data.chatMessage.recipientUsername) {
              // Create new conversation
              updatedConversations[otherUserIdStr] = {
                user: {
                  id: otherUserId,
                  username: data.chatMessage.recipientUsername,
                  role: "user",
                },
                messages: [data.chatMessage],
              };
            }

            return updatedConversations;
          });

          // If we're starting a new conversation, select it
          if (!selectedConversationUserId) {
            setSelectedConversationUserId(otherUserId);
          }
        }
      } else {
        // Update the messages state setter to append new messages at the end
        setMessages((prevMessages) => [...prevMessages, data.chatMessage]);
      }

      setNewMessage("");
    } catch (err) {
      setError("Error sending message");
      console.error("Error sending message:", err);
    } finally {
      setLoading(false);
    }
  };

  const startEditMessage = (message: ChatMessage) => {
    setEditingMessageId(message.id);
    setEditText(message.message);
  };

  const cancelEdit = () => {
    setEditingMessageId(null);
    setEditText("");
  };

  const saveEdit = async (messageId: number) => {
    if (!editText.trim()) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/chat", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messageId,
          message: editText,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to update message");
        return;
      }

      // Update the message in the appropriate list
      if (data.chatMessage.isPrivate) {
        // Update privateMessages array
        setPrivateMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === messageId ? data.chatMessage : msg
          )
        );

        // Update privateConversations object
        const otherUserId =
          data.chatMessage.senderId === currentUser.id
            ? data.chatMessage.recipientId
            : data.chatMessage.senderId;

        if (otherUserId) {
          const userId = otherUserId.toString();

          setPrivateConversations((prevConversations) => {
            // If this conversation exists
            if (prevConversations[userId]) {
              return {
                ...prevConversations,
                [userId]: {
                  ...prevConversations[userId],
                  messages: prevConversations[userId].messages.map((msg) =>
                    msg.id === messageId ? data.chatMessage : msg
                  ),
                },
              };
            }
            return prevConversations;
          });
        }
      } else {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === messageId ? data.chatMessage : msg
          )
        );
      }

      setEditingMessageId(null);
      setEditText("");
    } catch (err) {
      setError("Error updating message");
      console.error("Error updating message:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteMessage = async (messageId: number, isPrivate: boolean) => {
    if (!confirm("Are you sure you want to delete this message?")) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/chat?id=${messageId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to delete message");
        return;
      }

      // Remove the message from the appropriate list
      if (isPrivate) {
        // Get the message before removing it from privateMessages
        const messageToDelete = privateMessages.find(
          (msg) => msg.id === messageId
        );

        // Update privateMessages array
        setPrivateMessages((prevMessages) =>
          prevMessages.filter((msg) => msg.id !== messageId)
        );

        // Update privateConversations object if the message exists
        if (messageToDelete) {
          const otherUserId =
            messageToDelete.senderId === currentUser.id
              ? messageToDelete.recipientId
              : messageToDelete.senderId;

          if (otherUserId) {
            const userId = otherUserId.toString();

            setPrivateConversations((prevConversations) => {
              // If this conversation exists
              if (prevConversations[userId]) {
                const updatedMessages = prevConversations[
                  userId
                ].messages.filter((msg) => msg.id !== messageId);

                // If there are still messages in this conversation
                if (updatedMessages.length > 0) {
                  return {
                    ...prevConversations,
                    [userId]: {
                      ...prevConversations[userId],
                      messages: updatedMessages,
                    },
                  };
                } else {
                  // If no messages left, remove the conversation
                  const newConversations = { ...prevConversations };
                  delete newConversations[userId];
                  return newConversations;
                }
              }
              return prevConversations;
            });
          }
        }
      } else {
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg.id !== messageId)
        );
      }
    } catch (err) {
      setError("Error deleting message");
      console.error("Error deleting message:", err);
    } finally {
      setLoading(false);
    }
  };

  const selectPrivateRecipient = (user: User | null) => {
    setPrivateRecipient(user);
    setShowUserList(false);
    // Switch to private tab if a recipient is selected
    if (user) {
      setActiveTab("private");
      setSelectedConversationUserId(user.id);
      fetchMessages();
    }
  };

  const performModerationAction = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!moderationUserId || !moderationAction) return;

    try {
      setLoading(true);
      setError(null);

      const payload: any = {
        userId: parseInt(moderationUserId),
        action: moderationAction,
        reason: moderationReason,
      };

      if (moderationAction === "ban" && !moderationPermanent) {
        payload.duration = parseInt(moderationDuration);
        payload.isPermanent = false;
      } else if (moderationAction === "ban" && moderationPermanent) {
        payload.isPermanent = true;
      } else if (moderationAction === "mute") {
        payload.duration = parseInt(moderationDuration);
      }
      // No additional payload needed for unban or unmute actions

      const response = await fetch("/api/admin/chat/moderation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to perform moderation action");
        return;
      }

      // Reset form and refresh moderation data
      setModerationUserId("");
      setModerationReason("");
      setModerationDuration("24");
      setModerationPermanent(false);
      fetchModerationData();

      alert(data.message);
    } catch (err) {
      setError("Error performing moderation action");
      console.error("Error in moderation:", err);
    } finally {
      setLoading(false);
    }
  };

  // Format timestamp for display
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  if (banned) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900 rounded-lg">
        <h2 className="text-xl font-bold text-red-700 dark:text-red-300">
          Chat Access Restricted
        </h2>
        <p className="mt-2">You have been banned from the chat.</p>
        {banInfo && (
          <div className="mt-2">
            <p>
              <strong>Reason:</strong> {banInfo.reason || "No reason provided"}
            </p>
            {banInfo.isPermanent ? (
              <p>
                <strong>Ban type:</strong> Permanent
              </p>
            ) : (
              <p>
                <strong>Expires:</strong> {formatTime(banInfo.expiresAt)}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col h-[600px]">
      {/* Chat Header */}
      <div className="bg-blue-600 dark:bg-blue-800 p-2 flex justify-between items-center">
        <h3 className="text-white font-medium text-sm">
          {activeTab === "private" &&
          selectedConversationUserId &&
          privateConversations[selectedConversationUserId.toString()]
            ? `Private Chat with ${
                privateConversations[selectedConversationUserId.toString()].user
                  .username
              }`
            : activeTab === "private" && !selectedConversationUserId
            ? "Private Messages"
            : "Community Chat"}
        </h3>
        <div className="flex space-x-2">
          {currentUser.role === "admin" && (
            <button
              onClick={() => setModerationView(!moderationView)}
              className="text-xs bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded-md transition-colors"
            >
              {moderationView ? "Back to Chat" : "Moderation"}
            </button>
          )}
          {currentUser.role === "admin" && !moderationView && (
            <button
              onClick={() => setShowUserList(!showUserList)}
              className="text-xs bg-blue-700 hover:bg-blue-800 text-white py-1 px-2 rounded-md transition-colors"
            >
              {privateRecipient ? "Change User" : "Private Message"}
            </button>
          )}
        </div>
      </div>

      {/* Tabs for Public/Private Chat */}
      {!moderationView && (
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900">
          <button
            onClick={() => {
              setActiveTab("public");
              setPrivateRecipient(null);
              setSelectedConversationUserId(null);
            }}
            className={`flex-1 py-2 text-xs font-medium ${
              activeTab === "public"
                ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            Public Chat
          </button>
          <button
            onClick={() => {
              setActiveTab("private");
              setHasUnreadPrivate(false);
            }}
            className={`flex-1 py-2 text-xs font-medium relative ${
              activeTab === "private"
                ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            Private Messages
            {hasUnreadPrivate && (
              <span className="absolute top-1 right-1/4 h-2 w-2 bg-red-500 rounded-full"></span>
            )}
          </button>
        </div>
      )}

      {/* User Selection Dropdown */}
      {showUserList && (
        <div className="bg-gray-100 dark:bg-gray-700 p-2 border-b border-gray-200 dark:border-gray-600 max-h-40 overflow-y-auto">
          <div className="text-xs font-medium mb-2 text-gray-700 dark:text-gray-300">
            Select User:
          </div>
          <div className="grid grid-cols-2 gap-1">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => selectPrivateRecipient(user)}
                className="text-left text-xs p-1 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-md flex items-center"
              >
                <span
                  className={`w-2 h-2 rounded-full mr-1 ${
                    user.role === "admin" ? "bg-red-500" : "bg-green-500"
                  }`}
                ></span>
                {user.username}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Moderation View */}
      {moderationView ? (
        <div className="flex-1 overflow-y-auto p-3 bg-gray-50 dark:bg-gray-900">
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
              <h4 className="font-medium text-sm mb-3 text-gray-800 dark:text-white">
                Moderation Actions
              </h4>

              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">
                    Action
                  </label>
                  <select
                    value={moderationAction}
                    onChange={(e) => setModerationAction(e.target.value)}
                    className="w-full p-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="ban">Ban User</option>
                    <option value="mute">Mute User</option>
                    <option value="unban">Unban User</option>
                    <option value="unmute">Unmute User</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">
                    User ID
                  </label>
                  <input
                    type="text"
                    value={moderationUserId}
                    onChange={(e) => setModerationUserId(e.target.value)}
                    placeholder="Enter user ID"
                    className="w-full p-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                {(moderationAction === "ban" ||
                  moderationAction === "mute") && (
                  <>
                    <div>
                      <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">
                        Reason
                      </label>
                      <input
                        type="text"
                        value={moderationReason}
                        onChange={(e) => setModerationReason(e.target.value)}
                        placeholder="Reason for action"
                        className="w-full p-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>

                    {moderationAction === "ban" && (
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="permanent-ban"
                          checked={moderationPermanent}
                          onChange={(e) =>
                            setModerationPermanent(e.target.checked)
                          }
                          className="mr-1"
                        />
                        <label
                          htmlFor="permanent-ban"
                          className="text-xs text-gray-700 dark:text-gray-300"
                        >
                          Permanent Ban
                        </label>
                      </div>
                    )}

                    {!moderationPermanent && (
                      <div>
                        <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">
                          Duration (hours)
                        </label>
                        <input
                          type="number"
                          value={moderationDuration}
                          onChange={(e) =>
                            setModerationDuration(e.target.value)
                          }
                          min="1"
                          className="w-full p-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>
                    )}
                  </>
                )}

                <button
                  onClick={performModerationAction}
                  className="w-full bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded-md text-xs transition-colors"
                >
                  Apply Action
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                <h4 className="font-medium text-sm mb-2 text-gray-800 dark:text-white">
                  Banned Users
                </h4>
                {bannedUsers.length === 0 ? (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    No banned users
                  </p>
                ) : (
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {bannedUsers.map((ban) => (
                      <div
                        key={ban.user_id}
                        className="text-xs p-1 border border-gray-200 dark:border-gray-700 rounded-md"
                      >
                        <div className="flex justify-between items-center">
                          <div className="font-medium">
                            {ban.username} (ID: {ban.user_id})
                          </div>
                          <button
                            onClick={() => {
                              setModerationUserId(ban.user_id.toString());
                              setModerationAction("unban");
                              performModerationAction();
                            }}
                            className="text-xs bg-green-500 hover:bg-green-600 text-white px-2 py-0.5 rounded-md"
                          >
                            Unban
                          </button>
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">
                          Reason: {ban.reason}
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">
                          {ban.is_permanent
                            ? "Permanent"
                            : `Until: ${new Date(
                                ban.expires_at
                              ).toLocaleString()}`}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                <h4 className="font-medium text-sm mb-2 text-gray-800 dark:text-white">
                  Muted Users
                </h4>
                {mutedUsers.length === 0 ? (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    No muted users
                  </p>
                ) : (
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {mutedUsers.map((mute) => (
                      <div
                        key={mute.user_id}
                        className="text-xs p-1 border border-gray-200 dark:border-gray-700 rounded-md"
                      >
                        <div className="flex justify-between items-center">
                          <div className="font-medium">
                            {mute.username} (ID: {mute.user_id})
                          </div>
                          <button
                            onClick={() => {
                              setModerationUserId(mute.user_id.toString());
                              setModerationAction("unmute");
                              performModerationAction();
                            }}
                            className="text-xs bg-green-500 hover:bg-green-600 text-white px-2 py-0.5 rounded-md"
                          >
                            Unmute
                          </button>
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">
                          Reason: {mute.reason}
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">
                          Until: {new Date(mute.expires_at).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Regular Chat View
        <div className="flex-1 overflow-y-auto p-3 bg-gray-50 dark:bg-gray-900">
          {banned ? (
            <div className="bg-red-50 dark:bg-red-900 p-3 rounded-md text-red-800 dark:text-red-200 text-center">
              <h4 className="font-bold text-sm mb-2">
                You are banned from the chat
              </h4>
              <p className="text-xs">{banInfo?.reason}</p>
              {banInfo?.isPermanent ? (
                <p className="mt-2 text-xs font-medium">
                  This ban is permanent
                </p>
              ) : (
                <p className="mt-2 text-xs">
                  Ban expires: {new Date(banInfo?.expiresAt).toLocaleString()}
                </p>
              )}
            </div>
          ) : muted ? (
            <div className="bg-yellow-50 dark:bg-yellow-900 p-3 rounded-md text-yellow-800 dark:text-yellow-200 text-center">
              <h4 className="font-bold text-sm mb-2">
                You are muted in the chat
              </h4>
              <p className="text-xs">{muteInfo?.reason}</p>
              <p className="mt-2 text-xs">
                Mute expires: {new Date(muteInfo?.expiresAt).toLocaleString()}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {error && (
                <div className="bg-red-50 dark:bg-red-900 p-2 rounded-md text-red-800 dark:text-red-200 text-xs">
                  {error}
                </div>
              )}

              {loading &&
              (activeTab === "public"
                ? messages.length === 0
                : privateMessages.length === 0) ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                </div>
              ) : activeTab === "public" && messages.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-6 text-xs">
                  No public messages yet. Start the conversation!
                </div>
              ) : activeTab === "private" &&
                Object.keys(privateConversations).length === 0 ? (
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
              ) : activeTab === "private" && !selectedConversationUserId ? (
                <div className="space-y-2 p-2">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select a conversation:
                  </h3>
                  {Object.entries(privateConversations).map(
                    ([userId, conversation]) => (
                      <div
                        key={userId}
                        onClick={() =>
                          setSelectedConversationUserId(Number(userId))
                        }
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
                            {new Date(
                              conversation.messages[0].createdAt
                            ).toLocaleString([], {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                          {conversation.messages[0].message}
                        </p>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {activeTab === "public" ? (
                    messages.map((message) => (
                      // Public messages
                      <div
                        key={message.id}
                        className={`p-2 rounded-lg ${
                          message.senderId === currentUser.id
                            ? "bg-blue-50 dark:bg-blue-900/30 ml-4"
                            : "bg-white dark:bg-gray-800 mr-4"
                        }`}
                      >
                        {/* Message content */}
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center">
                            {/* User icon with role indicator */}
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${getUserColor(
                                message.senderId
                              )}`}
                            >
                              <span className="text-xs font-bold text-white">
                                {message.senderUsername.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            {/* Username with admin indicator */}
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
                          </div>

                          <div className="flex items-center">
                            {/* Timestamp */}
                            <span className="text-gray-500 dark:text-gray-400 text-xs mr-2">
                              {formatTime(message.createdAt)}
                            </span>

                            {/* Three-dot menu for actions */}
                            {(message.senderId === currentUser.id ||
                              currentUser.role === "admin") && (
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
                                    onClick={() => startEditMessage(message)}
                                    className="block w-full text-left px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() =>
                                      deleteMessage(
                                        message.id,
                                        message.isPrivate
                                      )
                                    }
                                    className="block w-full text-left px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                                  >
                                    Delete
                                  </button>
                                  {currentUser.role === "admin" &&
                                    message.senderId !== currentUser.id && (
                                      <>
                                        <hr className="border-gray-200 dark:border-gray-600" />
                                        <button
                                          onClick={() =>
                                            setModerationUserId(
                                              message.senderId.toString()
                                            )
                                          }
                                          className="block w-full text-left px-3 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                                        >
                                          Mute User
                                        </button>
                                        <button
                                          onClick={() => {
                                            setModerationUserId(
                                              message.senderId.toString()
                                            );
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
                                onClick={cancelEdit}
                                className="px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => saveEdit(message.id)}
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
                                {message.editorUsername
                                  ? `by ${message.editorUsername}`
                                  : ""}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))
                  ) : // Private messages for selected conversation
                  selectedConversationUserId &&
                    privateConversations[
                      selectedConversationUserId.toString()
                    ] ? (
                    <>
                      <div className="flex justify-between items-center mb-3 bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                        <div className="flex items-center">
                          <button
                            onClick={() => setSelectedConversationUserId(null)}
                            className="mr-2 text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded-md"
                          >
                            ← Back
                          </button>
                          <span className="font-medium text-sm">
                            Conversation with{" "}
                            {
                              privateConversations[
                                selectedConversationUserId.toString()
                              ].user.username
                            }
                          </span>
                        </div>
                      </div>
                      {privateConversations[
                        selectedConversationUserId.toString()
                      ].messages.map((message) => (
                        <div
                          key={message.id}
                          className={`p-2 rounded-lg ${
                            message.senderId === currentUser.id
                              ? "bg-blue-50 dark:bg-blue-900/30 ml-4"
                              : "bg-white dark:bg-gray-800 mr-4"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <div className="flex items-center">
                              {/* User icon with role indicator */}
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${getUserColor(
                                  message.senderId
                                )}`}
                              >
                                <span className="text-xs font-bold text-white">
                                  {message.senderUsername
                                    .charAt(0)
                                    .toUpperCase()}
                                </span>
                              </div>
                              {/* Username with admin indicator */}
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
                                <span className="ml-1 text-xs bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200 px-1 py-0.5 rounded-full text-[10px]">
                                  private
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center">
                              {/* Timestamp */}
                              <span className="text-gray-500 dark:text-gray-400 text-xs mr-2">
                                {formatTime(message.createdAt)}
                              </span>

                              {/* Three-dot menu for actions */}
                              {(message.senderId === currentUser.id ||
                                currentUser.role === "admin") && (
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
                                      onClick={() => startEditMessage(message)}
                                      className="block w-full text-left px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() =>
                                        deleteMessage(
                                          message.id,
                                          message.isPrivate
                                        )
                                      }
                                      className="block w-full text-left px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                                    >
                                      Delete
                                    </button>
                                    {currentUser.role === "admin" &&
                                      message.senderId !== currentUser.id && (
                                        <>
                                          <hr className="border-gray-200 dark:border-gray-600" />
                                          <button
                                            onClick={() =>
                                              setModerationUserId(
                                                message.senderId.toString()
                                              )
                                            }
                                            className="block w-full text-left px-3 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                                          >
                                            Mute User
                                          </button>
                                          <button
                                            onClick={() => {
                                              setModerationUserId(
                                                message.senderId.toString()
                                              );
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
                                  onClick={cancelEdit}
                                  className="px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => saveEdit(message.id)}
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
                                  {message.editorUsername
                                    ? `by ${message.editorUsername}`
                                    : ""}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-6 text-xs">
                      Select a conversation from the list to view messages.
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Message Input */}
      {!banned && !muted && !moderationView && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-2 bg-white dark:bg-gray-800">
          <form onSubmit={sendMessage} className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Type your ${
                activeTab === "private" ? "private" : "public"
              } message...`}
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
                {
                  privateConversations[selectedConversationUserId.toString()]
                    .user.username
                }
              </div>
            )}
          {activeTab === "private" && !selectedConversationUserId && (
            <div className="mt-1 text-xs text-center text-gray-500 dark:text-gray-400">
              Select a conversation to send a message
            </div>
          )}
        </div>
      )}
    </div>
  );

  // End of component
};

export default ChatBox;
