import React from "react";
import { Calendar } from "lucide-react";
import SearchBar from "../ui/SearchBar";

interface BillFiltersProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterStatus: string;
  setFilterStatus: (s: any) => void;
  filterDate: string;
  setFilterDate: (d: any) => void;
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
    <div className="space-y-4">
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search invoice #, customer name..."
      />

      <div className="space-y-3">
        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          {(["all", "paid", "unpaid", "partial"] as const).map((status) => (
            <FilterButton
              key={status}
              active={filterStatus === status}
              onClick={() => setFilterStatus(status)}
              label={status.charAt(0).toUpperCase() + status.slice(1)}
              variant="green"
            />
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          {(["all", "today", "week", "month"] as const).map((date) => (
            <FilterButton
              key={date}
              active={filterDate === date}
              onClick={() => setFilterDate(date)}
              label={date.charAt(0).toUpperCase() + date.slice(1)}
              variant="blue"
              icon={<Calendar className="w-3 h-3" />}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

function FilterButton({ active, onClick, label, variant, icon }: { active: boolean, onClick: () => void, label: string, variant: "green" | "blue", icon?: any }) {
  const activeStyles = {
    green: "bg-green-500 text-white shadow-lg shadow-green-500/25 border-green-500",
    blue: "bg-blue-500 text-white shadow-lg shadow-blue-500/25 border-blue-500",
  };

  const inactiveStyles = "bg-gray-100/50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 border-gray-100 dark:border-gray-800";

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-[11px] font-black uppercase tracking-widest border-2 transition-all active:scale-95 whitespace-nowrap ${active ? activeStyles[variant] : inactiveStyles}`}
    >
      {icon}
      {label}
    </button>
  );
}

export default BillFilters;
