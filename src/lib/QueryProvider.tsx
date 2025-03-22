"use client";

import { ReactNode, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// Create a singleton QueryClient that can be accessed from outside the component context
let globalQueryClient: QueryClient | null = null;

// Function to get the global QueryClient instance
export function getQueryClient(): QueryClient | null {
  return globalQueryClient;
}

export function QueryProvider({ children }: { children: ReactNode }) {
  // Create a new QueryClient instance for each session to avoid shared state across users
  const [queryClient] = useState(() => {
    const client = new QueryClient({
      defaultOptions: {
        queries: {
          // Default settings for all queries
          refetchOnWindowFocus: true,
          refetchOnMount: true,
          refetchOnReconnect: true,
          staleTime: 1000 * 60 * 5, // 5 minutes
          retry: 1,
          // Enable automatic background refetching
          refetchInterval: 30000, // 30 seconds
        },
      },
    });

    // Store the client in the global variable for external access
    globalQueryClient = client;
    return client;
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
