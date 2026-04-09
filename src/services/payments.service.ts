import api from '@/lib/api';
import { API } from '@/constants/api';
import type { ApiResponse, Payment, PaymentFormData } from '@/types';

export interface PaymentListParams {
  search?: string;
  party_id?: number;
  payment_method?: string;
  start_date?: string;
  end_date?: string;
}

const paymentsService = {
  list: (params?: PaymentListParams) =>
    api.get<ApiResponse<Payment[]>>(API.PAYMENTS.LIST, { params }),

  create: (payload: PaymentFormData) =>
    api.post<ApiResponse<Payment>>(API.PAYMENTS.CREATE, payload),

  update: (id: number, payload: Partial<PaymentFormData>) =>
    api.put<ApiResponse<Payment>>(API.PAYMENTS.UPDATE(id), payload),

  delete: (id: number) =>
    api.delete<ApiResponse<null>>(API.PAYMENTS.DELETE(id)),

  getPartyPayments: (partyId: number, params?: PaymentListParams) =>
    api.get<ApiResponse<Payment[]>>(API.PAYMENTS.PARTY_PAYMENTS(partyId), { params }),
};

export default paymentsService;
