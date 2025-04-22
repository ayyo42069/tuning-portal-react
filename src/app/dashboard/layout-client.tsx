"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthProvider";
import FloatingTicketButton from "@/components/FloatingTicketButton";
import DashboardDebug from "./components/DashboardDebug";
import DynamicIsland from "@/components/DynamicIsland";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  // Check if user is authenticated, redirect if not
  useEffect(() => {
    if (!isLoading && !user) {
      console.log("[DashboardLayout] No user found, redirecting to login");
      router.push("/auth/login");
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen bg-background">
      {/* Debug component */}
      <DashboardDebug />
      
      {/* Dynamic Island */}
      <DynamicIsland key="dashboard" variant="dashboard" />
      
      {/* Main content area */}
      <main className="flex-1 p-4 md:p-6 mt-24 max-w-7xl mx-auto">
        <div className="space-y-8">
          {children}
        </div>
      </main>
      
      {/* Floating ticket button */}
      <FloatingTicketButton />
    </div>
  );
} 