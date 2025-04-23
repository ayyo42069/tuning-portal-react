"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  InformationCircleIcon,
  ExclamationTriangleIcon,
  FunnelIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";

interface FeedbackEvent {
  id: number;
  type: "success" | "error" | "info" | "warning";
  message: string;
  action?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export default function FeedbackHistory() {
  const [events, setEvents] = useState<FeedbackEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "success" | "error" | "info" | "warning">("all");

  useEffect(() => {
    fetchEvents();
  }, [filter]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/feedback?type=${filter !== "all" ? filter : ""}`);
      if (!response.ok) throw new Error("Failed to fetch feedback events");
      const data = await response.json();
      setEvents(data.events);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: FeedbackEvent["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case "error":
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case "warning":
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case "info":
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Feedback History
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View and manage system feedback events
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            filter === "all"
              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("success")}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            filter === "success"
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
          }`}
        >
          Success
        </button>
        <button
          onClick={() => setFilter("error")}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            filter === "error"
              ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
          }`}
        >
          Error
        </button>
        <button
          onClick={() => setFilter("warning")}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            filter === "warning"
              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
          }`}
        >
          Warning
        </button>
        <button
          onClick={() => setFilter("info")}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            filter === "info"
              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
          }`}
        >
          Info
        </button>
      </div>

      {/* Events List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            Loading feedback events...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500 dark:text-red-400">
            {error}
          </div>
        ) : events.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No feedback events found
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {events.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {getIcon(event.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {event.message}
                    </p>
                    {event.action && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Action: {event.action}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {formatDate(event.created_at)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 