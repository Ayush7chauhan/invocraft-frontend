import api from '@/lib/api';
import { API } from '@/constants/api';
import type { ApiResponse, DashboardStats } from '@/types';

const dashboardService = {
  getStats: () => api.get<ApiResponse<DashboardStats>>(API.DASHBOARD),
};

export default dashboardService;
