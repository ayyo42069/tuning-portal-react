import { executeQuery } from "@/lib/db";
import { FileText, Users, CreditCard } from "lucide-react";

async function getAdminStats() {
  const [pendingRequests] = await executeQuery<any[]>(
    'SELECT COUNT(*) as count FROM ecu_files WHERE status = "pending"'
  );

  const [totalUsers] = await executeQuery<any[]>(
    'SELECT COUNT(*) as count FROM users WHERE role = "user"'
  );

  const [totalCredits] = await executeQuery<any[]>(
    'SELECT SUM(credits) as total FROM user_credits'
  );

  return {
    pendingRequests: pendingRequests?.count || 0,
    totalUsers: totalUsers?.count || 0,
    totalCredits: totalCredits?.total || 0,
  };
}

export default async function AdminDashboard() {
  const stats = await getAdminStats();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Welcome to the tuning portal admin area</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pending Requests Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">Pending Requests</h3>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{stats.pendingRequests}</p>
          <a
            href="/admin/tuning-requests"
            className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
          >
            View all requests
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        {/* Total Users Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">Total Users</h3>
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{stats.totalUsers}</p>
          <a
            href="/admin/users"
            className="inline-flex items-center text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors"
          >
            Manage users
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        {/* Total Credits Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">Total Credits</h3>
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CreditCard className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{stats.totalCredits}</p>
          <a
            href="/admin/credits"
            className="inline-flex items-center text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors"
          >
            View credit history
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}