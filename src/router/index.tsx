/**
 * Application router — React Router v7
 *
 * Architecture:
 * - Public routes: splash, login, otp, setup-shop
 * - Protected routes: wrapped in AppLayout (sidebar + header)
 * - Auth behavior is UNCHANGED:
 *     Existing user → OTP → Dashboard
 *     New user → OTP → Setup Shop → Dashboard
 */

import {
  createBrowserRouter,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';

import ProtectedRoute from '@/components/ProtectedRoute';
import AppLayout from '@/components/layout/AppLayout';

// ── Auth pages (kept exactly as-is per requirement) ───────────────────────────
import SplashScreen from '@/pages/SplashScreen';
import Home from '@/pages/Home';
import OTP from '@/pages/auth/OTP';
import SetupShop from '@/pages/SetupShop';

// ── Legal pages ───────────────────────────────────────────────────────────────
import TermsPage   from '@/pages/legal/TermsPage';
import PrivacyPage from '@/pages/legal/PrivacyPage';

// ── New feature pages ─────────────────────────────────────────────────────────
import DashboardPage from '@/features/dashboard/DashboardPage';
import PartiesPage from '@/features/parties/PartiesPage';
import ProductsPage from '@/features/products/ProductsPage';
import CategoriesPage from '@/features/categories/CategoriesPage';
import UnitsPage from '@/features/units/UnitsPage';
import InvoicesPage from '@/features/invoices/InvoicesPage';
import CreateInvoicePage from '@/features/invoices/CreateInvoicePage';
import ViewInvoicePage from '@/features/invoices/ViewInvoicePage';
import PaymentsPage from '@/features/payments/PaymentsPage';
import ExpensesPage from '@/features/expenses/ExpensesPage';
import SettingsPage from '@/features/settings/SettingsPage';

// ── Legacy pages still in use ─────────────────────────────────────────────────
import UnifiedLedger from '@/pages/UnifiedLedger';
import AddKhataEntry from '@/pages/AddKhataEntry';
import ViewAllTransactions from '@/pages/ViewAllTransactions';
import Reports from '@/pages/Reports';

// ── Route adapters for auth pages (bridge old prop API → router hooks) ────────

function SplashRoute() {
  const navigate = useNavigate();
  return (
    <SplashScreen
      onComplete={(redirectTo) =>
        navigate(redirectTo === 'dashboard' ? '/dashboard' : '/login', {
          replace: true,
        })
      }
    />
  );
}

function LoginRoute() {
  const navigate = useNavigate();
  return (
    <Home
      onSubmit={(mobile) =>
        navigate('/login/otp', { state: { mobile } })
      }
    />
  );
}

function OTPRoute() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const mobile: string = (state as { mobile?: string } | null)?.mobile ?? '';

  return (
    <OTP
      mobile={mobile}
      onBack={() => navigate('/login', { replace: true })}
      onVerify={(requiresRegistration) => {
        if (requiresRegistration) {
          navigate('/setup', { state: { mobile }, replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      }}
    />
  );
}

function SetupShopRoute() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const mobile: string =
    (state as { mobile?: string } | null)?.mobile ??
    localStorage.getItem('temp_mobile') ??
    '';

  return (
    <SetupShop
      mobile={mobile}
      onContinue={() => navigate('/dashboard', { replace: true })}
    />
  );
}

// ── Route adapters for legacy pages ──────────────────────────────────────────

function UnifiedLedgerRoute() {
  const navigate = useNavigate();
  const { type, id } = useParams<{ type: string; id: string }>();
  const { state } = useLocation();
  const name: string = (state as { name?: string } | null)?.name ?? '';
  const contactType = type === 'personal' ? 'personal' : 'business';

  return (
    <UnifiedLedger
      contactId={Number(id)}
      contactName={name}
      contactType={contactType}
      onBack={() =>
        navigate(contactType === 'personal' ? '/expenses' : '/customers')
      }
    />
  );
}

function AddKhataRoute() {
  const navigate = useNavigate();
  return (
    <AddKhataEntry
      onBack={() => navigate('/dashboard')}
    />
  );
}

function TransactionsRoute() {
  const navigate = useNavigate();
  return <ViewAllTransactions onBack={() => navigate('/dashboard')} />;
}

function ReportsRoute() {
  const navigate = useNavigate();
  return (
    <Reports
      initialView="all"
      onBack={() => navigate('/dashboard')}
    />
  );
}

// ── Router definition ─────────────────────────────────────────────────────────

const router = createBrowserRouter([
  // Root → Splash
  { path: '/', element: <Navigate to="/splash" replace /> },

  // Public routes (no layout)
  { path: '/splash',     element: <SplashRoute /> },
  { path: '/login',      element: <LoginRoute /> },
  { path: '/login/otp',  element: <OTPRoute /> },
  { path: '/setup',      element: <SetupShopRoute /> },
  { path: '/terms',      element: <TermsPage /> },
  { path: '/privacy',    element: <PrivacyPage /> },

  // Protected routes — ProtectedRoute checks token+user, AppLayout provides UI shell
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },

          // Parties
          { path: '/customers', element: <PartiesPage partyType="customer" /> },
          { path: '/suppliers', element: <PartiesPage partyType="supplier" /> },
          { path: '/parties', element: <PartiesPage /> },

          // Ledger
          { path: '/ledger/:type/:id', element: <UnifiedLedgerRoute /> },

          // Inventory
          { path: '/products', element: <ProductsPage /> },
          { path: '/categories', element: <CategoriesPage /> },
          { path: '/units', element: <UnitsPage /> },

          // Invoices
          { path: '/invoices', element: <InvoicesPage /> },
          { path: '/invoices/create', element: <CreateInvoicePage /> },
          { path: '/invoices/:id', element: <ViewInvoicePage /> },

          // Payments
          { path: '/payments', element: <PaymentsPage /> },

          // Expenses
          { path: '/expenses', element: <ExpensesPage /> },

          // Khata + Transactions
          { path: '/khata', element: <AddKhataRoute /> },
          { path: '/transactions', element: <TransactionsRoute /> },

          // Reports
          { path: '/reports', element: <ReportsRoute /> },

          // Settings
          { path: '/settings', element: <SettingsPage /> },
        ],
      },
    ],
  },

  // Catch-all
  { path: '*', element: <Navigate to="/splash" replace /> },
]);

export default router;
