'use client';

import dynamic from 'next/dynamic';

const AdminDashboardComponent = dynamic(
  () => import('./AdminDashboard'),
  { ssr: false }
);

export default function AdminDashboardWrapper() {
  return <AdminDashboardComponent />;
} 