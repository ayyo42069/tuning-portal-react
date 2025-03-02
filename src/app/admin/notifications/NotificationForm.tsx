"use client";

import { useState } from "react";

export default function NotificationForm() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title"),
      message: formData.get("message"),
      type: formData.get("type"),
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
        throw new Error("Failed to send notification");
      }

      // Reset form
      (e.target as HTMLFormElement).reset();
      window.location.reload(); // Refresh to show new notification
    } catch (err) {
      setError("Failed to send notification. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-card p-6 rounded-lg shadow-sm mb-8">
      <h2 className="text-xl font-semibold mb-4">Send New Notification</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            className="w-full px-3 py-2 border rounded-md bg-background"
            placeholder="Notification title"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium mb-1">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={4}
            className="w-full px-3 py-2 border rounded-md bg-background"
            placeholder="Notification message"
          ></textarea>
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium mb-1">
            Type
          </label>
          <select
            id="type"
            name="type"
            required
            className="w-full px-3 py-2 border rounded-md bg-background"
          >
            <option value="system">System</option>
            <option value="admin_message">Admin Message</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {submitting ? "Sending..." : "Send Notification"}
        </button>
      </form>
    </div>
  );
}