"use client";

import { useState, useEffect } from "react";
import { StarIcon } from "@heroicons/react/24/solid";
import { StarIcon as StarOutlineIcon } from "@heroicons/react/24/outline";
import { UserCircleIcon } from "@heroicons/react/24/outline";

interface FeedbackDisplayProps {
  ecuFileId: number;
}

interface FeedbackItem {
  id: number;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_name?: string;
}

export const FeedbackDisplay = ({ ecuFileId }: FeedbackDisplayProps) => {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [ratingDistribution, setRatingDistribution] = useState<Record<number, number>>({
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0
  });

  useEffect(() => {
    const fetchFeedback = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/feedback?ecuFileId=${ecuFileId}`);
        const data = await response.json();
        
        if (data.success && data.feedback) {
          setFeedback(data.feedback);
          
          // Calculate average rating
          if (data.feedback.length > 0) {
            const totalRating = data.feedback.reduce((sum: number, item: FeedbackItem) => sum + item.rating, 0);
            setAverageRating(totalRating / data.feedback.length);
            
            // Calculate rating distribution
            const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
            data.feedback.forEach((item: FeedbackItem) => {
              distribution[item.rating] = (distribution[item.rating] || 0) + 1;
            });
            setRatingDistribution(distribution);
          }
        } else {
          setError("Failed to load feedback");
        }
      } catch (error) {
        console.error("Error fetching feedback:", error);
        setError("An error occurred while loading feedback");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeedback();
  }, [ecuFileId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-4 rounded-md">
          <p className="font-medium">Error</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (feedback.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Customer Feedback</h3>
        <p className="text-gray-500 dark:text-gray-400">No feedback available yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Customer Feedback</h3>
      
      <div className="flex items-center mb-6">
        <div className="flex items-center mr-4">
          <span className="text-3xl font-bold text-gray-900 dark:text-white mr-2">
            {averageRating.toFixed(1)}
          </span>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star}>
                {star <= Math.round(averageRating) ? (
                  <StarIcon className="h-5 w-5 text-yellow-400" />
                ) : (
                  <StarOutlineIcon className="h-5 w-5 text-gray-300 dark:text-gray-600" />
                )}
              </span>
            ))}
          </div>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Based on {feedback.length} {feedback.length === 1 ? 'review' : 'reviews'}
        </span>
      </div>
      
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rating Distribution</h4>
        <div className="space-y-1">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = ratingDistribution[rating] || 0;
            const percentage = feedback.length > 0 ? (count / feedback.length) * 100 : 0;
            
            return (
              <div key={rating} className="flex items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400 w-8">{rating}</span>
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mx-2 overflow-hidden">
                  <div 
                    className="h-full bg-yellow-400 rounded-full" 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400 w-12 text-right">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="space-y-6">
        {feedback.map((item) => (
          <div key={item.id} className="border-t border-gray-200 dark:border-gray-700 pt-4 first:border-t-0 first:pt-0">
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-3">
                <UserCircleIcon className="h-10 w-10 text-gray-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center mb-1">
                  <div className="flex mr-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star}>
                        {star <= item.rating ? (
                          <StarIcon className="h-4 w-4 text-yellow-400" />
                        ) : (
                          <StarOutlineIcon className="h-4 w-4 text-gray-300 dark:text-gray-600" />
                        )}
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(item.created_at)}
                  </span>
                </div>
                {item.comment && (
                  <p className="text-gray-700 dark:text-gray-300 text-sm">{item.comment}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 