import React from "react";
import { Calendar, Loader2 } from "lucide-react";
import { Card, CardContent } from "../ui/card";

interface FilterSectionProps {
  loading: boolean;
  filterPeriod: string;
  setFilterPeriod: (period: any) => void;
  periodOptions: { value: string; label: string }[];
  rangeData: any;
  filterPeriodLabel: string;
  formatAmount: (amount: number) => string;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  loading,
  filterPeriod,
  setFilterPeriod,
  periodOptions,
  rangeData,
  filterPeriodLabel,
  formatAmount,
}) => {
  return (
    <section className="space-y-6">
      <div className="flex items-center gap-2 px-1">
        <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-600">
          <Calendar className="w-4 h-4" />
        </div>
        <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Report by Period</h2>
      </div>

      <div className="space-y-3">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Select Timeframe</label>
        <select
          value={filterPeriod}
          onChange={(e) => setFilterPeriod(e.target.value)}
          className="w-full bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl py-3.5 px-4 text-sm font-bold text-gray-900 dark:text-white focus:border-green-500 outline-none transition-all"
        >
          {periodOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 bg-gray-50/50 dark:bg-gray-800/20 rounded-3xl border border-dashed border-gray-100 dark:border-gray-800">
          <Loader2 className="w-10 h-10 animate-spin text-orange-500 mb-3" />
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading Report</p>
        </div>
      ) : rangeData ? (
        <div className="grid grid-cols-2 gap-3">
          <StatCard 
            label="Total Sales" 
            value={formatAmount(rangeData.total_sales)} 
            sub={filterPeriodLabel}
            color="emerald"
          />
          <StatCard 
            label="Total Profit" 
            value={formatAmount(rangeData.net_profit)} 
            sub={filterPeriodLabel}
            color="purple"
          />
          <StatCard 
            label="Total Expenses" 
            value={formatAmount(rangeData.expenses)} 
            sub={filterPeriodLabel}
            color="rose"
          />
          <StatCard 
            label="Total Invoices" 
            value={`${rangeData.total_invoices} invoices`} 
            sub={formatAmount(rangeData.total_sales)}
            color="blue"
          />
          <StatCard 
            label="Total Credit" 
            value={formatAmount(rangeData.total_credit ?? 0)} 
            sub={filterPeriodLabel}
            color="emerald"
          />
          <StatCard 
            label="Total Debit" 
            value={formatAmount(rangeData.total_debit ?? 0)} 
            sub={filterPeriodLabel}
            color="rose"
          />
        </div>
      ) : (
        <div className="py-12 text-center bg-gray-50/50 dark:bg-gray-800/20 rounded-3xl border border-dashed border-gray-100 dark:border-gray-800">
          <p className="text-xs font-bold text-gray-300 dark:text-gray-700 uppercase tracking-widest">No data for this period</p>
        </div>
      )}
    </section>
  );
};

function StatCard({ label, value, sub, color }: { label: string, value: string, sub: string, color: string }) {
  const colors: Record<string, string> = {
    emerald: "bg-emerald-50/50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/20",
    purple: "bg-purple-50/50 dark:bg-purple-900/10 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-800/20",
    rose: "bg-rose-50/50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-800/20",
    blue: "bg-blue-50/50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800/20",
  };

  return (
    <Card className={`border shadow-sm hover:shadow-md transition-all active:scale-[0.98] ${colors[color]}`}>
      <CardContent className="p-4">
        <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">{label}</p>
        <p className="text-lg font-black tracking-tight mb-0.5">{value}</p>
        <p className="text-[9px] font-bold opacity-60 uppercase tracking-tighter truncate">{sub}</p>
      </CardContent>
    </Card>
  );
}

export default FilterSection;
