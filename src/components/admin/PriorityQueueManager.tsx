"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, ArrowUp, ArrowDown, Clock } from "lucide-react";

interface PriorityQueueProps {
  requests: any[];
  onPriorityChange: (id: number, priority: number) => void;
}

export default function PriorityQueueManager({
  requests,
  onPriorityChange,
}: PriorityQueueProps) {
  const [prioritizedRequests, setPrioritizedRequests] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    // Sort requests by priority (high to low) and then by date (oldest first)
    const sorted = [...requests].sort((a, b) => {
      // First sort by priority (high to low)
      if ((b.priority || 0) !== (a.priority || 0)) {
        return (b.priority || 0) - (a.priority || 0);
      }
      // Then by status (pending first, then processing)
      if (a.status !== b.status) {
        if (a.status === "pending") return -1;
        if (b.status === "pending") return 1;
        if (a.status === "processing") return -1;
        if (b.status === "processing") return 1;
      }
      // Finally by date (oldest first)
      return (
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    });

    // Apply filter
    if (filter !== "all") {
      setPrioritizedRequests(sorted.filter((req) => req.status === filter));
    } else {
      setPrioritizedRequests(sorted);
    }
  }, [requests, filter]);

  const handlePriorityChange = (id: number, change: number) => {
    const request = requests.find((r) => r.id === id);
    if (request) {
      const currentPriority = request.priority || 0;
      const newPriority = Math.max(0, currentPriority + change);
      onPriorityChange(id, newPriority);
    }
  };

  const getPriorityLabel = (priority: number) => {
    if (priority >= 3) return "High";
    if (priority >= 1) return "Medium";
    return "Low";
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 3)
      return "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400";
    if (priority >= 1)
      return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400";
    return "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400";
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100";
      case "processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Priority Queue
        </h3>
        <div className="flex space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
          </select>
        </div>
      </div>

      {prioritizedRequests.length === 0 ? (
        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
          <AlertTriangle className="mx-auto h-12 w-12 text-gray-400 mb-2" />
          <p>No tuning requests match the current filter.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Request
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Waiting Time
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {prioritizedRequests.map((request) => {
                const waitingTime = Math.floor(
                  (new Date().getTime() -
                    new Date(request.created_at).getTime()) /
                    (1000 * 60 * 60 * 24)
                );

                return (
                  <tr
                    key={request.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                          request.priority || 0
                        )}`}
                      >
                        {getPriorityLabel(request.priority || 0)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {request.file_name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {request.vehicle_info}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                          request.status
                        )}`}
                      >
                        {request.status.charAt(0).toUpperCase() +
                          request.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="h-4 w-4 mr-1" />
                        {waitingTime === 0
                          ? "Today"
                          : waitingTime === 1
                          ? "1 day"
                          : `${waitingTime} days`}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handlePriorityChange(request.id, 1)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Increase priority"
                        >
                          <ArrowUp className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handlePriorityChange(request.id, -1)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Decrease priority"
                          disabled={!request.priority}
                        >
                          <ArrowDown className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
