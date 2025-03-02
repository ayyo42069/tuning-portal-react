import { executeQuery } from "@/lib/db";
import NotificationForm from "./NotificationForm";

async function getSentNotifications() {
  const notifications = await executeQuery<any[]>(
    `SELECT 
      id,
      title,
      message,
      type,
      is_global as isGlobal,
      created_at as createdAt,
      (SELECT COUNT(*) FROM notifications WHERE is_read = true AND id = n.id) as readCount
    FROM notifications n
    WHERE is_global = true
    ORDER BY created_at DESC
    LIMIT 50`
  );
  return notifications;
}

export default async function NotificationsAdmin() {
  const sentNotifications = await getSentNotifications();

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">System Notifications</h1>

      {/* Notification Form */}
      <NotificationForm />

      {/* Sent Notifications */}
      <div className="bg-card p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Sent Notifications</h2>
        <div className="space-y-4">
          {sentNotifications.map((notification) => (
            <div
              key={notification.id}
              className="border-b border-border last:border-0 pb-4 last:pb-0"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium">{notification.title}</h3>
                <span className="text-sm text-muted-foreground">
                  {new Date(notification.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm mb-2">{notification.message}</p>
              <div className="flex gap-2 text-sm text-muted-foreground">
                <span>Type: {notification.type}</span>
                <span>•</span>
                <span>Read by: {notification.readCount} users</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
