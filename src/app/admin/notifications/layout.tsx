import { Bell } from "lucide-react";

export default function NotificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center mb-2">
          <Bell className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Notifications Center
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Manage system notifications and messages sent to users
        </p>
      </div>
      {children}
    </div>
  );
}
