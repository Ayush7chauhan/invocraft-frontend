/**
 * Programmatic SweetAlert2-based confirm dialog.
 * Usage: const ok = await confirmDelete('Are you sure?');
 */
import Swal from 'sweetalert2';

interface ConfirmOptions {
  title?: string;
  text?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

const ICON_MAP = {
  danger: 'warning',
  warning: 'question',
  info: 'info',
} as const;

const COLOR_MAP = {
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
} as const;

/**
 * Show a confirmation dialog and return `true` if confirmed, `false` otherwise.
 */
export async function confirmAction(options: ConfirmOptions = {}): Promise<boolean> {
  const {
    title = 'Are you sure?',
    text = 'This action cannot be undone.',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger',
  } = options;

  const result = await Swal.fire({
    title,
    text,
    icon: ICON_MAP[variant],
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: COLOR_MAP[variant],
    cancelButtonColor: '#6b7280',
    reverseButtons: true,
  });

  return result.isConfirmed;
}

/**
 * Convenience wrapper for delete confirmations.
 */
export async function confirmDelete(itemName?: string): Promise<boolean> {
  return confirmAction({
    title: 'Delete?',
    text: itemName
      ? `"${itemName}" will be permanently deleted.`
      : 'This will be permanently deleted.',
    confirmText: 'Delete',
    variant: 'danger',
  });
}
