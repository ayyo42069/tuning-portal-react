// Chat utility functions

// Helper function to generate consistent colors for users based on their ID
export const getUserColor = (userId: number) => {
  // List of background colors for user avatars
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-yellow-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-red-500",
    "bg-teal-500",
    "bg-orange-500",
    "bg-cyan-500",
  ];

  // Use modulo to ensure we always get a valid index
  return colors[userId % colors.length];
};

// Helper function to get text color for users
export const getUserTextColor = (userId: number) => {
  // List of text colors that match the background colors
  const colors = [
    "text-blue-600 dark:text-blue-400",
    "text-green-600 dark:text-green-400",
    "text-purple-600 dark:text-purple-400",
    "text-yellow-600 dark:text-yellow-400",
    "text-pink-600 dark:text-pink-400",
    "text-indigo-600 dark:text-indigo-400",
    "text-red-600 dark:text-red-400",
    "text-teal-600 dark:text-teal-400",
    "text-orange-600 dark:text-orange-400",
    "text-cyan-600 dark:text-cyan-400",
  ];

  return colors[userId % colors.length];
};

// Format time in a consistent way
export const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Format timestamp for display
export const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleString();
};