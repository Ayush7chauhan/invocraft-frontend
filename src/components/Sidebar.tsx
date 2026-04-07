import {
  X,
  LogOut,
  ChevronDown,
  ChevronRight,
  Sun,
  Moon,
} from "lucide-react";
import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import { NAVIGATION_CONFIG, type NavItem } from "../config/navigation";
import LogoutModal from "./LogoutModal";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Auto-expand logic based on current path
  useEffect(() => {
    const parentToExpand = NAVIGATION_CONFIG.find(
      (item) =>
        item.items?.some((sub) => sub.href === location.pathname)
    );
    if (parentToExpand) {
      setExpandedIds((prev) => new Set([...prev, parentToExpand.title]));
    }
  }, [location.pathname]);

  const toggleExpand = (title: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  };

  const handleLogout = () => setShowLogoutModal(true);
  
  const confirmLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("temp_user");
    localStorage.removeItem("temp_mobile");
    setShowLogoutModal(false);
    window.location.href = "/login";
  };

  return (
    <>
      <LogoutModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} onConfirm={confirmLogout} />
      
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 dark:bg-black/70 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white dark:bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-r border-gray-100 dark:border-gray-800 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-5 mt-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#22C55E] rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-green-200 dark:shadow-green-900/20">
                <img src="/logo.png" alt="I" className="w-6 h-6 object-contain" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Invocraft</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Theme Toggle Utility */}
          <div className="px-5 py-2">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between p-2 px-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-center gap-2">
                {isDarkMode ? <Moon className="w-4 h-4 text-blue-400" /> : <Sun className="w-4 h-4 text-orange-400" />}
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                  {isDarkMode ? "Dark Mode" : "Light Mode"}
                </span>
              </div>
              <div className="w-8 h-4 rounded-full bg-gray-200 dark:bg-gray-700 relative">
                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${isDarkMode ? "translate-x-4.5" : "translate-x-0.5"}`} />
              </div>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5 custom-scrollbar">
            {NAVIGATION_CONFIG.map((item) => (
              <SidebarItem
                key={item.title}
                item={item}
                isExpanded={expandedIds.has(item.title)}
                onToggle={() => toggleExpand(item.title)}
                onClose={onClose}
              />
            ))}
          </nav>

          {/* Footer / Logout */}
          <div className="p-4 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500 font-semibold hover:bg-red-50 dark:hover:bg-red-500/10 transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-500/10 flex items-center justify-center group-hover:bg-red-100 dark:group-hover:bg-red-500/20">
                <LogOut className="w-4 h-4" />
              </div>
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function SidebarItem({
  item,
  isExpanded,
  onToggle,
  onClose,
}: {
  item: NavItem;
  isExpanded: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const Icon = item.icon;
  const hasSubItems = item.items && item.items.length > 0;
  const location = useLocation();

  // For parent items that are just spacers for sub-items
  if (hasSubItems) {
    const isChildActive = item.items?.some((sub) => sub.href === location.pathname);
    
    return (
      <div className="space-y-1">
        <button
          onClick={onToggle}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
            isChildActive
              ? "text-[#22C55E] dark:text-green-500"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
          }`}
        >
          <div className="flex items-center gap-3">
            {Icon && <Icon className="w-5 h-5 flex-shrink-0" />}
            <span className="text-sm font-bold">{item.title}</span>
          </div>
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
        
        {isExpanded && (
          <div className="ml-5 pl-4 border-l border-gray-100 dark:border-gray-800 space-y-1">
            {item.items?.map((sub) => (
              <NavLink
                key={sub.title}
                to={sub.href || "#"}
                state={sub.state}
                onClick={onClose}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all
                  ${isActive 
                    ? "bg-[#22C55E] text-white shadow-lg shadow-green-100 dark:shadow-none" 
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }
                `}
              >
                {sub.icon && <sub.icon className="w-4 h-4" />}
                {sub.title}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.href || "#"}
      onClick={onClose}
      className={({ isActive }) => `
        flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all
        ${isActive 
          ? "bg-[#22C55E] text-white font-bold shadow-lg shadow-green-100 dark:shadow-none" 
          : "text-gray-600 dark:text-gray-400 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800"
        }
      `}
    >
      {Icon && <Icon className="w-5 h-5" />}
      {item.title}
    </NavLink>
  );
}

