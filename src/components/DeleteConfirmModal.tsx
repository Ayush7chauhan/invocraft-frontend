import { AlertTriangle, X } from "lucide-react";

type DeleteConfirmModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName?: string;
  transactionCount?: number;
  invoiceCount?: number;
  paymentCount?: number;
  checkingRelations?: boolean;
};

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  transactionCount = 0,
  invoiceCount = 0,
  paymentCount = 0,
  checkingRelations = false,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full p-6 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>

        {/* Warning Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center animate-pulse">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-[#111827] dark:text-white text-center mb-2">
          {title}
        </h2>

        {/* Message */}
        <p className="text-sm text-[#6B7280] dark:text-gray-400 text-center mb-2">
          {message}
        </p>

        {itemName && (
          <p className="text-base font-semibold text-[#111827] dark:text-white text-center mb-4">
            "{itemName}"
          </p>
        )}

        {/* Checking Relations */}
        {checkingRelations && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-4">
            <p className="text-sm text-blue-800 dark:text-blue-300 text-center">
              Checking for related records...
            </p>
          </div>
        )}

        {/* Related Records Warning */}
        {(transactionCount > 0 || invoiceCount > 0 || paymentCount > 0) && (
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4 mb-4">
            <p className="text-sm text-orange-800 dark:text-orange-300 font-semibold mb-2">
              ⚠️ This customer has related records that will also be deleted:
            </p>
            <ul className="text-xs text-orange-700 dark:text-orange-400 space-y-1 ml-4">
              {transactionCount > 0 && (
                <li>• {transactionCount} transaction{transactionCount !== 1 ? 's' : ''} in ledger</li>
              )}
              {invoiceCount > 0 && (
                <li>• {invoiceCount} invoice{invoiceCount !== 1 ? 's' : ''}</li>
              )}
              {paymentCount > 0 && (
                <li>• {paymentCount} payment{paymentCount !== 1 ? 's' : ''}</li>
              )}
            </ul>
          </div>
        )}

        {/* Warning Text */}
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
          <p className="text-sm text-red-800 dark:text-red-300 text-center font-medium">
            ⚠️ All data will be permanently deleted and cannot be recovered!
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl bg-gray-100 dark:bg-gray-700 text-[#374151] dark:text-gray-300 font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-3 px-4 rounded-xl bg-red-600 dark:bg-red-700 text-white font-semibold hover:bg-red-700 dark:hover:bg-red-800 transition-all duration-200 active:scale-95 shadow-lg hover:shadow-xl"
          >
            Delete
          </button>
        </div>
      </div>

    </div>
  );
}

