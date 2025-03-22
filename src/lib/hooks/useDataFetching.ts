import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../AuthProvider";

// Define query keys for different data types
export const queryKeys = {
  user: "user",
  tuningFiles: "tuningFiles",
  notifications: "notifications",
  credits: "credits",
  manufacturers: "manufacturers",
  models: "models",
  tuningOptions: "tuningOptions",
};

// Hook for fetching user profile data
export function useUserProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: [queryKeys.user, user?.id],
    queryFn: async () => {
      const response = await fetch("/api/user/profile", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }
      return response.json();
    },
    enabled: !!user, // Only run if user is authenticated
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 30000, // 30 seconds
  });
}

// Hook for fetching tuning files history
export function useTuningFiles() {
  const { user } = useAuth();

  return useQuery({
    queryKey: [queryKeys.tuningFiles, user?.id],
    queryFn: async () => {
      const response = await fetch("/api/tuning/history", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch tuning files");
      }
      const data = await response.json();
      return data.tuningFiles;
    },
    enabled: !!user, // Only run if user is authenticated
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 15000, // 15 seconds - more frequent updates for tuning files
  });
}

// Hook for fetching notifications
export function useNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [queryKeys.notifications, user?.id],
    queryFn: async () => {
      const response = await fetch("/api/notifications", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }
      const data = await response.json();
      return data.notifications;
    },
    enabled: !!user, // Only run if user is authenticated
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 10000, // 10 seconds - frequent updates for notifications
  });

  // Mutation for marking notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: "PUT",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to mark notification as read");
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate notifications query to refetch
      queryClient.invalidateQueries({
        queryKey: [queryKeys.notifications, user?.id],
      });
    },
  });

  // Mutation for marking all notifications as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/notifications/read-all", {
        method: "PUT",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to mark all notifications as read");
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate notifications query to refetch
      queryClient.invalidateQueries({
        queryKey: [queryKeys.notifications, user?.id],
      });
    },
  });

  return {
    ...query,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    unreadCount: query.data
      ? query.data.filter((notification: any) => !notification.isRead).length
      : 0,
  };
}

// Hook for fetching credit transactions
export function useCreditTransactions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: [queryKeys.credits, user?.id],
    queryFn: async () => {
      const response = await fetch("/api/credits/transactions", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch credit transactions");
      }
      return response.json();
    },
    enabled: !!user, // Only run if user is authenticated
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 30000, // 30 seconds
  });
}

// Hook for fetching manufacturers
export function useManufacturers() {
  return useQuery({
    queryKey: [queryKeys.manufacturers],
    queryFn: async () => {
      const response = await fetch("/api/manufacturers");
      if (!response.ok) {
        throw new Error("Failed to fetch manufacturers");
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 60, // 1 hour - manufacturers don't change often
  });
}

// Hook for fetching models by manufacturer
export function useModelsByManufacturer(manufacturerId: number | null) {
  return useQuery({
    queryKey: [queryKeys.models, manufacturerId],
    queryFn: async () => {
      if (!manufacturerId) return [];
      const response = await fetch(
        `/api/models?manufacturer=${manufacturerId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch models");
      }
      return response.json();
    },
    enabled: !!manufacturerId, // Only run if manufacturerId is provided
    staleTime: 1000 * 60 * 60, // 1 hour - models don't change often
  });
}

// Hook for fetching tuning options
export function useTuningOptions() {
  return useQuery({
    queryKey: [queryKeys.tuningOptions],
    queryFn: async () => {
      const response = await fetch("/api/tuning-options");
      if (!response.ok) {
        throw new Error("Failed to fetch tuning options");
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 60, // 1 hour - tuning options don't change often
  });
}
