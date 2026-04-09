/** All application route paths — single source of truth */
export const ROUTES = {
  // Public
  SPLASH: '/splash',
  LOGIN: '/login',
  OTP: '/login/otp',
  SETUP_SHOP: '/setup',

  // Protected
  DASHBOARD: '/dashboard',

  // Parties
  CUSTOMERS: '/customers',
  SUPPLIERS: '/suppliers',
  PARTIES: '/parties',

  // Products
  PRODUCTS: '/products',
  CATEGORIES: '/categories',
  UNITS: '/units',

  // Invoices
  INVOICES: '/invoices',
  INVOICES_CREATE: '/invoices/create',
  INVOICES_EDIT: (id: number | string) => `/invoices/${id}/edit`,
  INVOICES_VIEW: (id: number | string) => `/invoices/${id}`,

  // Payments
  PAYMENTS: '/payments',

  // Expenses
  EXPENSES: '/expenses',

  // Ledger
  LEDGER: (type: string, id: number | string) => `/ledger/${type}/${id}`,

  // Khata
  KHATA: '/khata',
  TRANSACTIONS: '/transactions',

  // Reports
  REPORTS: '/reports',

  // Settings
  SETTINGS: '/settings',
} as const;
