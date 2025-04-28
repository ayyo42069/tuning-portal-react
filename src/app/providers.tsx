"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/lib/AuthProvider";
import { FeedbackProvider } from "@/contexts/FeedbackContext";

// Create a client
const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FeedbackProvider>
          {children}
        </FeedbackProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
} 