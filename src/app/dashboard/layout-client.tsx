'use client';

import FloatingTicketButton from "@/components/FloatingTicketButton";
import DashboardDebug from "./components/DashboardDebug";

interface User {
  id: number;
  name: string;
  email: string;
  credits: number;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-64">
        <DashboardDebug />
      </div>
      <div className="flex-grow p-6 md:overflow-y-auto md:p-12">
        {children}
      </div>
      <FloatingTicketButton />
    </div>
  );
} 