import { cn } from '@/lib/utils';

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

/** Wrapper for form fields — label + input + error message */
export default function FormField({
  label,
  error,
  required,
  hint,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
      {!error && hint && (
        <p className="text-xs text-gray-400 dark:text-gray-500">{hint}</p>
      )}
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function Input({ className, error, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'w-full px-3 py-2.5 text-sm rounded-xl border transition-all duration-150 outline-none',
        'bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
        'placeholder-gray-400 dark:placeholder-gray-500',
        error
          ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
          : 'border-gray-200 dark:border-gray-700 focus:border-green-500 focus:ring-2 focus:ring-green-500/20',
        className,
      )}
      {...props}
    />
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  options: Array<{ value: string | number; label: string }>;
  placeholder?: string;
}

export function Select({ className, error, options, placeholder, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        'w-full px-3 py-2.5 text-sm rounded-xl border transition-all duration-150 outline-none appearance-none',
        'bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
        error
          ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
          : 'border-gray-200 dark:border-gray-700 focus:border-green-500 focus:ring-2 focus:ring-green-500/20',
        className,
      )}
      {...props}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export function Textarea({ className, error, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        'w-full px-3 py-2.5 text-sm rounded-xl border transition-all duration-150 outline-none resize-none',
        'bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
        'placeholder-gray-400 dark:placeholder-gray-500',
        error
          ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
          : 'border-gray-200 dark:border-gray-700 focus:border-green-500 focus:ring-2 focus:ring-green-500/20',
        className,
      )}
      rows={props.rows ?? 3}
      {...props}
    />
  );
}
