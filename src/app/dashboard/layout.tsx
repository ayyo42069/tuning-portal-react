import { Metadata } from 'next';
import DashboardLayout from './layout-client';

export const metadata: Metadata = {
  title: 'Dashboard | Tuning Portal',
  description: 'Access your tuning files, manage your account, and track your tuning history.',
  keywords: ['tuning', 'dashboard', 'ecu', 'files', 'management'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
