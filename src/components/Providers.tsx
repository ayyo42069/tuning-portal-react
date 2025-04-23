"use client";

import { ThemeProvider } from "next-themes";
import { NotificationProvider } from "@/lib/NotificationProvider";
import { FeedbackProvider } from "@/lib/FeedbackProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <NotificationProvider>
        <FeedbackProvider>
          {children}
        </FeedbackProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
} 