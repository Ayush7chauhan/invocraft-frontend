import api from '@/lib/api';
import { API } from '@/constants/api';
import type { ApiResponse, Shop } from '@/types';

export interface UpdateSettingsPayload {
  // Shop Profile (saved to User)
  shop_name?: string;
  owner_name?: string;
  shop_address?: string;
  business_type?: string;
  gst_number?: string;
  // Invoice / Billing (saved to Setting)
  invoice_prefix?: string;
  invoice_start_number?: number;
  currency?: string;
  currency_symbol?: string;
  default_tax_rate?: number;
  show_tax_on_invoice?: boolean;
  invoice_footer_note?: string;
}

const settingsService = {
  get: () => api.get<ApiResponse<Shop>>(API.SETTINGS.GET),
  update: (payload: UpdateSettingsPayload) =>
    api.put<ApiResponse<Shop>>(API.SETTINGS.UPDATE, payload),
};

export default settingsService;
