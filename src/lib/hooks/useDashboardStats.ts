import { useQuery } from "@tanstack/react-query";

interface DashboardStats {
  totalFiles: number;
  successRate: number;
  avgProcessTime: number;
  activities: Array<{
    id: number;
    type: "success" | "error" | "info" | "warning";
    message: string;
    timestamp: string;
  }>;
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