"use client";

import { ReactNode, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export function QueryProvider({ children }: { children: ReactNode }) {
  // Create a new QueryClient instance for each session to avoid shared state across users
  const [queryClient] = useState(
    () =>
      new QueryClient({
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
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
