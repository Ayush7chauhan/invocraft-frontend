# Invocraft – Architecture & Structure

This document describes the **Admin Panel (Shop Owner Panel)**, **Frontend**, **Admin Panel Modules**, and **Backend** structure for the Invocraft – Retail Billing & Khata Management System.

---

## 1. ADMIN PANEL – OVERALL STRUCTURE

The **Admin Panel** (Shop Owner Panel) is the main authenticated area after login. It is a **single-page flow** driven by React state (no URL routing). The overall structure is:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  SPLASH SCREEN (optional)                                                │
│  → Redirect: Home (login) OR Dashboard (if already logged in)             │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  PUBLIC FLOW                                                             │
│  Home (mobile input) → OTP (verify) → SetupShop (first-time only)        │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  ADMIN PANEL (after login)                                               │
│  ┌──────────────┬──────────────────────────────────────────────────────┐ │
│  │   SIDEBAR    │  MAIN CONTENT (one of the screens below)             │ │
│  │   (drawer)   │  • Dashboard (default)                               │ │
│  │   • Home     │  • AddCustomer / PersonalContacts / UnifiedLedger    │ │
│  │   • Customers│  • AddProduct / Categories                           │ │
│  │   • Bills    │  • AddKhataEntry / PersonalExpense / ViewAllTx       │ │
│  │   • Products │  • CreateInvoice / Bills                             │ │
│  │   • Reports  │  • Reports / Settings                               │ │
│  │   • Settings │                                                      │ │
│  └──────────────┴──────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

- **Entry:** `App.tsx` holds a single `screen` state; changing `screen` swaps the full-page view.
- **Layout:** Only the **Dashboard** screen has the **Sidebar + main content** layout. Other screens are full-page with a back button to return to Dashboard.
- **Navigation:** `Dashboard` receives `onNavigate(page, options?)` from `App` and passes it to `Sidebar`. Clicking a menu item calls `onNavigate` and `App` sets `screen` (and optional flags like `openForm`, `reportView`).
- **Auth:** Token stored in `localStorage` as `auth_token`; sent as `Authorization: Bearer <token>` on every API request. 401 clears token.
- **Theme:** Dark/light mode via `useTheme` and `html.dark` class; persisted in `localStorage` as `theme`.

---

## 2. FRONTEND STRUCTURE (React + TypeScript + Tailwind)

### 2.1 Tech Stack

| Technology | Version / usage |
|------------|------------------|
| **React** | 19.x |
| **TypeScript** | ~5.9 |
| **Vite** | 7.x (build tool) |
| **Tailwind CSS** | 4.x (`@tailwindcss/vite`) |
| **Axios** | 1.x (HTTP client) |
| **Lucide React** | Icons |
| **Recharts** | Charts (Reports) |
| **jsPDF / html2canvas** | PDF export |
| **xlsx** | Excel export |

### 2.2 Directory Structure

