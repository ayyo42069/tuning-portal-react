import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Home, FileText, Users, CreditCard, Bell } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verify admin access
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) {
    redirect("/auth/login");
  }

  const user = await verifyToken(token);
  if (!user || user.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-72 min-h-screen bg-white dark:bg-gray-800 shadow-lg">
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Admin Portal</h2>
            </div>
            
            {/* Back to dashboard button */}
            <Link 
              href="/dashboard" 
              className="flex items-center mb-8 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>
            
            <nav className="space-y-1">
              <Link
                href="/admin"
                className="flex items-center px-4 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
              >
                <Home className="h-5 w-5 mr-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                Dashboard
              </Link>
              <Link
                href="/admin/tuning-requests"
                className="flex items-center px-4 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
              >
                <FileText className="h-5 w-5 mr-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                Tuning Requests
              </Link>
              <Link
                href="/admin/users"
                className="flex items-center px-4 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
              >
                <Users className="h-5 w-5 mr-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                Users
              </Link>
              <Link
                href="/admin/credits"
                className="flex items-center px-4 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
              >
                <CreditCard className="h-5 w-5 mr-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                Credits
              </Link>
              <Link
                href="/admin/notifications"
                className="flex items-center px-4 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
              >
                <Bell className="h-5 w-5 mr-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                Notifications
              </Link>
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-8">{children}</div>
      </div>
    </div>
  );
}
