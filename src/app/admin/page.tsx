import { Suspense } from 'react';
import { fetchAdminDashboardStats } from '@/lib/admin/actions';
import { StatCard, RecentActivity, Charts } from './AdminDashboardClient';
import LoadingSpinner from '@/components/LoadingSpinner';
import dynamic from 'next/dynamic';
import { headers } from 'next/headers';

// Dynamically import the client component with SSR disabled
const AdminDashboardComponent = dynamic(
  () => import('./AdminDashboard'),
  { ssr: false }
);

// This tells Next.js that this page should be dynamically rendered
export const dynamicParams = false;
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Stats widget with robust error handling for static builds
async function StatsWidget() {
  try {
    const stats = await fetchAdminDashboardStats();
    
    if (!stats || stats.error) {
      return (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <h3 className="text-md font-medium text-red-800 dark:text-red-200">Error Loading Data</h3>
          <p className="text-sm text-red-600 dark:text-red-300 mt-1">Could not load dashboard statistics. Please try again later.</p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Pending Requests"
          value={stats.pendingRequests ?? 0}
          change={stats.pendingRequestsChange ?? 0}
          icon="file-pending"
          color="blue"
        />
        <StatCard 
          title="Active Users"
          value={stats.activeUsers ?? 0}
          change={stats.activeUsersChange ?? 0}
          icon="users"
          color="green"
        />
        <StatCard 
          title="Credits Sold"
          value={stats.creditsSold ?? 0}
          change={stats.creditsSoldChange ?? 0}
          icon="credit"
          color="purple"
        />
        <StatCard 
          title="Revenue"
          value={`$${stats.revenue ?? 0}`}
          change={stats.revenueChange ?? 0}
          icon="dollars"
          color="amber"
        />
      </div>
    );
  } catch (error) {
    console.error("Error in StatsWidget:", error);
    return <BackupStatsWidget />;
  }
}

// Guaranteed-to-render backup component
function BackupStatsWidget() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard 
        title="Pending Requests"
        value="--"
        change={0}
        icon="file-pending"
        color="blue"
      />
      <StatCard 
        title="Active Users"
        value="--"
        change={0}
        icon="users"
        color="green"
      />
      <StatCard 
        title="Credits Sold"
        value="--"
        change={0}
        icon="credit"
        color="purple"
      />
      <StatCard 
        title="Revenue"
        value="--"
        change={0}
        icon="dollars"
        color="amber"
      />
    </div>
  );
}

// Recent activity widget with robust error handling
async function RecentActivityWidget() {
  try {
    const stats = await fetchAdminDashboardStats();
    
    if (!stats || stats.error) {
      return (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <h3 className="text-md font-medium text-red-800 dark:text-red-200">Error Loading Data</h3>
          <p className="text-sm text-red-600 dark:text-red-300 mt-1">Could not load recent activity. Please try again later.</p>
        </div>
      );
    }
    
    return (
      <RecentActivity 
        activities={stats.recentActivities ?? []} 
      />
    );
  } catch (error) {
    console.error("Error in RecentActivityWidget:", error);
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
        <h3 className="text-md font-medium text-red-800 dark:text-red-200">Error Loading Data</h3>
        <p className="text-sm text-red-600 dark:text-red-300 mt-1">Could not load recent activity. Please try again later.</p>
      </div>
    );
  }
}

export default function AdminPage() {
  return (
    <Suspense fallback={
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    }>
      <AdminDashboardComponent />
    </Suspense>
  );
}
