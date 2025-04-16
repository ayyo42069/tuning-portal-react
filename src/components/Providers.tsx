"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "@/lib/ThemeProvider";
import { NotificationProvider } from "@/lib/NotificationProvider";
import { AuthProvider } from "@/lib/AuthProvider";
import { QueryProvider } from "@/lib/QueryProvider";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
} 