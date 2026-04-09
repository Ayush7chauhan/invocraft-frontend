import api from '@/lib/api';
import { API } from '@/constants/api';
import type { ApiResponse, Unit, UnitFormData } from '@/types';

const unitsService = {
  list: (params?: { search?: string }) =>
    api.get<ApiResponse<Unit[]>>(API.UNITS.LIST, { params }),

  create: (payload: UnitFormData) =>
    api.post<ApiResponse<Unit>>(API.UNITS.CREATE, payload),

  update: (id: number, payload: Partial<UnitFormData>) =>
    api.put<ApiResponse<Unit>>(API.UNITS.UPDATE(id), payload),

  delete: (id: number) =>
    api.delete<ApiResponse<null>>(API.UNITS.DELETE(id)),
};

export default unitsService;
