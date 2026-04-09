// ── Auth & User ──────────────────────────────────────────────────────────────

export interface User {
  id: number;
  owner_name: string;
  mobile_number: string;
  shop_name?: string;
  shop_address?: string;
  business_type?: BusinessType;
  is_registration_complete: boolean;
  created_at?: string;
  updated_at?: string;
}

export type BusinessType = 'grocery' | 'medical' | 'general' | 'other';

// ── Shop / Settings ──────────────────────────────────────────────────────────

export interface Shop {
  id: number;
  user_id: number;
  shop_name: string;
  owner_name: string;
  mobile_number: string;
  shop_address?: string;
  business_type?: BusinessType;
  gst_number?: string;
  invoice_prefix?: string;
}

// ── Party (Customer / Supplier) ──────────────────────────────────────────────

export type PartyType = 'customer' | 'supplier' | 'both';

export interface Party {
  id: number;
  name: string;
  mobile?: string;              // backend field: mobile (not mobile_number)
  email?: string;
  address?: string;
  type: PartyType;
  gst_number?: string;
  opening_balance?: number;
  status?: 'active' | 'inactive';
  balance?: number;             // computed by backend
  created_at?: string;
  updated_at?: string;
}

export interface PartyFormData {
  name: string;
  mobile?: string;              // backend: mobile
  email?: string;
  address?: string;
  type: PartyType;
  gst_number?: string;
  opening_balance?: number;
  status?: 'active' | 'inactive';
}

// ── Category ─────────────────────────────────────────────────────────────────

export interface Category {
  id: number;
  name: string;
  description?: string;
  products_count?: number;
  created_at?: string;
}

export interface CategoryFormData {
  name: string;
  description?: string;
}

// ── Unit ─────────────────────────────────────────────────────────────────────

export interface Unit {
  id: number;
  name: string;
  short_name: string;
  created_at?: string;
}

export interface UnitFormData {
  name: string;
  short_name: string;
}

// ── Product ──────────────────────────────────────────────────────────────────

export type ProductStatus = 'active' | 'inactive';

export interface ProductCategory {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  sku?: string;
  barcode?: string;
  category_id?: number;
  product_category?: ProductCategory;   // backend: productCategory relation → product_category
  unit_id?: number;
  unit?: Unit;
  purchase_price?: number;
  selling_price: number;
  stock_quantity: number;
  low_stock_threshold?: number;         // backend field name
  tax_rate?: number;
  status: ProductStatus;
  created_at?: string;
  updated_at?: string;
}

export interface ProductFormData {
  name: string;
  sku?: string;
  barcode?: string;
  category_id?: number;
  unit_id?: number;
  purchase_price: number;
  selling_price: number;
  stock_quantity: number;
  low_stock_threshold?: number;         // backend field name
  tax_rate?: number;
  status?: ProductStatus;
}

// ── Invoice ──────────────────────────────────────────────────────────────────

export type InvoiceStatus = 'unpaid' | 'partially_paid' | 'paid' | 'cancelled';

export interface InvoiceItem {
  id?: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  tax_rate?: number;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  party_id: number;
  party?: Party;
  invoice_date: string;                 // backend field name
  discount?: number;
  total_amount: number;
  paid_amount: number;
  payment_status: InvoiceStatus;        // backend field name
  notes?: string;
  items?: InvoiceItem[];
  created_at?: string;
}

export interface InvoiceFormData {
  party_id: number;
  invoice_date: string;                 // backend field name
  items: InvoiceItem[];
  discount?: number;
  paid_amount?: number;
  notes?: string;
}

// ── Payment ──────────────────────────────────────────────────────────────────

// Backend PaymentMethod enum values
export type PaymentMethod = 'cash' | 'upi' | 'bank_transfer' | 'cheque' | 'other';

export interface Payment {
  id: number;
  party_id: number;
  party?: Pick<Party, 'id' | 'name'>;
  invoice_id?: number;
  invoice?: Pick<Invoice, 'id' | 'invoice_number'>;
  amount: number;
  payment_date: string;                 // backend field name
  payment_method: PaymentMethod;        // backend field name
  reference_number?: string;
  notes?: string;
  created_at?: string;
}

export interface PaymentFormData {
  party_id: number;
  invoice_id?: number;
  amount: number;
  payment_date: string;                 // backend field name
  payment_method: PaymentMethod;        // backend field name
  reference_number?: string;
  notes?: string;
}

// ── Expense ──────────────────────────────────────────────────────────────────

export interface Expense {
  id: number;
  title: string;
  amount: number;
  expense_date: string;                 // backend field name
  category?: string;
  payment_method?: PaymentMethod;
  reference_number?: string;
  note?: string;                        // backend field name (not notes)
  created_at?: string;
}

export interface ExpenseFormData {
  title: string;
  amount: number;
  expense_date: string;                 // backend field name
  category?: string;
  payment_method?: PaymentMethod;
  reference_number?: string;
  note?: string;                        // backend field name
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export interface LowStockProduct {
  id: number;
  name: string;
  sku?: string;
  stock_quantity: number;
  low_stock_threshold: number;          // backend field name
}

export interface RecentTransaction {
  id: number;
  type: 'debit' | 'credit';
  amount: number;
  transaction_date: string;             // backend field name
  note?: string;
  party?: Pick<Party, 'id' | 'name'>;
}

export interface OutstandingInvoice {
  id: number;
  invoice_number: string;
  party_id: number;
  party?: Pick<Party, 'id' | 'name'>;
  invoice_date: string;
  total_amount: number;
  paid_amount: number;
  payment_status: InvoiceStatus;
}

export interface DashboardStats {
  // Business
  total_receivable: number;
  total_payable: number;
  today_sales: number;
  today_payments: number;
  month_expenses: number;               // backend field name
  low_stock_products: LowStockProduct[];
  outstanding_invoices: OutstandingInvoice[];
  recent_transactions: RecentTransaction[];
  // Personal
  personal_you_owe: number;
  personal_they_owe: number;
  month_personal_expenses: number;
}

// ── API Response Wrappers ────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
}

export interface SelectOption {
  value: string | number;
  label: string;
}
