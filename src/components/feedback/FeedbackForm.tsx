"use client";

import { useState, useEffect } from "react";
import { StarIcon } from "@heroicons/react/24/solid";
import { StarIcon as StarOutlineIcon } from "@heroicons/react/24/outline";

interface FeedbackFormProps {
  ecuFileId: number;
  onFeedbackSubmitted?: () => void;
}

export const FeedbackForm = ({ ecuFileId, onFeedbackSubmitted }: FeedbackFormProps) => {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [existingFeedback, setExistingFeedback] = useState<{
    rating: number;
    comment: string;
  } | null>(null);

  useEffect(() => {
    // Check if there's existing feedback for this ECU file
    const fetchExistingFeedback = async () => {
      try {
        const response = await fetch(`/api/feedback?ecuFileId=${ecuFileId}`);
        const data = await response.json();
        
        if (data.success && data.feedback && data.feedback.length > 0) {
          // Find feedback from the current user
          const userFeedback = data.feedback.find((f: any) => f.user_id === "current_user_id");
          if (userFeedback) {
            setExistingFeedback({
              rating: userFeedback.rating,
              comment: userFeedback.comment || ""
            });
            setRating(userFeedback.rating);
            setComment(userFeedback.comment || "");
          }
        }
      } catch (error) {
        console.error("Error fetching existing feedback:", error);
      }
    };

    fetchExistingFeedback();
  }, [ecuFileId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "current_user_id" // In a real app, this would come from auth
        },
        body: JSON.stringify({
          ecuFileId,
          rating,
          comment
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess(true);
        if (onFeedbackSubmitted) {
          onFeedbackSubmitted();
        }
      } else {
        setError(data.error || "Failed to submit feedback");
      }
    } catch (error) {
      setError("An error occurred while submitting feedback");
      console.error("Error submitting feedback:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        {existingFeedback ? "Update Your Feedback" : "Rate Your Experience"}
      </h3>
      
      {success ? (
        <div className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 p-4 rounded-md mb-4">
          <p className="font-medium">Thank you for your feedback!</p>
          <p className="text-sm mt-1">Your rating has been submitted successfully.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-4 rounded-md mb-4">
              <p className="font-medium">Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rating
            </label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  {star <= rating ? (
                    <StarIcon className="h-8 w-8 text-yellow-400" />
                  ) : (
                    <StarOutlineIcon className="h-8 w-8 text-gray-300 dark:text-gray-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Comments (Optional)
            </label>
            <textarea
              id="comment"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Tell us about your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isSubmitting ? "Submitting..." : existingFeedback ? "Update Feedback" : "Submit Feedback"}
          </button>
        </form>
      )}
    </div>
  );
}; 