import { Search } from "lucide-react";
import Input from "../ui/Input";

interface BillFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterStatus: "all" | "paid" | "unpaid" | "partial";
  setFilterStatus: (status: any) => void;
  filterDate: "all" | "today" | "week" | "month";
  setFilterDate: (date: any) => void;
}

const BillFilters: React.FC<BillFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
  filterDate,
  setFilterDate,
}) => {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
      <Input
        placeholder="Search by invoice number or party..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        leftIcon={<Search className="w-4 h-4 text-emerald-500" />}
        className="rounded-[24px] border-2 border-gray-100 dark:border-gray-800 focus:border-emerald-500/50 shadow-sm"
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-[2] overflow-x-auto hide-scrollbar pb-1">
          <div className="flex gap-2 min-w-max">
            {(["all", "paid", "unpaid", "partial"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 transition-all active:scale-95 ${
                  filterStatus === status 
                    ? "bg-gray-900 border-gray-900 text-white dark:bg-white dark:text-gray-900" 
                    : "bg-white dark:bg-gray-800 text-gray-400 border-gray-100 dark:border-gray-800 hover:border-emerald-500/30"
                }`}
              >
                {status.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-x-auto hide-scrollbar pb-1">
          <div className="flex gap-2 min-w-max justify-end">
            {(["all", "today", "week", "month"] as const).map((date) => (
              <button
                key={date}
                onClick={() => setFilterDate(date)}
                className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 transition-all active:scale-95 ${
                  filterDate === date 
                    ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                    : "bg-white dark:bg-gray-800 text-gray-400 border-gray-100 dark:border-gray-800 hover:border-emerald-500/30"
                }`}
              >
                {date}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillFilters;
