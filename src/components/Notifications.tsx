import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check } from 'lucide-react';
import { toast } from 'sonner';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      if (!response.ok) throw new Error('Failed to fetch notifications');
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    }
  };

  const markAsRead = async (id: number) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to mark notification as read');
      
      setNotifications(notifications.map(notification => 
        notification.id === id ? { ...notification, is_read: true } : notification
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-white hover:bg-white/10 rounded-full transition-colors"
      >
        <Bell className="w-6 h-6" />
        {notifications.some(n => !n.is_read) && (
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 mt-2 w-80 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-lg z-50"
          >
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Notifications</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/60 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-white/60 text-center py-4">No notifications</p>
                ) : (
                  notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        notification.is_read ? 'bg-white/5' : 'bg-white/10'
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-white">{notification.title}</h4>
                          <p className="text-sm text-white/60 mt-1">{notification.message}</p>
                        </div>
                        {!notification.is_read && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full" />
                        )}
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-white/40">
                          {new Date(notification.created_at).toLocaleDateString()}
                        </span>
                        {notification.is_read && (
                          <span className="text-xs text-white/40 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Read
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedNotification && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setSelectedNotification(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 max-w-lg w-full mx-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-white">{selectedNotification.title}</h3>
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="text-white/60 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-white/80 mb-4">{selectedNotification.message}</p>
              <div className="flex justify-between items-center text-sm text-white/40">
                <span>{new Date(selectedNotification.created_at).toLocaleString()}</span>
                <span className="flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  {selectedNotification.is_read ? 'Read' : 'Unread'}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 