"use client";

import { useState, useEffect } from "react";
import { Send, Trash2 } from "lucide-react";

interface Comment {
  id: number;
  user_id: number;
  user_name: string;
  user_role: "user" | "admin";
  message: string;
  created_at: string;
}

interface ECUFileCommentsProps {
  fileId: number;
  currentUserId: number;
  currentUserRole: "user" | "admin";
}

export default function ECUFileComments({
  fileId,
  currentUserId,
  currentUserRole,
}: ECUFileCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch comments when component mounts
  useEffect(() => {
    fetchComments();
  }, [fileId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ecu/comments?fileId=${fileId}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch comments: ${response.status}`);
      }

      const data = await response.json();
      setComments(data.comments || []);
    } catch (err) {
      console.error("Error fetching comments:", err);
      setError("Failed to load comments. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setLoading(true);
      const response = await fetch("/api/ecu/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          fileId,
          message: newComment,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add comment: ${response.status}`);
      }

      // Clear input and refresh comments
      setNewComment("");
      fetchComments();
    } catch (err) {
      console.error("Error adding comment:", err);
      setError("Failed to add comment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/ecu/comments/${commentId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete comment: ${response.status}`);
      }

      // Refresh comments
      fetchComments();
    } catch (err) {
      console.error("Error deleting comment:", err);
      setError("Failed to delete comment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Comments & Questions
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-400 text-red-700 dark:bg-red-900/30 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
        {comments.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            No comments yet. Be the first to add a comment.
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className={`p-4 rounded-lg ${
                comment.user_role === "admin"
                  ? "bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-400"
                  : "bg-gray-50 dark:bg-gray-700/50"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <span
                    className={`inline-flex items-center justify-center h-8 w-8 rounded-full ${
                      comment.user_role === "admin"
                        ? "bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
                    } mr-3`}
                  >
                    {comment.user_name.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {comment.user_name}
                      {comment.user_role === "admin" && (
                        <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100">
                          Admin
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(comment.created_at)}
                    </p>
                  </div>
                </div>

                {/* Delete button - only visible to comment author or admins */}
                {(comment.user_id === currentUserId ||
                  currentUserRole === "admin") && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
                    title="Delete comment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <p className="mt-2 text-gray-700 dark:text-gray-300">
                {comment.message}
              </p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmitComment} className="mt-4">
        <div className="flex">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment or question..."
            className="flex-1 rounded-l-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !newComment.trim()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
