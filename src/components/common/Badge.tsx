import { cn } from '@/lib/utils';

type BadgeVariant =
  | 'default'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'outline';

const STYLES: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300',
  success: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  danger:  'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  warning: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  info:    'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  outline: 'border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300',
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        STYLES[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Map InvoiceStatus to badge variant */
export function invoiceStatusBadge(status: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    paid: 'success',
    partially_paid: 'warning',
    unpaid: 'danger',
    cancelled: 'outline',
  };
  return map[status] ?? 'default';
}
