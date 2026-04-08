import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../utils/api";
import type { Bill, ApiResponse } from "../types/api";

export const useBills = () => {
  return useQuery({
    queryKey: ["bills"],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Bill[]>>("/bills");
      return response.data.data;
    },
  });
};

export const useCreateBill = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const response = await api.post<ApiResponse<Bill>>("/bills", payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      window.dispatchEvent(new CustomEvent("dashboard-refresh"));
    },
  });
};

export const useDeleteBill = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/bills/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      window.dispatchEvent(new CustomEvent("dashboard-refresh"));
    },
  });
};
