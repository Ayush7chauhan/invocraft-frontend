import api from '@/lib/api';
import { API } from '@/constants/api';
import type { ApiResponse, Category, CategoryFormData } from '@/types';

const categoriesService = {
  list: (params?: { search?: string }) =>
    api.get<ApiResponse<Category[]>>(API.CATEGORIES.LIST, { params }),

  create: (payload: CategoryFormData) =>
    api.post<ApiResponse<Category>>(API.CATEGORIES.CREATE, payload),

  update: (id: number, payload: Partial<CategoryFormData>) =>
    api.put<ApiResponse<Category>>(API.CATEGORIES.UPDATE(id), payload),

  delete: (id: number) =>
    api.delete<ApiResponse<null>>(API.CATEGORIES.DELETE(id)),
};

export default categoriesService;
