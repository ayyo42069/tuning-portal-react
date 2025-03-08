"use client";

import { useState, useEffect } from "react";
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
  const [error, setError] = useState("");
  const [isGlobal, setIsGlobal] = useState(true);
  const [loading, setLoading] = useState(true);

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
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner size="lg" message="Loading notifications..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">System Notifications</h1>

      {/* Notification Form */}
      <div className="bg-card p-6 rounded-lg shadow-sm mb-8 dark:bg-gray-800 border border-border">
        <div className="flex items-center gap-3 mb-6">
          <svg
            className="w-6 h-6 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <h2 className="text-xl font-semibold text-foreground">
            Send New Notification
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 rounded-md">
              <p>{error}</p>
            </div>
          )}

          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium mb-1 text-foreground"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              className="w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Notification title"
            />
          </div>

          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium mb-1 text-foreground"
            >
              Message
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={4}
              className="w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Notification message"
            ></textarea>
          </div>

          <div>
            <label
              htmlFor="type"
              className="block text-sm font-medium mb-1 text-foreground"
            >
              Type
            </label>
            <select
              id="type"
              name="type"
              required
              className="w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="system">System</option>
              <option value="admin_message">Admin Message</option>
            </select>
          </div>

          <div>
            <label className="flex items-center space-x-2 text-foreground">
              <input
                type="checkbox"
                checked={isGlobal}
                onChange={(e) => setIsGlobal(e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium">Send to all users</span>
            </label>
          </div>

          {!isGlobal && (
            <div>
              <label
                htmlFor="userId"
                className="block text-sm font-medium mb-1 text-foreground"
              >
                User ID
              </label>
              <input
                type="text"
                id="userId"
                name="userId"
                required
                className="w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Enter user ID"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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

      {/* Sent Notifications */}
      <div className="bg-card p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Sent Notifications</h2>
        <div className="space-y-4">
          {sentNotifications.map((notification) => (
            <div
              key={notification.id}
              className="border-b border-border last:border-0 pb-4 last:pb-0"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium">{notification.title}</h3>
                <span className="text-sm text-muted-foreground">
                  {new Date(notification.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm mb-2">{notification.message}</p>
              <div className="flex gap-2 text-sm text-muted-foreground">
                <span>Type: {notification.type}</span>
                <span>•</span>
                <span>Read by: {notification.readCount} users</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
