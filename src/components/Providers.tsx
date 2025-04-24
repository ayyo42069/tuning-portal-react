"use client";

import { ThemeProvider } from "next-themes";
import { NotificationProvider } from "@/lib/NotificationProvider";
import { FeedbackProvider } from "@/lib/FeedbackProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
        retry: 1
      }
    }
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <NotificationProvider>
          <FeedbackProvider>
            {children}
          </FeedbackProvider>
        </NotificationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
} 