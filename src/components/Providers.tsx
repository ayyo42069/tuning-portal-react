"use client";

import { ThemeProvider } from "next-themes";
import { NotificationProvider } from "@/lib/NotificationProvider";
import { FeedbackProvider } from "@/lib/FeedbackProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";

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

  // Handle theme changes
  useEffect(() => {
    const handleThemeChange = (e: MediaQueryListEvent) => {
      if (!localStorage.theme) {
        document.documentElement.classList.toggle("dark", e.matches);
      }
    };

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", handleThemeChange);

    return () => mediaQuery.removeEventListener("change", handleThemeChange);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange={false}
        storageKey="tuning-portal-theme"
      >
        <NotificationProvider>
          <FeedbackProvider>
            {children}
          </FeedbackProvider>
        </NotificationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
} 