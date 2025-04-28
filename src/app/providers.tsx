"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/lib/AuthProvider";
import { FeedbackProvider } from "@/contexts/FeedbackContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// Create a client with proper configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
      retry: 1,
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
  },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AuthProvider>
          <NotificationProvider>
            <FeedbackProvider>
              {children}
            </FeedbackProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
} 