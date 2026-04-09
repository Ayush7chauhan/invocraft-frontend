import api from '@/lib/api';
import { API } from '@/constants/api';
import type { ApiResponse, Expense, ExpenseFormData } from '@/types';

export interface ExpenseListParams {
  search?: string;
  category?: string;
  from_date?: string;
  to_date?: string;
  page?: number;
  per_page?: number;
}

const expensesService = {
  list: (params?: ExpenseListParams) =>
    api.get<ApiResponse<Expense[]>>(API.EXPENSES.LIST, { params }),

  create: (payload: ExpenseFormData) =>
    api.post<ApiResponse<Expense>>(API.EXPENSES.CREATE, payload),

  update: (id: number, payload: Partial<ExpenseFormData>) =>
    api.put<ApiResponse<Expense>>(API.EXPENSES.UPDATE(id), payload),

  delete: (id: number) =>
    api.delete<ApiResponse<null>>(API.EXPENSES.DELETE(id)),
};

export default expensesService;
