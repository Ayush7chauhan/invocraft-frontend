import { X, FileText, UserPlus, Package, TrendingDown } from "lucide-react";

type QuickActionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (action: string) => void;
};

function QuickActionModal({ isOpen, onClose, onSelect }: QuickActionModalProps) {
  if (!isOpen) return null;

  const actions = [
    { id: "add-khata", label: "Add Khata Entry", icon: FileText, color: "text-blue-600 dark:text-blue-400" },
    { id: "add-customer", label: "Add Customer", icon: UserPlus, color: "text-green-600 dark:text-green-400" },
    { id: "add-product", label: "Add Product", icon: Package, color: "text-purple-600 dark:text-purple-400" },
    { id: "personal-expense", label: "Add Expense/Purchase", icon: TrendingDown, color: "text-red-600 dark:text-red-400" },
  ];

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 dark:bg-black/70 z-40 transition-opacity duration-300"
        onClick={onClose}
        style={{ animation: 'fadeIn 0.3s ease-out' }}
      />
      
      {/* Modal */}
      <div 
        className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-3xl shadow-2xl z-50"
        style={{ animation: 'slideUp 0.3s ease-out' }}
      >
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#111827] dark:text-white">Quick Actions</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 text-[#111827] dark:text-white" />
            </button>
          </div>

          {/* Actions Grid */}
          <div className="grid grid-cols-2 gap-3">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => {
                    onSelect(action.id);
                    onClose();
                  }}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-[#E5E7EB] dark:border-gray-700 hover:border-[#22C55E] dark:hover:border-green-500 hover:bg-[#F6FEF8] dark:hover:bg-green-900/20 transition-all duration-200 active:scale-95"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center ${action.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-medium text-[#111827] dark:text-white text-center">
                    {action.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

export default QuickActionModal;

