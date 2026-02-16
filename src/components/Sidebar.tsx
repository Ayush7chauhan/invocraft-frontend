import {
  Home,
  Users,
  BarChart3,
  Settings,
  X,
  Receipt,
  Package,
  LogOut,
  Plus,
  Minus,
} from "lucide-react";
import { useState } from "react";
import { useTheme } from "../hooks/useTheme";
import LogoutModal from "./LogoutModal";

type NavOptions = {
  openForm?: boolean;
  reportView?: "all" | "filter" | "chart";
};

type SubItem = {
  id: string;
  label: string;
  page: string;
  options?: NavOptions;
};

type MenuSection = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children: SubItem[];
};

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  currentPage?: string;
  onNavigate?: (page: string, options?: NavOptions) => void;
};

const MENU_SECTIONS: MenuSection[] = [
  {
    id: "home",
    label: "Home",
    icon: Home,
    children: [
      { id: "khata-book", label: "Khata Book", page: "view-all-transactions" },
      { id: "personal-expenses", label: "Personal Expenses & Purchases", page: "personal-expense" },
      { id: "personal-contacts", label: "Personal Contacts", page: "personal-contacts" },
    ],
  },
  {
    id: "customers",
    label: "Customers",
    icon: Users,
    children: [
      { id: "customers-all", label: "Customers All", page: "add-customer" },
      { id: "add-customers", label: "Add Customers", page: "add-customer", options: { openForm: true } },
    ],
  },
  {
    id: "bills",
    label: "Bills",
    icon: Receipt,
    children: [
      { id: "bills-invoices", label: "Bills & Invoices", page: "bills" },
      { id: "create-invoice", label: "Create Invoice", page: "create-invoice" },
    ],
  },
  {
    id: "products",
    label: "Products",
    icon: Package,
    children: [
      { id: "products-all", label: "Products All", page: "add-product" },
      { id: "add-products", label: "Add Products", page: "add-product", options: { openForm: true } },
      { id: "categories-all", label: "Categories All", page: "categories" },
      { id: "add-categories", label: "Add Categories", page: "categories", options: { openForm: true } },
    ],
  },
  {
    id: "reports",
    label: "Reports",
    icon: BarChart3,
    children: [
      { id: "reports-all", label: "Reports All", page: "reports" },
      { id: "reports-filter", label: "Reports Filter", page: "reports", options: { reportView: "filter" } },
      { id: "reports-chart", label: "Reports Chart", page: "reports", options: { reportView: "chart" } },
    ],
  },
];

export default function Sidebar({ isOpen, onClose, currentPage = "home", onNavigate }: SidebarProps) {
  const { isDarkMode, toggleTheme } = useTheme();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isPageActive = (page: string) => currentPage === page;
  const isSubItemActive = (sub: SubItem) => isPageActive(sub.page);

  const handleLogout = () => setShowLogoutModal(true);
  const confirmLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("auth_token");
    localStorage.removeItem("temp_user");
    localStorage.removeItem("temp_mobile");
    setShowLogoutModal(false);
    setTimeout(() => { window.location.href = "/"; }, 300);
  };

  return (
    <>
      <LogoutModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} onConfirm={confirmLogout} />
      <div
        className={`fixed inset-0 bg-black/50 dark:bg-black/70 z-40 transition-opacity duration-500 ease-in-out ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white dark:bg-gray-800 shadow-xl z-50 transform transition-transform duration-500 ease-in-out rounded-r-3xl ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Invocraft" className="w-10 h-10 rounded-xl object-cover shrink-0" />
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">Invocraft</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          {/* Dark Mode Toggle */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
            >
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {isDarkMode ? "Dark Mode" : "Light Mode"}
              </span>
              <div className="relative w-12 h-6 rounded-full bg-gray-300 dark:bg-gray-600">
                <div
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${
                    isDarkMode ? "translate-x-6" : "translate-x-0.5"
                  }`}
                />
              </div>
            </button>
          </div>

          {/* Nested Menu - only main options visible; sub-options open on plus click */}
          <nav className="flex-1 overflow-y-auto p-3">
            {MENU_SECTIONS.map((section) => {
              const Icon = section.icon;
              const isExpanded = expandedIds.has(section.id);
              return (
                <div key={section.id} className="mb-1">
                  <div className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className="w-5 h-5 shrink-0" />
                      <span className="text-sm font-semibold truncate">{section.label}</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => toggleExpand(e, section.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-[#22C55E] dark:text-green-400 hover:bg-[#22C55E]/10 dark:hover:bg-green-600/20 transition-colors"
                      aria-label={isExpanded ? "Collapse" : "Expand"}
                    >
                      {isExpanded ? (
                        <Minus className="w-4 h-4" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {isExpanded && (
                    <div className="ml-4 mt-0.5 pl-3 border-l-2 border-gray-200 dark:border-gray-600 space-y-0.5">
                      {section.children.map((sub) => {
                        const active = isSubItemActive(sub);
                        return (
                          <button
                            key={sub.id}
                            onClick={() => {
                              if (onNavigate) onNavigate(sub.page, sub.options);
                              onClose();
                            }}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                              active
                                ? "bg-[#22C55E] dark:bg-green-600 text-white"
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                            }`}
                          >
                            {sub.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Settings (no sub-items) */}
            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  if (onNavigate) onNavigate("settings");
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                  currentPage === "settings"
                    ? "bg-[#22C55E] dark:bg-green-600 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <Settings className="w-5 h-5" />
                <span className="text-sm font-semibold">Settings</span>
              </button>
            </div>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