```
frontend/
├── index.html
├── package.json
├── vite.config.ts          # Vite + React + Tailwind; path alias "@" → src
├── tsconfig.json
├── tsconfig.app.json
├── src/
│   ├── main.tsx            # Theme init (dark/light), React root
│   ├── App.tsx             # Screen state, routing logic, all page composition
│   ├── App.css
│   ├── index.css           # Tailwind import; dark mode (html.dark)
│   │
│   ├── components/
│   │   ├── Sidebar.tsx     # Drawer menu (Home, Customers, Bills, Products, Reports, Settings)
│   │   ├── Footer.tsx
│   │   ├── QuickActionModal.tsx
│   │   ├── LogoutModal.tsx
│   │   ├── DeleteConfirmModal.tsx
│   │   └── ui/
│   │       ├── card.tsx
│   │       ├── autocomplete.tsx
│   │       ├── select.tsx
│   │       └── datepicker.tsx
│   │
│   ├── pages/
│   │   ├── SplashScreen.tsx
│   │   ├── Home.tsx        # Mobile input, send OTP
│   │   ├── auth/
│   │   │   ├── OTP.tsx     # Verify / resend OTP
│   │   │   └── Login.tsx
│   │   ├── SetupShop.tsx   # First-time shop profile
│   │   ├── Dashboard.tsx   # Main panel: sidebar + cards, quick actions
│   │   ├── AddCustomer.tsx # Parties (business): list, add, edit, delete, view ledger
│   │   ├── PersonalContacts.tsx
│   │   ├── UnifiedLedger.tsx   # Ledger for one party or personal contact
│   │   ├── AddProduct.tsx
│   │   ├── Categories.tsx
│   │   ├── AddKhataEntry.tsx   # Add business khata entry
│   │   ├── PersonalExpense.tsx
│   │   ├── ViewAllTransactions.tsx  # Khata book (all transactions)
│   │   ├── CreateInvoice.tsx
│   │   ├── Bills.tsx       # List invoices
│   │   ├── Reports.tsx     # Summary, filter, charts
│   │   ├── Settings.tsx    # Shop details, theme, logout
│   │   └── PersonalLedger.tsx
│   │
│   ├── hooks/
│   │   └── useTheme.ts     # Dark/light toggle, persist
│   │
│   ├── utils/
│   │   └── api.ts          # Axios instance: baseURL, Bearer token, 401 logout
│   │
│   └── lib/
│       └── utils.ts
```

### 2.3 Key Configuration

- **API base URL:** `import.meta.env.VITE_API_URL` or fallback `http://10.187.157.230:8000/api/`.
- **Path alias:** `@` → `./src` (in `vite.config.ts`).
- **Tailwind:** v4 with `@tailwindcss/vite`; dark mode via `.dark` class on `html`.

---

## 3. ADMIN PANEL MODULES

Modules are defined by the **Sidebar** menu and the **screens** in `App.tsx`. Each module maps to one or more pages and API endpoints.

| Module | Menu (Sidebar) | Screen(s) | Brief description |
|--------|----------------|-----------|--------------------|
| **Home** | Home | `view-all-transactions`, `personal-expense`, `personal-contacts` | Khata Book, Personal Expenses & Purchases, Personal Contacts |
| **Customers** | Customers | `add-customer` | Customers All, Add Customers (parties: business) |
| **Bills** | Bills | `bills`, `create-invoice` | Bills & Invoices list, Create Invoice |
| **Products** | Products | `add-product`, `categories` | Products All, Add Products, Categories All, Add Categories |
| **Reports** | Reports | `reports` | Reports All, Reports Filter, Reports Chart |
| **Settings** | (in Sidebar footer) | `settings` | Shop profile, theme, logout |

### 3.1 Module vs screen mapping

| Module | Sub-items | Screen | Options |
|--------|-----------|--------|---------|
| Home | Khata Book | `view-all-transactions` | — |
| Home | Personal Expenses & Purchases | `personal-expense` | — |
| Home | Personal Contacts | `personal-contacts` | — |
| Customers | Customers All | `add-customer` | — |
| Customers | Add Customers | `add-customer` | `openForm: true` |
| Bills | Bills & Invoices | `bills` | — |
| Bills | Create Invoice | `create-invoice` | — |
| Products | Products All | `add-product` | — |
| Products | Add Products | `add-product` | `openForm: true` |
| Products | Categories All | `categories` | — |
| Products | Add Categories | `categories` | `openForm: true` |
| Reports | Reports All | `reports` | — |
| Reports | Reports Filter | `reports` | `reportView: "filter"` |
| Reports | Reports Chart | `reports` | `reportView: "chart"` |

### 3.2 Dashboard quick actions

From **Dashboard**, quick actions can open:

- Add Customer (with form open)
- Add Product (with form open, optional low-stock filter)
- Add Category (with form open)
- Create Invoice
- Add Khata Entry
- Reports (all / filter / chart)

These set the same `screen` and options as the Sidebar.

### 3.3 Data flow per module

