import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";

// Lazy Load Pages
const SplashScreen = lazy(() => import("../pages/SplashScreen"));
const Home = lazy(() => import("../pages/Home"));
const OTP = lazy(() => import("../pages/auth/OTP"));
const SetupShop = lazy(() => import("../pages/SetupShop"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const AddCustomer = lazy(() => import("../pages/AddCustomer"));
const PersonalContacts = lazy(() => import("../pages/PersonalContacts"));
const UnifiedLedger = lazy(() => import("../pages/UnifiedLedger"));
const AddProduct = lazy(() => import("../pages/AddProduct"));
const Categories = lazy(() => import("../pages/Categories"));
const AddKhataEntry = lazy(() => import("../pages/AddKhataEntry"));
const PersonalExpense = lazy(() => import("../pages/PersonalExpense"));
const ViewAllTransactions = lazy(() => import("../pages/ViewAllTransactions"));
const CreateInvoice = lazy(() => import("../pages/CreateInvoice"));
const Reports = lazy(() => import("../pages/Reports"));
const Settings = lazy(() => import("../pages/Settings"));
const Bills = lazy(() => import("../pages/Bills"));

const NotFound = lazy(() => import("../pages/NotFound"));

// ... (keep page loader setup)
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-500 dark:text-gray-400 font-medium">Loading Page...</p>
    </div>
  </div>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Suspense fallback={<PageLoader />}>
        <SplashScreen />
      </Suspense>
    ),
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: (
          <Suspense fallback={<PageLoader />}>
            <Home />
          </Suspense>
        ),
      },
      {
        path: "otp",
        element: (
          <Suspense fallback={<PageLoader />}>
            <OTP />
          </Suspense>
        ),
      },
      {
        path: "setup",
        element: (
          <Suspense fallback={<PageLoader />}>
            <SetupShop />
          </Suspense>
        ),
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            path: "dashboard",
            element: (
              <Suspense fallback={<PageLoader />}>
                <Dashboard />
              </Suspense>
            ),
          },
          {
            path: "parties/new",
            element: (
              <Suspense fallback={<PageLoader />}>
                <AddCustomer />
              </Suspense>
            ),
          },
          {
            path: "personal/contacts",
            element: (
              <Suspense fallback={<PageLoader />}>
                <PersonalContacts />
              </Suspense>
            ),
          },
          {
            path: "products/new",
            element: (
              <Suspense fallback={<PageLoader />}>
                <AddProduct />
              </Suspense>
            ),
          },
          {
            path: "products/categories",
            element: (
              <Suspense fallback={<PageLoader />}>
                <Categories />
              </Suspense>
            ),
          },
          {
            path: "khata-book/entry",
            element: (
              <Suspense fallback={<PageLoader />}>
                <AddKhataEntry />
              </Suspense>
            ),
          },
          {
            path: "personal/expenses",
            element: (
              <Suspense fallback={<PageLoader />}>
                <PersonalExpense />
              </Suspense>
            ),
          },
          {
            path: "khata-book/transactions",
            element: (
              <Suspense fallback={<PageLoader />}>
                <ViewAllTransactions />
              </Suspense>
            ),
          },
          {
            path: "reports",
            element: (
              <Suspense fallback={<PageLoader />}>
                <Reports />
              </Suspense>
            ),
          },
          {
            path: "settings",
            element: (
              <Suspense fallback={<PageLoader />}>
                <Settings />
              </Suspense>
            ),
          },
          {
            path: "bills",
            element: (
              <Suspense fallback={<PageLoader />}>
                <Bills />
              </Suspense>
            ),
          },
          {
            path: "ledger/:id",
            element: (
              <Suspense fallback={<PageLoader />}>
                <UnifiedLedger />
              </Suspense>
            ),
          },
          {
            path: "bills/create",
            element: (
              <Suspense fallback={<PageLoader />}>
                <CreateInvoice />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: (
      <Suspense fallback={<PageLoader />}>
        <NotFound />
      </Suspense>
    ),
  },
]);

export default router;
