import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Users,
  Package,
  Receipt,
  CreditCard,
  TrendingDown,
  BarChart3,
  Settings,
  X,
  ChevronDown,
  ChevronRight,
  BookOpen,
  LogOut,
  Store,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import Swal from 'sweetalert2';
import { toast } from 'sonner';
import { clearAuthStorage } from '@/lib/utils';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  path?: string;
  children?: NavChild[];
}

interface NavChild {
  id: string;
  label: string;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    path: ROUTES.DASHBOARD,
  },
  {
    id: 'parties',
    label: 'Parties',
    icon: Users,
    children: [
      { id: 'customers', label: 'Customers', path: ROUTES.CUSTOMERS },
      { id: 'suppliers', label: 'Suppliers', path: ROUTES.SUPPLIERS },
    ],
  },
  {
    id: 'invoices',
    label: 'Invoices',
    icon: Receipt,
    children: [
      { id: 'invoices-list', label: 'All Invoices', path: ROUTES.INVOICES },
      {
        id: 'create-invoice',
        label: 'Create Invoice',
        path: ROUTES.INVOICES_CREATE,
      },
    ],
  },
  {
    id: 'payments',
    label: 'Payments',
    icon: CreditCard,
    path: ROUTES.PAYMENTS,
  },
  {
    id: 'expenses',
    label: 'Expenses',
    icon: TrendingDown,
    path: ROUTES.EXPENSES,
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: Package,
    children: [
      { id: 'products', label: 'Products', path: ROUTES.PRODUCTS },
      { id: 'categories', label: 'Categories', path: ROUTES.CATEGORIES },
      { id: 'units', label: 'Units', path: ROUTES.UNITS },
    ],
  },
  {
    id: 'khata',
    label: 'Khata Book',
    icon: BookOpen,
    path: ROUTES.KHATA,
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: BarChart3,
    path: ROUTES.REPORTS,
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    path: ROUTES.SETTINGS,
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { shopName, ownerName } = useAuth();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const isActive = (path: string) => location.pathname === path;
  const isChildActive = (item: NavItem) =>
    item.children?.some((c) => isActive(c.path)) ?? false;

  const toggleExpanded = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleNavClick = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogout = async () => {
    onClose();
    const result = await Swal.fire({
      title: 'Logout?',
      text: 'You will be logged out of Invocraft.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Logout',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
    });

    if (result.isConfirmed) {
      clearAuthStorage();
      toast.success('Logged out successfully');
      navigate(ROUTES.LOGIN, { replace: true });
    }
  };

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-green-600 flex items-center justify-center shadow-md">
                  <Store size={18} className="text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[160px]">
                    {shopName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[160px]">
                    {ownerName}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Close sidebar"
              >
                <X size={18} />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
              {NAV_ITEMS.map((item) => (
                <div key={item.id}>
                  {item.path ? (
                    // Direct link
                    <button
                      onClick={() => handleNavClick(item.path!)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                        isActive(item.path)
                          ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white',
                      )}
                    >
                      <item.icon
                        size={18}
                        className={cn(
                          isActive(item.path)
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-gray-400 dark:text-gray-500',
                        )}
                      />
                      {item.label}
                    </button>
                  ) : (
                    // Expandable group
                    <>
                      <button
                        onClick={() => toggleExpanded(item.id)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                          isChildActive(item)
                            ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white',
                        )}
                      >
                        <item.icon
                          size={18}
                          className={cn(
                            isChildActive(item)
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-gray-400 dark:text-gray-500',
                          )}
                        />
                        <span className="flex-1 text-left">{item.label}</span>
                        {expandedItems.has(item.id) ? (
                          <ChevronDown size={15} className="text-gray-400" />
                        ) : (
                          <ChevronRight size={15} className="text-gray-400" />
                        )}
                      </button>

                      <AnimatePresence>
                        {expandedItems.has(item.id) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="ml-9 mt-1 space-y-0.5">
                              {item.children!.map((child) => (
                                <button
                                  key={child.id}
                                  onClick={() => handleNavClick(child.path)}
                                  className={cn(
                                    'w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-150',
                                    isActive(child.path)
                                      ? 'text-green-700 dark:text-green-400 font-medium bg-green-50 dark:bg-green-900/20'
                                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800',
                                  )}
                                >
                                  {child.label}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </div>
              ))}
            </nav>

            {/* Footer — Logout */}
            <div className="border-t border-gray-100 dark:border-gray-800 p-3">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Collapsed desktop sidebar icons ──────────────────────────────────────────
// (kept simple — mobile drawer is primary nav pattern for this app)
export { NAV_ITEMS };
export type { NavItem, NavChild };
