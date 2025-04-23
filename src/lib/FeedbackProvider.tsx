"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  InformationCircleIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";

type FeedbackType = "success" | "error" | "info" | "warning";

interface Feedback {
  id: string;
  type: FeedbackType;
  message: string;
  duration?: number;
}

interface FeedbackContextType {
  showFeedback: (feedback: Omit<Feedback, "id">) => void;
  hideFeedback: (id: string) => void;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

  const showFeedback = useCallback((feedback: Omit<Feedback, "id">) => {
    const id = Math.random().toString(36).substring(7);
    setFeedbacks((prev) => [...prev, { ...feedback, id }]);

    if (feedback.duration !== 0) {
      setTimeout(() => {
        hideFeedback(id);
      }, feedback.duration || 3000);
    }
  }, []);

  const hideFeedback = useCallback((id: string) => {
    setFeedbacks((prev) => prev.filter((feedback) => feedback.id !== id));
  }, []);

  const getIcon = (type: FeedbackType) => {
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

  return (
    <FeedbackContext.Provider value={{ showFeedback, hideFeedback }}>
      {children}
      <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2">
        <AnimatePresence>
          {feedbacks.map((feedback) => (
            <motion.div
              key={feedback.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 dark:bg-gray-900/20 backdrop-blur-md border border-white/20 dark:border-gray-700/30 shadow-lg"
            >
              {getIcon(feedback.type)}
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {feedback.message}
              </span>
              <button
                onClick={() => hideFeedback(feedback.id)}
                className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <XCircleIcon className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (context === undefined) {
    throw new Error("useFeedback must be used within a FeedbackProvider");
  }
  return context;
} 