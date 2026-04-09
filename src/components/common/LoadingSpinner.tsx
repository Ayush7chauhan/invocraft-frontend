import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

const SIZE_CLASSES = {
  sm: 'w-4 h-4 border-[2px]',
  md: 'w-8 h-8 border-[3px]',
  lg: 'w-12 h-12 border-[3px]',
};

export default function LoadingSpinner({
  size = 'md',
  className,
  label,
}: LoadingSpinnerProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div
        className={cn(
          'rounded-full border-gray-200 dark:border-gray-700 border-t-green-600 dark:border-t-green-400 animate-spin',
          SIZE_CLASSES[size],
        )}
        role="status"
        aria-label={label ?? 'Loading...'}
      />
      {label && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      )}
    </div>
  );
}

/** Full-page loading screen */
export function PageLoader({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <LoadingSpinner size="lg" label={label} />
    </div>
  );
}

/** Inline button spinner */
export function ButtonSpinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin',
        className,
      )}
    />
  );
}
