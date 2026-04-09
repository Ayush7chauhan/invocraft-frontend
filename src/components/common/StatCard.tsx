import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: { value: number; label: string };
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info';
  className?: string;
  onClick?: () => void;
}

const VARIANT_STYLES = {
  default: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
  success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
  danger:  'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
  warning: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
  info:    'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
};

const ICON_STYLES = {
  default: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
  success: 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400',
  danger:  'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400',
  warning: 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400',
  info:    'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400',
};

export default function StatCard({
  label,
  value,
  icon,
  trend,
  variant = 'default',
  className,
  onClick,
}: StatCardProps) {
  const isClickable = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-2xl border p-4 shadow-sm transition-all duration-200',
        VARIANT_STYLES[variant],
        isClickable && 'cursor-pointer hover:shadow-md active:scale-[0.98]',
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide truncate">
            {label}
          </p>
          <p className="mt-1.5 text-2xl font-bold text-gray-900 dark:text-white truncate">
            {value}
          </p>
          {trend && (
            <p
              className={cn(
                'mt-1 text-xs font-medium',
                trend.value >= 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400',
              )}
            >
              {trend.value >= 0 ? '+' : ''}
              {trend.value}% {trend.label}
            </p>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
              ICON_STYLES[variant],
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
