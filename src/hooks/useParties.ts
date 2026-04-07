import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../utils/api";
import type { Party, ApiResponse } from "../types/api";

export const useParties = () => {
  return useQuery({
    queryKey: ["parties"],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Party[]>>("/parties");
      return response.data.data;
    },
  });
};

export const useCreateParty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Party>) => {
      const response = await api.post<ApiResponse<Party>>("/parties", payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parties"] });
      window.dispatchEvent(new CustomEvent("dashboard-refresh"));
    },
  });
};

export const useUpdateParty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<Party> & { id: number }) => {
      const response = await api.put<ApiResponse<Party>>(`/parties/${id}`, payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parties"] });
      window.dispatchEvent(new CustomEvent("dashboard-refresh"));
    },
  });
};

export const useDeleteParty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/parties/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parties"] });
      window.dispatchEvent(new CustomEvent("dashboard-refresh"));
    },
  });
};
