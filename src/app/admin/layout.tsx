import { Suspense } from "react";
import { Metadata } from "next";
import AdminLayoutClient from "./layout-client";
import LoadingSpinner from "@/components/LoadingSpinner";

export const metadata: Metadata = {
  title: 'Admin Portal | Tuning Portal',
  description: 'Admin dashboard for tuning portal management',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AdminLayoutClient>
        {children}
      </AdminLayoutClient>
    </Suspense>
  );
}
