/** All backend API endpoint paths — single source of truth */
export const API = {
  // Auth
  AUTH: {
    SEND_OTP: '/send-otp',
    RESEND_OTP: '/resend-otp',
    VERIFY_OTP: '/verify-otp',
    VERIFY_TOKEN: '/verify-token',
    LOGOUT: '/logout',
    UPDATE_SHOP: '/update-shop',
  },

  // Dashboard
  DASHBOARD: '/dashboard',

  // Parties
  PARTIES: {
    LIST: '/parties',
    CREATE: '/parties',
    UPDATE: (id: number) => `/parties/${id}`,
    DELETE: (id: number) => `/parties/${id}`,
    SHOW: (id: number) => `/parties/${id}`,
    LEDGER: (id: number) => `/parties/${id}/ledger`,
  },

  // Products
  PRODUCTS: {
    LIST: '/products',
    CREATE: '/products',
    UPDATE: (id: number) => `/products/${id}`,
    DELETE: (id: number) => `/products/${id}`,
    SHOW: (id: number) => `/products/${id}`,
  },

  // Categories
  CATEGORIES: {
    LIST: '/categories',
    CREATE: '/categories',
    UPDATE: (id: number) => `/categories/${id}`,
    DELETE: (id: number) => `/categories/${id}`,
  },

  // Units
  UNITS: {
    LIST: '/units',
    CREATE: '/units',
    UPDATE: (id: number) => `/units/${id}`,
    DELETE: (id: number) => `/units/${id}`,
  },

  // Invoices
  INVOICES: {
    LIST: '/invoices',
    CREATE: '/invoices',
    UPDATE: (id: number) => `/invoices/${id}`,
    DELETE: (id: number) => `/invoices/${id}`,
    SHOW: (id: number) => `/invoices/${id}`,
  },

  // Payments
  PAYMENTS: {
    LIST: '/payments',
    CREATE: '/payments',
    UPDATE: (id: number) => `/payments/${id}`,
    DELETE: (id: number) => `/payments/${id}`,
    PARTY_PAYMENTS: (partyId: number) => `/parties/${partyId}/payments`,
  },

  // Expenses
  EXPENSES: {
    LIST: '/expenses',
    CREATE: '/expenses',
    UPDATE: (id: number) => `/expenses/${id}`,
    DELETE: (id: number) => `/expenses/${id}`,
  },

  // Settings
  SETTINGS: {
    GET: '/settings',
    UPDATE: '/settings',
    UPDATE_PROFILE: '/profile',
  },

  // Reports
  REPORTS: {
    SALES: '/reports/sales',
    EXPENSES: '/reports/expenses',
    LEDGER: '/reports/ledger',
  },

  // Transactions (Khata)
  TRANSACTIONS: {
    LIST: '/transactions',
    PERSONAL: '/personal-transactions',
  },
} as const;
