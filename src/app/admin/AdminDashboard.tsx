import { AdminDashboardClient } from './AdminDashboardClient';

export default function AdminDashboard() {
  const { StatCard, RecentActivity, Charts } = AdminDashboardClient;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value="1,234"
          change={12}
          icon="users"
          color="blue"
        />
        <StatCard
          title="Active Sessions"
          value="456"
          change={5}
          icon="activity"
          color="green"
        />
        <StatCard
          title="Total Revenue"
          value="$12,345"
          change={8}
          icon="dollar"
          color="purple"
        />
        <StatCard
          title="Error Rate"
          value="0.5%"
          change={-2}
          icon="alert"
          color="red"
        />
      </div>

      {/* Charts Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Analytics Overview</h2>
        <Charts />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <RecentActivity />
      </div>
    </div>
  );
} 