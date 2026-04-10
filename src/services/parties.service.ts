import api from '@/lib/api';
import { API } from '@/constants/api';
import type { ApiResponse, Party, PartyFormData } from '@/types';

export interface PartyListParams {
  search?: string;
  type?: string;
  status?: 'active' | 'inactive';
  page?: number;
  per_page?: number;
}

const partiesService = {
  list: (params?: PartyListParams) =>
    api.get<ApiResponse<Party[]>>(API.PARTIES.LIST, { params }),

  show: (id: number) =>
    api.get<ApiResponse<Party>>(API.PARTIES.SHOW(id)),

  create: (payload: PartyFormData) =>
    api.post<ApiResponse<Party>>(API.PARTIES.CREATE, payload),

  update: (id: number, payload: Partial<PartyFormData>) =>
    api.put<ApiResponse<Party>>(API.PARTIES.UPDATE(id), payload),

  delete: (id: number) =>
    api.delete<ApiResponse<null>>(API.PARTIES.DELETE(id)),

  getLedger: (id: number, params?: { page?: number; per_page?: number }) =>
    api.get<ApiResponse<unknown>>(API.PARTIES.LEDGER(id), { params }),
};

export default partiesService;
