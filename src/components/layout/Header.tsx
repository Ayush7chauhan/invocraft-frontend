import { Menu, Bell, Sun, Moon, Search } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { ROUTES } from '@/constants/routes';

interface HeaderProps {
  onMenuClick: () => void;
  title?: string;
}

export default function Header({ onMenuClick, title }: HeaderProps) {
  const { shopName } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 shadow-sm">
      {/* Hamburger */}
      <button
        onClick={onMenuClick}
        className="flex-shrink-0 p-2 -ml-1 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Title / Brand */}
      <div className="flex-1 min-w-0">
        {showSearch ? (
          <input
            autoFocus
            type="text"
            placeholder="Search..."
            onBlur={() => setShowSearch(false)}
            className="w-full max-w-xs text-sm border-0 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-1.5 outline-none text-gray-900 dark:text-white placeholder-gray-400"
          />
        ) : (
          <h1 className="text-base font-semibold text-gray-900 dark:text-white truncate">
            {title ?? shopName}
          </h1>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1">
        {/* Search toggle */}
        <button
          onClick={() => setShowSearch(true)}
          className={cn(
            'p-2 rounded-lg transition-colors',
            showSearch
              ? 'hidden'
              : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800',
          )}
          aria-label="Search"
        >
          <Search size={18} />
        </button>

        {/* Notifications */}
        <button
          className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Notifications"
        >
          <Bell size={18} />
          {/* Notification dot */}
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full" />
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle theme"
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Settings shortcut */}
        <button
          onClick={() => navigate(ROUTES.SETTINGS)}
          className="p-1 rounded-full bg-green-600 text-white w-8 h-8 flex items-center justify-center text-xs font-bold hover:bg-green-700 transition-colors ml-1"
          aria-label="Profile"
        >
          {shopName.charAt(0).toUpperCase()}
        </button>
      </div>
    </header>
  );
}
