"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/lib/NotificationProvider";
import { ChatMessage, User, ChatBoxProps, PrivateConversation } from "./types";
import ChatMessageComponent from "./ChatMessage";
import ChatInput from "./ChatInput";
import ModerationPanel from "./ModerationPanel";
import PrivateConversationList from "./PrivateConversationList";
import { formatTimestamp } from "./utils";

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
  const [privateConversations, setPrivateConversations] =
    useState<PrivateConversation>({});
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
        const conversations: PrivateConversation = {};

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
                <strong>Expires:</strong> {formatTimestamp(banInfo.expiresAt)}
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
        <ModerationPanel
          moderationAction={moderationAction}
          setModerationAction={setModerationAction}
          moderationUserId={moderationUserId}
          setModerationUserId={setModerationUserId}
          moderationReason={moderationReason}
          setModerationReason={setModerationReason}
          moderationDuration={moderationDuration}
          setModerationDuration={setModerationDuration}
          moderationPermanent={moderationPermanent}
          setModerationPermanent={setModerationPermanent}
          bannedUsers={bannedUsers}
          mutedUsers={mutedUsers}
          performModerationAction={performModerationAction}
          setModerationView={setModerationView}
          loading={loading}
        />
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
                <PrivateConversationList
                  privateConversations={privateConversations}
                  setSelectedConversationUserId={setSelectedConversationUserId}
                  setShowUserList={setShowUserList}
                  currentUser={currentUser}
                />
              ) : activeTab === "private" && !selectedConversationUserId ? (
                <PrivateConversationList
                  privateConversations={privateConversations}
                  setSelectedConversationUserId={setSelectedConversationUserId}
                  setShowUserList={setShowUserList}
                  currentUser={currentUser}
                />
              ) : (
                <div className="space-y-2">
                  {activeTab === "public" ? (
                    messages.map((message) => (
                      <ChatMessageComponent
                        key={message.id}
                        message={message}
                        currentUser={currentUser}
                        onEdit={startEditMessage}
                        onDelete={deleteMessage}
                        onSaveEdit={saveEdit}
                        onCancelEdit={cancelEdit}
                        editingMessageId={editingMessageId}
                        editText={editText}
                        setEditText={setEditText}
                        setModerationUserId={setModerationUserId}
                        setModerationAction={setModerationAction}
                      />
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
                        <ChatMessageComponent
                          key={message.id}
                          message={message}
                          currentUser={currentUser}
                          onEdit={startEditMessage}
                          onDelete={deleteMessage}
                          onSaveEdit={saveEdit}
                          onCancelEdit={cancelEdit}
                          editingMessageId={editingMessageId}
                          editText={editText}
                          setEditText={setEditText}
                          setModerationUserId={setModerationUserId}
                          setModerationAction={setModerationAction}
                        />
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
        <ChatInput
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          sendMessage={sendMessage}
          loading={loading}
          activeTab={activeTab}
          selectedConversationUserId={selectedConversationUserId}
          privateConversations={privateConversations}
        />
      )}
    </div>
  );
};

export default ChatBox;
