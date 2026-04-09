import api from '@/lib/api';
import { API } from '@/constants/api';
import type { ApiResponse, User } from '@/types';

export interface SendOtpPayload {
  mobile_number: string;
}

export interface VerifyOtpPayload {
  mobile_number: string;
  otp: string;
}

export interface VerifyOtpResponse {
  user: User;
  token?: string;
}

export interface SetupShopPayload {
  user_id: number;
  owner_name: string;
  shop_name?: string;
  shop_address?: string;
  business_type?: string;
  is_registration_complete: boolean;
}

export interface VerifyTokenResponse {
  user: User;
}

const authService = {
  sendOtp: (payload: SendOtpPayload) =>
    api.post<ApiResponse<null>>(API.AUTH.SEND_OTP, payload),

  resendOtp: (payload: SendOtpPayload) =>
    api.post<ApiResponse<null>>(API.AUTH.RESEND_OTP, payload),

  verifyOtp: (payload: VerifyOtpPayload) =>
    api.post<ApiResponse<VerifyOtpResponse>>(API.AUTH.VERIFY_OTP, payload),

  verifyToken: (token: string) =>
    api.post<ApiResponse<VerifyTokenResponse>>(API.AUTH.VERIFY_TOKEN, { token }),

  setupShop: (payload: SetupShopPayload) =>
    api.post<ApiResponse<{ user: User; token: string }>>(
      API.AUTH.UPDATE_SHOP,
      payload,
    ),

  logout: () => api.post<ApiResponse<null>>(API.AUTH.LOGOUT),
};

export default authService;