- **Parties (Customers):** `AddCustomer` → API: `GET/POST/PUT/DELETE /parties`, `GET /parties/:id` (balance).
- **Personal contacts:** `PersonalContacts` → `GET/POST/PUT/DELETE /personal-contacts`.
- **Ledger:** `UnifiedLedger` (business or personal) → `GET/POST/PUT/DELETE /transactions` or `/personal-transactions`.
- **Products:** `AddProduct` → `GET/POST/PUT/DELETE /products`; `Categories` → `GET/POST/DELETE /categories`.
- **Invoices:** `CreateInvoice` → `GET /parties`, `GET /products`, `POST /invoices`; `Bills` → `GET /invoices`, `GET /invoices/:id`.
- **Khata entries:** `AddKhataEntry` → `GET /transactions`, `GET /parties`, `POST /transactions`.
- **Personal expenses:** `PersonalExpense` → `GET/POST/PUT/DELETE /personal-expenses`.
- **Reports:** `Reports` → `GET /reports/summary`, `GET /reports/range`, `GET /reports/chart`, plus `GET /invoices`, `GET /transactions`, etc.
- **Settings:** `Settings` → `POST /update-shop-details`.
- **Auth:** `Home` → `POST /send-otp`; `OTP` → `POST /verify-otp`, `POST /resend-otp`; `SplashScreen` → `POST /verify-token`; `SetupShop` → `POST /update-shop-details`.

---

## 4. BACKEND STRUCTURE (Laravel)

The frontend expects a **Laravel** API at `VITE_API_URL` (default `http://10.187.157.230:8000/api/`). The following structure is the **expected/typical** layout and the **API surface** used by the frontend.

### 4.1 Expected directory layout

```
backend/   (Laravel project root)
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Api/
│   │   │   │   ├── AuthController.php      # send-otp, verify-otp, resend-otp, verify-token
│   │   │   │   ├── DashboardController.php # dashboard stats
│   │   │   │   ├── PartyController.php     # parties (CRUD + balance)
│   │   │   │   ├── ProductController.php   # products CRUD
│   │   │   │   ├── CategoryController.php # categories
│   │   │   │   ├── InvoiceController.php  # invoices CRUD
│   │   │   │   ├── TransactionController.php
│   │   │   │   ├── PaymentController.php   # if separate from invoices
│   │   │   │   ├── PersonalContactController.php
│   │   │   │   ├── PersonalTransactionController.php
│   │   │   │   ├── PersonalExpenseController.php
│   │   │   │   ├── ReportController.php    # summary, range, chart
│   │   │   │   └── ShopDetailsController.php # update-shop-details
│   │   │   └── ...
│   │   └── Middleware/
│   │       └── (e.g. auth:sanctum for API)
│   ├── Models/
│   │   ├── User.php
│   │   ├── Party.php
│   │   ├── Product.php
│   │   ├── Category.php
│   │   ├── Invoice.php
│   │   ├── InvoiceItem.php
│   │   ├── Transaction.php
│   │   ├── Payment.php
│   │   ├── PersonalContact.php
│   │   ├── PersonalTransaction.php
│   │   ├── PersonalExpense.php
│   │   └── ...
│   └── ...
├── config/
├── database/migrations/
├── routes/
│   └── api.php             # All API routes under /api
└── ...
```

### 4.2 API endpoints used by the frontend

All below are relative to base URL `.../api/`. Auth: `Authorization: Bearer <token>`.

