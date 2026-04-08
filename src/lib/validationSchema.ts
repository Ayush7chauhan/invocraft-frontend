import { z } from "zod";

// --- Product Validation ---
export const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  brand: z.string().optional(),
  categoryId: z.string().min(1, "Category is required").or(z.number().min(1, "Category is required")),
  unit: z.string().min(1, "Unit is required"),
  purchasePrice: z.coerce.number().min(0, "Purchase price must be positive"),
  sellingPrice: z.coerce.number().min(0.01, "Selling price must be greater than 0"),
  discount: z.coerce.number().min(0).max(100).optional().default(0),
  taxRate: z.coerce.number().min(0, "Tax rate cannot be negative").max(100, "Tax max 100%"),
  stockQuantity: z.coerce.number().int("Stock must be a whole number").min(0, "Stock cannot be negative"),
  lowStockAlert: z.coerce.number().int("Must be whole number").min(0, "Cannot be negative").optional(),
  description: z.string().max(500, "Max 500 characters").optional(),
  status: z.enum(["active", "inactive"]).default("active"),
});

export type ProductFormValues = z.infer<typeof productSchema>;

// --- Party / Customer Validation ---
export const partySchema = z.object({
  name: z.string().min(1, "Name is required"),
  mobile: z.string()
    .regex(/^\+?[0-9]*$/, "Invalid mobile format").optional().or(z.literal("")),
  address: z.string().optional(),
  gstNumber: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GST Number").or(z.literal("")).optional(),
  type: z.enum(["customer", "supplier", "both"]),
  openingBalance: z.coerce.number().default(0),
  balanceType: z.enum(["To Receive", "To Pay"]).default("To Receive"),
  status: z.enum(["active", "inactive"]).default("active"),
});

export type PartyFormValues = z.infer<typeof partySchema>;

// --- Khata Entry Validation ---
export const khataEntrySchema = z.object({
  partyId: z.string().min(1, "Party is required").or(z.number().min(1, "Party is required")),
  type: z.enum(["credit", "debit"]),
  amount: z.coerce.number().min(1, "Amount must be greater than 0"),
  date: z.string().min(1, "Date is required"),
  notes: z.string().max(300, "Notes too long").optional(),
});

export type KhataEntryFormValues = z.infer<typeof khataEntrySchema>;

// --- Category Validation ---
export const categorySchema = z.object({
  name: z.string().trim().min(1, "Category name is required").max(50, "Name too long"),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

// --- Invoice Validation ---
export const invoiceItemSchema = z.object({
  productId: z.coerce.number().min(1, "Select a product"),
  name: z.string(),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.coerce.number().min(0, "Price must be positive"),
  taxRate: z.coerce.number().min(0).max(100).default(0),
});

export const invoiceSchema = z.object({
  partyId: z.coerce.number().min(1, "Party is required"),
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  invoiceDate: z.string().min(1, "Date is required"),
  items: z.array(invoiceItemSchema).min(1, "Add at least one item"),
  notes: z.string().optional(),
  terms: z.string().optional(),
  paymentStatus: z.enum(["paid", "unpaid", "partially_paid"]).default("unpaid"),
  paidAmount: z.coerce.number().min(0).default(0),
});

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;

// --- Personal Expense Validation ---
export const expenseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  date: z.string().min(1, "Date is required"),
  category: z.string().min(1, "Category is required"),
  gstRate: z.coerce.number().min(0).max(100).optional().default(0),
  paymentMethod: z.enum(["cash", "upi", "card", "bank_transfer", "other"]).default("cash"),
  description: z.string().optional(),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
});

export type ExpenseFormValues = z.infer<typeof expenseSchema>;

// --- Personal Contact Validation ---
export const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  mobile: z.string()
    .regex(/^\+?[0-9]*$/, "Invalid mobile format")
    .min(10, "Mobile number must be at least 10 digits")
    .optional()
    .or(z.literal("")),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  address: z.string().optional(),
  relationship: z.enum(["friend", "family", "colleague", "neighbor", "other"]).default("friend"),
  openingBalance: z.coerce.number().default(0),
  status: z.enum(["active", "inactive"]).default("active"),
  notes: z.string().optional(),
});

export type ContactFormValues = z.infer<typeof contactSchema>;

// --- Ledger Transaction Validation ---
export const ledgerTransactionSchema = z.object({
  type: z.enum(["debit", "credit", "given", "received"]),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  date: z.string().min(1, "Date is required"),
  paymentMethod: z.enum(["cash", "upi", "card", "bank_transfer", "other"]).default("cash").optional(),
  referenceNumber: z.string().optional(),
  note: z.string().optional(),
});

export type LedgerTransactionFormValues = z.infer<typeof ledgerTransactionSchema>;
