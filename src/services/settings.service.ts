import api from '@/lib/api';
import { API } from '@/constants/api';
import type { ApiResponse, Shop } from '@/types';

export interface UpdateSettingsPayload {
  shop_name?: string;
  owner_name?: string;
  shop_address?: string;
  business_type?: string;
  gst_number?: string;
  invoice_prefix?: string;
}

const settingsService = {
  get: () => api.get<ApiResponse<Shop>>(API.SETTINGS.GET),

  update: (payload: UpdateSettingsPayload) =>
    api.put<ApiResponse<Shop>>(API.SETTINGS.UPDATE, payload),
};

export default settingsService;
