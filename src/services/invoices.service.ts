import api from '@/lib/api';
import { API } from '@/constants/api';
import type { ApiResponse, Invoice, InvoiceFormData } from '@/types';

export interface InvoiceListParams {
  search?: string;
  status?: string;
  party_id?: number;
  from_date?: string;
  to_date?: string;
  page?: number;
  per_page?: number;
}

const invoicesService = {
  list: (params?: InvoiceListParams) =>
    api.get<ApiResponse<Invoice[]>>(API.INVOICES.LIST, { params }),

  show: (id: number) =>
    api.get<ApiResponse<Invoice>>(API.INVOICES.SHOW(id)),

  create: (payload: InvoiceFormData) =>
    api.post<ApiResponse<Invoice>>(API.INVOICES.CREATE, payload),

  update: (id: number, payload: Partial<InvoiceFormData>) =>
    api.put<ApiResponse<Invoice>>(API.INVOICES.UPDATE(id), payload),

  delete: (id: number) =>
    api.delete<ApiResponse<null>>(API.INVOICES.DELETE(id)),
};

export default invoicesService;
