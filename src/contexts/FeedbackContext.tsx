"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { FeedbackToast } from "@/components/FeedbackToast";

export type FeedbackType = "success" | "error" | "info" | "warning";

interface Feedback {
  message: string;
  type: FeedbackType;
  id: string;
}

interface FeedbackContextType {
  feedback: Feedback | null;
  showFeedback: (message: string, type: FeedbackType) => void;
  clearFeedback: () => void;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

interface FeedbackProviderProps {
  children: ReactNode;
}

export function FeedbackProvider({ children }: FeedbackProviderProps) {
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const showFeedback = useCallback((message: string, type: FeedbackType) => {
    const id = Math.random().toString(36).substring(2, 9);
    setFeedback({ message, type, id });

    // Auto-clear feedback after 5 seconds
    setTimeout(() => {
      setFeedback((current) => (current?.id === id ? null : current));
    }, 5000);
  }, []);

  const clearFeedback = useCallback(() => {
    setFeedback(null);
  }, []);

  return (
    <FeedbackContext.Provider value={{ feedback, showFeedback, clearFeedback }}>
      {children}
      <FeedbackToast />
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