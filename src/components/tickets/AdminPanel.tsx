import React, { useState } from "react";
import { Ticket, User } from "./types";

type AdminPanelProps = {
  tickets: Ticket[];
  onUpdateStatus: (ticketId: number, status: Ticket["status"]) => void;
  onAssign: (ticketId: number, userId: number) => void;
  onUpdatePriority: (ticketId: number, priority: Ticket["priority"]) => void;
  onSelectTicket: (ticket: Ticket) => void;
  loading: boolean;
};

const AdminPanel: React.FC<AdminPanelProps> = ({
  tickets,
  onUpdateStatus,
  onAssign,
  onUpdatePriority,
  onSelectTicket,
  loading,
}) => {
  const [selectedTickets, setSelectedTickets] = useState<number[]>([]);
  const [bulkStatus, setBulkStatus] = useState<Ticket["status"]>("open");
  const [bulkPriority, setBulkPriority] =
    useState<Ticket["priority"]>("medium");
  const [assignToUserId, setAssignToUserId] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Filter tickets based on selected filters
  const filteredTickets = tickets.filter((ticket) => {
    // Filter by status
    if (filterStatus !== "all" && ticket.status !== filterStatus) {
      return false;
    }

    // Filter by priority
    if (filterPriority !== "all" && ticket.priority !== filterPriority) {
      return false;
    }

    // Search by subject, description, or username
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        ticket.subject.toLowerCase().includes(searchLower) ||
        ticket.description.toLowerCase().includes(searchLower) ||
        ticket.username.toLowerCase().includes(searchLower) ||
        (ticket.assignedUsername &&
          ticket.assignedUsername.toLowerCase().includes(searchLower))
      );
    }

    return true;
  });

  // Toggle ticket selection
  const toggleTicketSelection = (ticketId: number) => {
    setSelectedTickets((prev) =>
      prev.includes(ticketId)
        ? prev.filter((id) => id !== ticketId)
        : [...prev, ticketId]
    );
  };

  // Select all tickets
  const selectAllTickets = () => {
    if (selectedTickets.length === filteredTickets.length) {
      setSelectedTickets([]);
    } else {
      setSelectedTickets(filteredTickets.map((ticket) => ticket.id));
    }
  };

  // Apply bulk status update
  const applyBulkStatusUpdate = () => {
    if (selectedTickets.length === 0) return;

    selectedTickets.forEach((ticketId) => {
      onUpdateStatus(ticketId, bulkStatus);
    });

    setSelectedTickets([]);
  };

  // Apply bulk priority update
  const applyBulkPriorityUpdate = () => {
    if (selectedTickets.length === 0) return;

    selectedTickets.forEach((ticketId) => {
      onUpdatePriority(ticketId, bulkPriority);
    });

    setSelectedTickets([]);
  };

  // Apply bulk assignment
  const applyBulkAssignment = () => {
    if (selectedTickets.length === 0 || !assignToUserId) return;

    const userId = parseInt(assignToUserId);
    if (isNaN(userId)) return;

    selectedTickets.forEach((ticketId) => {
      onAssign(ticketId, userId);
    });

    setSelectedTickets([]);
    setAssignToUserId("");
  };

  // Calculate ticket statistics
  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "open").length,
    inProgress: tickets.filter((t) => t.status === "in_progress").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
    closed: tickets.filter((t) => t.status === "closed").length,
    urgent: tickets.filter((t) => t.priority === "urgent").length,
    high: tickets.filter((t) => t.priority === "high").length,
    unassigned: tickets.filter((t) => !t.assignedTo).length,
  };

  return (
    <div className="space-y-4">
      {/* Statistics Dashboard */}
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-2">
          Ticket Statistics
        </h4>
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-md">
            <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {stats.total}
            </div>
            <div className="text-xs text-blue-800 dark:text-blue-300">
              Total Tickets
            </div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded-md">
            <div className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
              {stats.open}
            </div>
            <div className="text-xs text-yellow-800 dark:text-yellow-300">
              Open
            </div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded-md">
            <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
              {stats.inProgress}
            </div>
            <div className="text-xs text-purple-800 dark:text-purple-300">
              In Progress
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-md">
            <div className="text-xl font-bold text-green-600 dark:text-green-400">
              {stats.resolved}
            </div>
            <div className="text-xs text-green-800 dark:text-green-300">
              Resolved
            </div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-md">
            <div className="text-xl font-bold text-red-600 dark:text-red-400">
              {stats.urgent}
            </div>
            <div className="text-xs text-red-800 dark:text-red-300">
              Urgent Priority
            </div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded-md">
            <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
              {stats.high}
            </div>
            <div className="text-xs text-orange-800 dark:text-orange-300">
              High Priority
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md">
            <div className="text-xl font-bold text-gray-600 dark:text-gray-400">
              {stats.closed}
            </div>
            <div className="text-xs text-gray-800 dark:text-gray-300">
              Closed
            </div>
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded-md">
            <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
              {stats.unassigned}
            </div>
            <div className="text-xs text-indigo-800 dark:text-indigo-300">
              Unassigned
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-2">
          Filter Tickets
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full p-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">
              Priority
            </label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full p-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tickets..."
              className="w-full p-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-2">
          Bulk Actions
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">
              Update Status
            </label>
            <div className="flex space-x-1">
              <select
                value={bulkStatus}
                onChange={(e) =>
                  setBulkStatus(e.target.value as Ticket["status"])
                }
                className="flex-1 p-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button
                onClick={applyBulkAssignment}
                disabled={
                  selectedTickets.length === 0 || !assignToUserId || loading
                }
                className="px-2 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket List */}
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-medium text-sm text-gray-900 dark:text-white">
            Tickets ({filteredTickets.length})
          </h4>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="select-all"
              checked={
                selectedTickets.length === filteredTickets.length &&
                filteredTickets.length > 0
              }
              onChange={selectAllTickets}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <label
              htmlFor="select-all"
              className="text-xs text-gray-700 dark:text-gray-300"
            >
              Select All
            </label>
          </div>
        </div>

        {filteredTickets.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-6 text-sm">
            No tickets found matching your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th
                    scope="col"
                    className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400"
                  >
                    <span className="sr-only">Select</span>
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400"
                  >
                    ID
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400"
                  >
                    Subject
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400"
                  >
                    Priority
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400"
                  >
                    User
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400"
                  >
                    Assigned To
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400"
                  >
                    Created
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTickets.map((ticket) => {
                  // Helper function to get status color
                  const getStatusColor = (status: Ticket["status"]) => {
                    switch (status) {
                      case "open":
                        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
                      case "in_progress":
                        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
                      case "resolved":
                        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
                      case "closed":
                        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
                      default:
                        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
                    }
                  };

                  // Helper function to get priority color
                  const getPriorityColor = (priority: Ticket["priority"]) => {
                    switch (priority) {
                      case "low":
                        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
                      case "medium":
                        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
                      case "high":
                        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
                      case "urgent":
                        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
                      default:
                        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
                    }
                  };

                  // Format date to a readable format
                  const formatDate = (dateString: string) => {
                    const date = new Date(dateString);
                    return date.toLocaleString();
                  };

                  return (
                    <tr
                      key={ticket.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="px-2 py-2 whitespace-nowrap text-xs">
                        <input
                          type="checkbox"
                          checked={selectedTickets.includes(ticket.id)}
                          onChange={() => toggleTicketSelection(ticket.id)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white">
                        #{ticket.id}
                      </td>
                      <td className="px-2 py-2 text-xs text-gray-900 dark:text-white max-w-[200px] truncate">
                        {ticket.subject}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            ticket.status
                          )}`}
                        >
                          {ticket.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                            ticket.priority
                          )}`}
                        >
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white">
                        {ticket.username}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white">
                        {ticket.assignedUsername || (
                          <span className="italic text-gray-500 dark:text-gray-400">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(ticket.createdAt)}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs">
                        <button
                          onClick={() => onSelectTicket(ticket)}
                          className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
