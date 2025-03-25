"use client";

import { useState, useEffect } from "react";
import { Send, Trash2, Clock } from "lucide-react";

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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700 backdrop-filter backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95 relative overflow-hidden">
      {/* Background gradient elements */}
      <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 blur-xl"></div>
      <div className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 blur-xl"></div>

      <h3 className="text-lg font-medium bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-indigo-400 mb-5 relative z-10">
        Comments & Questions
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-400 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-r-md shadow-sm">
          {error}
        </div>
      )}

      <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-1 relative z-10">
        {comments.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400 py-4">
              No comments yet. Be the first to add a comment.
            </p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className={`p-4 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md ${
                comment.user_role === "admin"
                  ? "bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-l-4 border-purple-400 dark:border-purple-600"
                  : "bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-l-4 border-blue-400 dark:border-blue-600"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <span
                    className={`inline-flex items-center justify-center h-9 w-9 rounded-full shadow-md ${
                      comment.user_role === "admin"
                        ? "bg-gradient-to-br from-purple-500 to-indigo-600 text-white"
                        : "bg-gradient-to-br from-blue-500 to-cyan-600 text-white"
                    } mr-3`}
                  >
                    {comment.user_name.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                      {comment.user_name}
                      {comment.user_role === "admin" && (
                        <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-sm">
                          Admin
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-0.5">
                      <Clock className="w-3 h-3 mr-1 inline" />{" "}
                      {formatDate(comment.created_at)}
                    </p>
                  </div>
                </div>

                {/* Delete button - only visible to comment author or admins */}
                {(comment.user_id === currentUserId ||
                  currentUserRole === "admin") && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="p-1.5 rounded-full text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                    title="Delete comment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <p className="mt-3 text-gray-700 dark:text-gray-300 p-2 bg-white/50 dark:bg-gray-800/50 rounded-md">
                {comment.message}
              </p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmitComment} className="mt-6 relative z-10">
        <div className="flex shadow-md rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment or question..."
            className="flex-1 rounded-l-md border-0 shadow-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-3"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !newComment.trim()}
            className="inline-flex items-center px-5 py-3 border-0 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-blue-500/25 transform hover:-translate-y-0.5"
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
