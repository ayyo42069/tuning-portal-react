import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/AuthProvider";

interface Activity {
  id: number;
  type: "success" | "error" | "info" | "warning";
  message: string;
  timestamp: string;
}

interface CreditStats {
  total: number;
  used: number;
  remaining: number;
}

interface ProcessingStats {
  inQueue: number;
  avgQueueTime: number;
  successRate: number;
}

export interface DashboardStats {
  totalFiles: number;
  successRate: number;
  avgProcessTime: number;
  activities: Activity[];
  credits: CreditStats;
  processing: ProcessingStats;
}

export function useDashboardStats() {
  const { user } = useAuth();

  return useQuery<DashboardStats>({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/stats", {
        headers: {
          "x-user-id": user?.id?.toString() || "",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard stats");
      }
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    enabled: !!user?.id, // Only run the query if we have a user ID
  });
} 