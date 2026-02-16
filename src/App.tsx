import { useState } from "react";
import SplashScreen from "./pages/SplashScreen";
import Home from "./pages/Home";
import OTP from "./pages/auth/OTP";
import SetupShop from "./pages/SetupShop";
import Dashboard from "./pages/Dashboard";
import AddCustomer from "./pages/AddCustomer";
import PersonalContacts from "./pages/PersonalContacts";
import UnifiedLedger from "./pages/UnifiedLedger";
import AddProduct from "./pages/AddProduct";
import Categories from "./pages/Categories";
import AddKhataEntry from "./pages/AddKhataEntry";
import PersonalExpense from "./pages/PersonalExpense";
import ViewAllTransactions from "./pages/ViewAllTransactions";
import CreateInvoice from "./pages/CreateInvoice";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Bills from "./pages/Bills";

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [screen, setScreen] = useState<
    "home" | "otp" | "setup" | "dashboard" | "add-customer" | "personal-contacts" | "ledger" | "add-product" | "categories" | "add-khata" | "personal-expense" | "view-all-transactions" | "create-invoice" | "reports" | "settings" | "bills"
  >("home");
  const [mobile, setMobile] = useState("");
  const [ledgerData, setLedgerData] = useState<{ id: number; name: string; type: "personal" | "business" } | null>(null);
  const [openProductsWithLowStockOnly, setOpenProductsWithLowStockOnly] = useState(false);
  const [openCustomerForm, setOpenCustomerForm] = useState(false);
  const [openProductForm, setOpenProductForm] = useState(false);
  const [openCategoriesForm, setOpenCategoriesForm] = useState(false);
  const [reportsView, setReportsView] = useState<"all" | "filter" | "chart">("all");

  const handleSplashComplete = (redirectTo: "home" | "dashboard") => {
    setShowSplash(false);
    if (redirectTo === "dashboard") {
      setScreen("dashboard");
    } else {
      setScreen("home");
    }
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  if (screen === "otp") {
    return (
      <OTP
        mobile={mobile}
        onBack={() => setScreen("home")}
        onVerify={(requiresRegistration) => {
          if (requiresRegistration) {
            // User needs to complete registration
            setScreen("setup");
          } else {
            // User already registered, go directly to dashboard
            setScreen("dashboard");
          }
        }}
      />
    );
  }

  if (screen === "setup") {
    return (
      <SetupShop
        mobile={mobile || localStorage.getItem('temp_mobile') || "+91 9876543210"}
        onContinue={() => setScreen("dashboard")}
      />
    );
  }

  if (screen === "dashboard") {
    return <Dashboard onNavigate={(page, options?) => {
      if (page === "add-customer") {
        setOpenCustomerForm(options?.openForm === true);
        setScreen("add-customer");
      } else if (page === "personal-contacts") {
        setScreen("personal-contacts");
      } else if (page === "add-product") {
        setOpenProductsWithLowStockOnly(options?.openWithLowStock === true);
        setOpenProductForm(options?.openForm === true);
        setScreen("add-product");
      } else if (page === "categories") {
        setOpenCategoriesForm(options?.openForm === true);
        setScreen("categories");
      } else if (page === "add-khata") {
        setScreen("add-khata");
      } else if (page === "personal-expense") {
        setScreen("personal-expense");
      } else if (page === "view-all-transactions") {
        setScreen("view-all-transactions");
      } else if (page === "create-invoice") {
        setScreen("create-invoice");
      } else if (page === "reports") {
        setReportsView(options?.reportView ?? "all");
        setScreen("reports");
      } else if (page === "settings") {
        setScreen("settings");
      } else if (page === "bills") {
        setScreen("bills");
      }
    }} />;
  }

  if (screen === "add-customer") {
    return <AddCustomer
      initialShowForm={openCustomerForm}
      onBack={() => {
        setOpenCustomerForm(false);
        setScreen("dashboard");
        window.dispatchEvent(new CustomEvent('dashboard-refresh'));
      }}
      onViewLedger={(partyId, partyName) => {
        setLedgerData({ id: partyId, name: partyName, type: "business" });
        setScreen("ledger");
      }}
    />;
  }

  if (screen === "add-product") {
    return <AddProduct
      initialShowLowStock={openProductsWithLowStockOnly}
      initialShowForm={openProductForm}
      onBack={() => {
        setOpenProductsWithLowStockOnly(false);
        setOpenProductForm(false);
        setScreen("dashboard");
        window.dispatchEvent(new CustomEvent('dashboard-refresh'));
      }}
    />;
  }

  if (screen === "categories") {
    return <Categories
      initialShowForm={openCategoriesForm}
      onBack={() => {
        setOpenCategoriesForm(false);
        setScreen("dashboard");
        window.dispatchEvent(new CustomEvent('dashboard-refresh'));
      }}
    />;
  }

  if (screen === "add-khata") {
    return <AddKhataEntry onBack={() => {
      setScreen("dashboard");
      window.dispatchEvent(new CustomEvent('dashboard-refresh'));
    }} />;
  }

  if (screen === "personal-contacts") {
    return (
      <PersonalContacts
        onBack={() => {
          setScreen("dashboard");
          // Trigger dashboard refresh
          window.dispatchEvent(new CustomEvent('dashboard-refresh'));
        }}
        onViewLedger={(contactId, contactName) => {
          setLedgerData({ id: contactId, name: contactName, type: "personal" });
          setScreen("ledger");
        }}
      />
    );
  }

  if (screen === "ledger" && ledgerData) {
    return (
      <UnifiedLedger
        contactId={ledgerData.id}
        contactName={ledgerData.name}
        contactType={ledgerData.type}
        onBack={() => {
          if (ledgerData.type === "personal") {
            setScreen("personal-contacts");
          } else {
            setScreen("add-customer");
          }
          window.dispatchEvent(new CustomEvent('dashboard-refresh'));
        }}
      />
    );
  }

  if (screen === "personal-expense") {
    return <PersonalExpense onBack={() => {
      setScreen("dashboard");
      window.dispatchEvent(new CustomEvent('dashboard-refresh'));
    }} />;
  }

  if (screen === "view-all-transactions") {
    return <ViewAllTransactions onBack={() => {
      setScreen("dashboard");
    }} />;
  }

  if (screen === "create-invoice") {
    return (
      <CreateInvoice
        onBack={() => {
          setScreen("dashboard");
          window.dispatchEvent(new CustomEvent('dashboard-refresh'));
        }}
        onGoToBills={() => {
          setScreen("bills");
          window.dispatchEvent(new CustomEvent('dashboard-refresh'));
        }}
        onGoToDashboard={() => {
          setScreen("dashboard");
          window.dispatchEvent(new CustomEvent('dashboard-refresh'));
        }}
      />
    );
  }

  if (screen === "reports") {
    return <Reports
      initialView={reportsView}
      onBack={() => {
        setReportsView("all");
        setScreen("dashboard");
      }}
    />;
  }

  if (screen === "settings") {
    return <Settings onBack={() => {
      setScreen("dashboard");
    }} onLogout={() => {
      setScreen("home");
    }} />;
  }

  if (screen === "bills") {
    return (
      <Bills
        onBack={() => setScreen("dashboard")}
        onCreateInvoice={() => setScreen("create-invoice")}
      />
    );
  }

  return (
    <Home
      onSubmit={(value) => {
        setMobile(value);
        setScreen("otp");
      }}
    />
  );
}

export default App;
