import React from "react";
import { Card, CardContent } from "../ui/card";

interface BillSummaryProps {
  totalAmount: string;
  paidAmount: string;
  unpaidAmount: string;
}

const BillSummary: React.FC<BillSummaryProps> = ({
  totalAmount,
  paidAmount,
  unpaidAmount,
}) => {
  return (
    <div className="grid grid-cols-3 gap-3">
      <SummaryCard label="Total" value={totalAmount} color="blue" />
      <SummaryCard label="Paid" value={paidAmount} color="emerald" />
      <SummaryCard label="Unpaid" value={unpaidAmount} color="rose" />
    </div>
  );
};

function SummaryCard({ label, value, color }: { label: string, value: string, color: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50/50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800/20",
    emerald: "bg-emerald-50/50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/20",
    rose: "bg-rose-50/50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-800/20",
  };

  return (
    <Card className={`border shadow-sm ${colors[color]}`}>
      <CardContent className="p-3">
        <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">{label}</p>
        <p className="text-sm font-black tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
}

export default BillSummary;