| Method | Endpoint | Used by | Purpose |
|--------|----------|---------|---------|
| POST | `/send-otp` | Home | Send OTP to mobile |
| POST | `/verify-otp` | OTP | Verify OTP, return token + registration flag |
| POST | `/resend-otp` | OTP | Resend OTP |
| POST | `/verify-token` | SplashScreen | Validate token, auto-login |
| POST | `/update-shop-details` | SetupShop, Settings | Create/update shop profile |
| GET | `/dashboard` | Dashboard | Summary stats (parties, products, invoices, etc.) |
| GET | `/parties` | AddCustomer, CreateInvoice, AddKhataEntry, Reports | List parties (optional `type=customer`) |
| GET | `/parties/:id` | AddCustomer, UnifiedLedger | Single party + balance |
| POST | `/parties` | AddCustomer | Create party |
| PUT | `/parties/:id` | AddCustomer | Update party |
| DELETE | `/parties/:id` | AddCustomer | Delete party |
| GET | `/products` | AddProduct, CreateInvoice, Reports | List products |
| POST | `/products` | AddProduct | Create product |
| PUT | `/products/:id` | AddProduct | Update product |
| DELETE | `/products/:id` | AddProduct | Delete product |
| GET | `/categories` | AddProduct, Categories | List categories |
| POST | `/categories` | Categories | Create category |
| DELETE | `/categories/:id` | Categories | Delete category |
| GET | `/invoices` | Bills, Reports | List invoices (pagination, params) |
| GET | `/invoices/:id` | Bills | Single invoice (detail) |
| POST | `/invoices` | CreateInvoice | Create invoice (with items) |
| GET | `/transactions` | AddKhataEntry, ViewAllTransactions, Reports, UnifiedLedger | List business transactions |
| POST | `/transactions` | AddKhataEntry, UnifiedLedger | Create transaction |
| PUT | `/transactions/:id` | UnifiedLedger | Update transaction |
| DELETE | `/transactions/:id` | UnifiedLedger | Delete transaction |
| GET | `/personal-contacts` | PersonalContacts | List personal contacts |
| GET | `/personal-contacts/:id` | UnifiedLedger | Single contact |
| POST | `/personal-contacts` | PersonalContacts | Create contact |
| PUT | `/personal-contacts/:id` | PersonalContacts | Update contact |
| DELETE | `/personal-contacts/:id` | PersonalContacts | Delete contact |
| GET | `/personal-transactions` | ViewAllTransactions, UnifiedLedger, PersonalLedger | List (params: contact, date range) |
| POST | `/personal-transactions` | UnifiedLedger | Create |
| PUT | `/personal-transactions/:id` | UnifiedLedger | Update |
| DELETE | `/personal-transactions/:id` | UnifiedLedger | Delete |
| GET | `/personal-expenses` | PersonalExpense | List |
| POST | `/personal-expenses` | PersonalExpense | Create |
| PUT | `/personal-expenses/:id` | PersonalExpense | Update |
| DELETE | `/personal-expenses/:id` | PersonalExpense | Delete |
| GET | `/reports/summary` | Reports | Dashboard summary |
| GET | `/reports/range` | Reports | Metrics for date range |
| GET | `/reports/chart` | Reports | Chart data for date range |

### 4.3 Response convention

The frontend often expects:

- `{ success: true, data: ... }` for success.
- List endpoints: `data` as array or paginated object (e.g. `data` array + optional `meta`).
- Errors: 4xx/5xx with optional `message` in response body; 401 triggers logout (token removed).

### 4.4 Auth

- Token (e.g. Laravel Sanctum) returned on `verify-otp` (and possibly after `update-shop-details` on first registration).
- Stored in `localStorage` as `auth_token`.
- Sent as `Authorization: Bearer <token>`; 401 → clear token and redirect to login (Home).

---

## Summary

| Area | Summary |
|------|---------|
| **Admin Panel** | Single-state SPA: Splash → Home/OTP/SetupShop → Dashboard with Sidebar; all other screens are full-page with back to Dashboard. |
| **Frontend** | React 19 + TypeScript + Vite + Tailwind 4; `src/` with `components`, `pages`, `hooks`, `utils`, `lib`; one axios instance in `utils/api.ts`. |
| **Admin Modules** | Home (Khata, Personal Expenses, Personal Contacts), Customers, Bills, Products, Reports, Settings; each maps to specific screens and API calls. |
| **Backend** | Laravel API under `/api/`; REST endpoints for auth, dashboard, parties, products, categories, invoices, transactions, personal contacts/transactions/expenses, reports, shop details. |

For more on **database tables and columns**, see the project’s **Data Dictionary** and **List of Tables** (e.g. in the docs folder).
