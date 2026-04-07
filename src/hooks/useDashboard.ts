import { useQuery } from "@tanstack/react-query";
import api from "../utils/api";
import type { DashboardStats, ApiResponse } from "../types/api";

/**
 * Hook to fetch dashboard statistics and recent activity.
 * Uses TanStack Query for caching and automatic background refetching.
 */
export const useDashboard = () => {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const response = await api.get<ApiResponse<DashboardStats>>("/reports/summary");
      
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch dashboard stats");
      }
      
      return response.data.data;
    },
    // Keep data fresh for 1 minute
    staleTime: 60 * 1000,
  });
};
