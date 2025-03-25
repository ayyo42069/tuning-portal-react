import React, { useState } from "react";
import { Ticket, TicketResponse, User } from "./types";

type TicketDetailProps = {
  ticket: Ticket;
  responses: TicketResponse[];
  currentUser: User;
  onAddResponse: (
    ticketId: number,
    message: string,
    isInternal: boolean
  ) => void;
  onUpdateStatus: (ticketId: number, status: Ticket["status"]) => void;
  onAssign: (ticketId: number, userId: number) => void;
  onUpdatePriority: (ticketId: number, priority: Ticket["priority"]) => void;
  loading: boolean;
};

const TicketDetail: React.FC<TicketDetailProps> = ({
  ticket,
  responses,
  currentUser,
  onAddResponse,
  onUpdateStatus,
  onAssign,
  onUpdatePriority,
  loading,
}) => {
  const [newResponse, setNewResponse] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [assignUserId, setAssignUserId] = useState("");

  // Format date to a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

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

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<Ticket["status"] | null>(
    null
  );

  const handleSubmitResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResponse.trim() || ticket.status === "closed") return;

    onAddResponse(ticket.id, newResponse, isInternal);
    setNewResponse("");
    setIsInternal(false);
  };

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignUserId) return;

    onAssign(ticket.id, parseInt(assignUserId));
    setAssignUserId("");
  };

  return (
    <div className="space-y-5">
      {/* Ticket Header */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-4 rounded-xl shadow-md border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-gray-900 dark:text-white">
            #{ticket.id}: {ticket.subject}
          </h3>
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

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
          {ticket.description}
        </p>

        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
          <div>
            <span className="font-medium">Created by:</span> {ticket.username}
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
          <div>
            <span className="font-medium">Created:</span>{" "}
            {formatDate(ticket.createdAt)}
          </div>
        </div>
      </div>

      {/* Status Controls for Regular Users */}
      {currentUser.role.toLowerCase() !== "admin" &&
        ticket.status !== "closed" &&
        ticket.status !== "resolved" && (
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setPendingStatus("resolved");
                  setShowConfirmDialog(true);
                }}
                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-md transition-colors"
              >
                Mark as Resolved
              </button>
              <button
                onClick={() => {
                  setPendingStatus("closed");
                  setShowConfirmDialog(true);
                }}
                className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-xs font-medium rounded-md transition-colors"
              >
                Close Ticket
              </button>
            </div>
          </div>
        )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Confirm Action
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Are you sure you want to mark this ticket as{" "}
              {pendingStatus?.replace("_", " ")}?
              {pendingStatus === "closed" && " This action cannot be undone."}
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-medium rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (pendingStatus) {
                    onUpdateStatus(ticket.id, pendingStatus);
                  }
                  setShowConfirmDialog(false);
                  setPendingStatus(null);
                }}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Controls */}
      {currentUser.role.toLowerCase() === "admin" && (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-2">
            Admin Controls
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Status Update */}
            <div>
              <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">
                Update Status
              </label>
              <select
                value={ticket.status}
                onChange={(e) =>
                  onUpdateStatus(ticket.id, e.target.value as Ticket["status"])
                }
                className="w-full p-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {/* Priority Update */}
            <div>
              <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">
                Update Priority
              </label>
              <select
                value={ticket.priority}
                onChange={(e) =>
                  onUpdatePriority(
                    ticket.id,
                    e.target.value as Ticket["priority"]
                  )
                }
                className="w-full p-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Assign Ticket */}
            <div>
              <form onSubmit={handleAssign} className="flex space-x-1">
                <div className="flex-1">
                  <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">
                    Assign to User ID
                  </label>
                  <input
                    type="text"
                    value={assignUserId}
                    onChange={(e) => setAssignUserId(e.target.value)}
                    placeholder="Enter user ID"
                    className="w-full p-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!assignUserId || loading}
                  className="mt-5 px-2 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Assign
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Responses */}
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-3">
          Responses
        </h4>

        <div className="space-y-3 max-h-[250px] overflow-y-auto mb-3">
          {responses.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-3 text-xs">
              No responses yet.
            </div>
          ) : (
            responses.map((response) => (
              <div
                key={response.id}
                className={`p-2 rounded-lg ${
                  response.isInternal &&
                  currentUser.role.toLowerCase() === "admin"
                    ? "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
                    : "bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700"
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center">
                    <span
                      className={`font-medium text-xs ${
                        response.userRole === "admin"
                          ? "text-red-600 dark:text-red-400"
                          : "text-gray-900 dark:text-white"
                      }`}
                    >
                      {response.username}
                      {response.userRole === "admin" && (
                        <span className="ml-1 text-xs bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 px-1 py-0.5 rounded-full text-[10px]">
                          admin
                        </span>
                      )}
                    </span>
                    {response.isInternal && currentUser.role === "admin" && (
                      <span className="ml-1 text-xs bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 px-1 py-0.5 rounded-full text-[10px]">
                        internal note
                      </span>
                    )}
                  </div>
                  <span className="text-gray-500 dark:text-gray-400 text-xs">
                    {formatDate(response.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                  {response.message}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Add Response Form */}
        <form onSubmit={handleSubmitResponse} className="space-y-2">
          <textarea
            value={newResponse}
            onChange={(e) => setNewResponse(e.target.value)}
            className="w-full p-2 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-h-[80px]"
            disabled={loading || ticket.status === "closed"}
            placeholder={
              ticket.status === "closed"
                ? "This ticket is closed"
                : "Type your response..."
            }
          />

          {currentUser.role.toLowerCase() === "admin" && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="internal-note"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                className="mr-1"
              />
              <label
                htmlFor="internal-note"
                className="text-xs text-gray-700 dark:text-gray-300"
              >
                Internal note (only visible to admins)
              </label>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!newResponse.trim() || loading}
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
          </div>
        </form>
      </div>
    </div>
  );
};

export default TicketDetail;
