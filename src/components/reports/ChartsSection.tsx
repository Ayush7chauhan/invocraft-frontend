import React from "react";
import { BarChart3, Loader2, RefreshCw, AlertCircle } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Card, CardContent } from "../ui/card";
import Button from "../ui/Button";

interface ChartsSectionProps {
  loading: boolean;
  error: string | null;
  chartData: any[];
  pieData: any[];
  chartPeriodLabel: string;
  fetchChartData: () => void;
  formatAmount: (amount: number) => string;
  formatAxisCurrency: (value: number) => string;
  ChartTooltip: any;
}

const ChartsSection: React.FC<ChartsSectionProps> = ({
  loading,
  error,
  chartData,
  pieData,
  chartPeriodLabel,
  fetchChartData,
  formatAmount,
  formatAxisCurrency,
  ChartTooltip,
}) => {
  if (loading && chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 dark:bg-gray-800/20 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-800">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
        <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Loading Analytics</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-100 dark:border-red-900/30 bg-red-50/30 dark:bg-red-900/10">
        <CardContent className="p-8 flex flex-col items-center text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-sm font-bold text-red-900 dark:text-red-200 uppercase tracking-widest mb-1">Could not load charts</p>
          <p className="text-xs text-red-600 dark:text-red-400 mb-6">{error}</p>
          <Button onClick={fetchChartData} variant="danger" size="sm">Try Again</Button>
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 dark:bg-gray-800/20 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-800">
        <BarChart3 className="w-14 h-14 text-gray-200 dark:text-gray-700 mb-4" />
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">No data for charts</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">Add transactions to see analytics</p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
            <BarChart3 className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Analytics</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={fetchChartData} isLoading={loading}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Area Chart - Sales Trend */}
      <Card className="border-gray-50 dark:border-gray-800 shadow-lg overflow-hidden">
        <CardContent className="p-5">
          <div className="mb-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sales Trend</p>
            <p className="text-xs font-bold text-green-500">{chartPeriodLabel}</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22C55E" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" className="dark:stroke-gray-700" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: "bold" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: "bold" }} tickFormatter={formatAxisCurrency} />
                <Tooltip content={<ChartTooltip formatter={formatAmount} />} />
                <Area type="monotone" dataKey="total_sales" stroke="#22C55E" strokeWidth={3} fill="url(#salesGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Composed Chart - Sales vs Expenses */}
      <Card className="border-gray-50 dark:border-gray-800 shadow-lg overflow-hidden">
        <CardContent className="p-5">
          <div className="mb-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sales vs Expenses</p>
            <p className="text-xs font-bold text-blue-500">{chartPeriodLabel}</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" className="dark:stroke-gray-700" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: "bold" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: "bold" }} tickFormatter={formatAxisCurrency} />
                <Tooltip content={<ChartTooltip formatter={formatAmount} />} />
                <Legend iconType="circle" />
                <Bar dataKey="total_sales" name="Sales" fill="#22C55E" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Pie Chart - Distribution */}
      {pieData.length > 0 && (
        <Card className="border-gray-50 dark:border-gray-800 shadow-lg overflow-hidden">
          <CardContent className="p-5">
            <div className="mb-4 text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Expense Distribution</p>
              <p className="text-xs font-bold text-purple-500">Totals for Period</p>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => formatAmount(Number(v))} />
                  <Legend verticalAlign="bottom" align="center" iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
};

export default ChartsSection;
