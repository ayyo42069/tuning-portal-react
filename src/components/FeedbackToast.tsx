"use client";

import { useFeedback } from "@/contexts/FeedbackContext";
import { motion, AnimatePresence } from "framer-motion";

export function FeedbackToast() {
  const { feedback, clearFeedback } = useFeedback();

  if (!feedback) return null;

  const getBackgroundColor = () => {
    switch (feedback.type) {
      case "success":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      case "warning":
        return "bg-yellow-500";
      case "info":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <AnimatePresence>
      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
          className={`fixed bottom-4 right-4 ${getBackgroundColor()} text-white px-4 py-2 rounded-lg shadow-lg flex items-center justify-between min-w-[300px]`}
        >
          <span>{feedback.message}</span>
          <button
            onClick={clearFeedback}
            className="ml-4 text-white hover:text-gray-200 focus:outline-none"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 