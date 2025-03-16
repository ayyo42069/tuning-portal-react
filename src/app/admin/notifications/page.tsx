"use client";

import { useState, useEffect } from "react";
import { Bell, Send, CheckCircle, Filter } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  isGlobal: boolean;
  createdAt: string;
  readCount: number;
}

export default function NotificationsAdmin() {
  const [sentNotifications, setSentNotifications] = useState<Notification[]>(
    []
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGlobal, setIsGlobal] = useState(true);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"send" | "history">("send");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/admin/notifications");
      if (response.ok) {
        const data = await response.json();
        setSentNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title"),
      message: formData.get("message"),
      type: formData.get("type"),
      isGlobal: isGlobal,
      userId: isGlobal ? null : formData.get("userId"),
    };

    try {
      const response = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send notification");
      }

      // Reset form and refresh notifications
      (e.target as HTMLFormElement).reset();
      setIsGlobal(true);
      fetchNotifications();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to send notification. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading notifications..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <ul className="flex flex-wrap -mb-px">
          <li className="mr-2">
            <button
              onClick={() => setActiveTab("send")}
              className={`inline-flex items-center px-4 py-2 rounded-t-lg ${
                activeTab === "send"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              <Send className="w-5 h-5 mr-2" />
              Send Notification
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab("history")}
              className={`inline-flex items-center px-4 py-2 rounded-t-lg ${
                activeTab === "history"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              <Bell className="w-5 h-5 mr-2" />
              Notification History
            </button>
          </li>
        </ul>
      </div>

      {error && (
        <div className="p-4 mb-6 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-red-900/30 dark:text-red-400">
          {error}
          <button
            onClick={() => setError(null)}
            className="float-right text-red-800 dark:text-red-400"
          >
            &times;
          </button>
        </div>
      )}

      {activeTab === "send" ? (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Send className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Send New Notification
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
              >
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Notification title"
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Notification message"
              ></textarea>
            </div>

            <div>
              <label
                htmlFor="type"
                className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
              >
                Type
              </label>
              <select
                id="type"
                name="type"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="system">System</option>
                <option value="admin_message">Admin Message</option>
              </select>
            </div>

            <div>
              <label className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={isGlobal}
                  onChange={(e) => setIsGlobal(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium">Send to all users</span>
              </label>
            </div>

            {!isGlobal && (
              <div>
                <label
                  htmlFor="userId"
                  className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                >
                  User ID
                </label>
                <input
                  type="text"
                  id="userId"
                  name="userId"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter user ID"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Sending...</span>
                </>
              ) : (
                "Send Notification"
              )}
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Bell className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Sent Notifications
            </h2>
          </div>

          <div className="space-y-4">
            {sentNotifications.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                No notifications have been sent yet.
              </p>
            ) : (
              sentNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className="border-b border-gray-200 dark:border-gray-700 last:border-0 pb-4 last:pb-0"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {notification.title}
                    </h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm mb-2 text-gray-700 dark:text-gray-300">
                    {notification.message}
                  </p>
                  <div className="flex gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                      {notification.type}
                    </span>
                    <span>•</span>
                    <span className="flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Read by: {notification.readCount} users
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
