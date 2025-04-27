import { useQuery } from "@tanstack/react-query";

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
  return useQuery<DashboardStats>({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard stats");
      }
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
} 