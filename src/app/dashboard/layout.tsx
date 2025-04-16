import { Metadata } from 'next';
import { Suspense } from "react";
import DashboardLayoutClient from "./layout-client";
import LoadingSpinner from "@/components/LoadingSpinner";

export const metadata: Metadata = {
  title: 'Dashboard | Tuning Portal',
  description: 'Access your tuning files, manage your account, and track your tuning history.',
  keywords: ['tuning', 'dashboard', 'ecu', 'files', 'management'],
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <DashboardLayoutClient>
        {children}
      </DashboardLayoutClient>
    </Suspense>
  );
}
