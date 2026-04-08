import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../utils/api";
import type { Expense, ApiResponse } from "../types/api";

export const useExpenses = () => {
  return useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Expense[]>>("/expenses");
      return response.data.data;
    },
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const response = await api.post<ApiResponse<Expense>>("/expenses", payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      window.dispatchEvent(new CustomEvent("dashboard-refresh"));
    },
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/expenses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      window.dispatchEvent(new CustomEvent("dashboard-refresh"));
    },
  });
};
