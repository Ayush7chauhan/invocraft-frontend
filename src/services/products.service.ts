import api from '@/lib/api';
import { API } from '@/constants/api';
import type { ApiResponse, Product, ProductFormData } from '@/types';

export interface ProductListParams {
  search?: string;
  category_id?: number;
  low_stock?: boolean;
  page?: number;
  per_page?: number;
}

const productsService = {
  list: (params?: ProductListParams) =>
    api.get<ApiResponse<Product[]>>(API.PRODUCTS.LIST, { params }),

  show: (id: number) =>
    api.get<ApiResponse<Product>>(API.PRODUCTS.SHOW(id)),

  create: (payload: ProductFormData) =>
    api.post<ApiResponse<Product>>(API.PRODUCTS.CREATE, payload),

  update: (id: number, payload: Partial<ProductFormData>) =>
    api.put<ApiResponse<Product>>(API.PRODUCTS.UPDATE(id), payload),

  delete: (id: number) =>
    api.delete<ApiResponse<null>>(API.PRODUCTS.DELETE(id)),
};

export default productsService;
