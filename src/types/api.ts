export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export type User = {
  id: number;
  name: string;
  email: string;
  shop_name?: string;
  shop_address?: string;
  mobile_number?: string;
};

export type Party = {
  id: number;
  name: string;
  mobile: string | null;
  address: string | null;
  type: "customer" | "supplier" | "both";
  gst_number?: string;
  opening_balance: number;
  status: "active" | "inactive";
};

export type Product = {
  id: number;
  name: string;
  category: string | null;
  selling_price: number;
  purchase_price?: number;
  stock_quantity: number;
  tax_rate: number;
  unit?: string;
};

export type InvoiceStatus = "paid" | "unpaid" | "partially_paid";

export type InvoiceItem = {
  id: number;
  product_id: number;
  product?: Product;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
};

export type Invoice = {
  id: number;
  invoice_number: string;
  invoice_date: string;
  party_id: number;
  party?: Party;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  payment_status: InvoiceStatus;
  paid_amount: number;
  notes?: string;
  terms?: string;
  items?: InvoiceItem[];
  created_at: string;
};

export type DashboardStats = {
  total_sales: number;
  total_purchases: number;
  total_receivable: number;
  total_payable: number;
  sales_this_month: number;
  recent_invoices: Invoice[];
};
