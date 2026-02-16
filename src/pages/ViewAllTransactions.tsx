import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Calendar, Download, FileText, ArrowUp, ArrowDown, Loader2, Search, Filter, ChevronDown } from "lucide-react";
import api from "../utils/api";
import * as XLSX from "xlsx";

type Transaction = {
  id: number;
  party_id?: number;
  personal_contact_id?: number;
  type: "debit" | "credit" | "given" | "received";
  amount: number;
  transaction_date: string;
  note: string | null;
  payment_method?: string;
  reference_number?: string | null;
  transaction_type?: "business" | "personal";
  party?: {
    id: number;
    name: string;
    type: string;
  };
  personal_contact?: {
    id: number;
    name: string;
  };
};

type ViewAllTransactionsProps = {
  onBack: () => void;
};

type DateFilter = "all" | "today" | "yesterday" | "this_week" | "this_month" | "custom" | "date_picker";

export default function ViewAllTransactions({ onBack }: ViewAllTransactionsProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [filterType, setFilterType] = useState<"all" | "business" | "personal">("all");
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAvailableDates();
  }, [filterType]);

  useEffect(() => {
    if (dateFilter === "date_picker" && availableDates.length > 0 && !selectedDate) {
      // Set default to today if available, otherwise most recent date
      const today = new Date().toISOString().split('T')[0];
      const defaultDate = availableDates.includes(today) ? today : availableDates[0];
      setSelectedDate(defaultDate);
    } else if (dateFilter === "date_picker" && availableDates.length === 0 && !selectedDate) {
      // If no dates available yet, set to today as fallback
      const today = new Date().toISOString().split('T')[0];
      setSelectedDate(today);
    }
  }, [availableDates, dateFilter, selectedDate]);

  const fetchTransactions = useCallback(async (page: number = 1, reset: boolean = false) => {
    // Don't fetch if date_picker is selected but no date is chosen yet
    if (dateFilter === "date_picker" && !selectedDate) {
      return;
    }
    
    // Don't fetch if custom range is selected but dates are incomplete
    if (dateFilter === "custom" && (!customStartDate || !customEndDate)) {
      return;
    }

    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const params: any = {
        page,
        per_page: 20,
      };

      // Add date filter (backend uses start_date and end_date, not date)
      if (dateFilter === "date_picker" && selectedDate) {
        params.start_date = selectedDate;
        params.end_date = selectedDate;
      } else if (dateFilter === "custom" && customStartDate && customEndDate) {
        params.start_date = customStartDate;
        params.end_date = customEndDate;
      } else if (dateFilter !== "all") {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let range: { start: Date; end: Date } | null = null;
        
        switch (dateFilter) {
          case "today":
            range = {
              start: today,
              end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
            };
            break;
          case "yesterday":
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            range = {
              start: yesterday,
              end: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1),
            };
            break;
          case "this_week":
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            range = {
              start: weekStart,
              end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
            };
            break;
          case "this_month":
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            range = {
              start: monthStart,
              end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
            };
            break;
        }
        
        if (range) {
          params.start_date = range.start.toISOString().split('T')[0];
          params.end_date = range.end.toISOString().split('T')[0];
        }
      }

      // Add type filter
      if (filterType !== "all") {
        params.transaction_type = filterType;
      }

      // Fetch business transactions (backend /transactions uses type=credit|debit only, so do not send type: 'business')
      const businessParams = { ...params };
      const personalPromise = filterType === "all" || filterType === "personal"
        ? api.get('/personal-transactions', { params: { ...params } })
        : Promise.resolve({ data: { success: true, data: [], pagination: { has_more: false } } });

      const businessPromise = filterType === "all" || filterType === "business"
        ? api.get('/transactions', { params: businessParams })
        : Promise.resolve({ data: { success: true, data: [], pagination: { has_more: false } } });

      const [businessRes, personalRes] = await Promise.all([businessPromise, personalPromise]);

      let newTransactions: Transaction[] = [];

      if (businessRes.data?.success && Array.isArray(businessRes.data.data)) {
        const businessTxs = businessRes.data.data.map((tx: any) => ({
          ...tx,
          transaction_type: "business" as const,
        }));
        newTransactions = [...newTransactions, ...businessTxs];
      }

      if (personalRes.data?.success && Array.isArray(personalRes.data.data)) {
        const personalTxs = personalRes.data.data.map((tx: any) => ({
          ...tx,
          transaction_type: "personal" as const,
        }));
        newTransactions = [...newTransactions, ...personalTxs];
      }

      // Sort by date (newest first)
      newTransactions.sort((a, b) => 
        new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()
      );

      if (reset) {
        setTransactions(newTransactions);
      } else {
        setTransactions(prev => [...prev, ...newTransactions]);
      }

      // Check if there's more data
      const businessHasMore = businessRes.data.pagination?.has_more || false;
      const personalHasMore = personalRes.data.pagination?.has_more || false;
      setHasMore(businessHasMore || personalHasMore);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [dateFilter, selectedDate, customStartDate, customEndDate, filterType]);

  useEffect(() => {
    // Only fetch if conditions are met
    if (dateFilter === "date_picker" && !selectedDate) {
      setLoading(false); // Stop loading if waiting for date selection
      return; // Wait for date to be selected
    }
    if (dateFilter === "custom" && (!customStartDate || !customEndDate)) {
      setLoading(false); // Stop loading if waiting for date range
      return; // Wait for both dates to be selected
    }
    
    setCurrentPage(1);
    setTransactions([]);
    setHasMore(true);
    fetchTransactions(1, true);
  }, [fetchTransactions, dateFilter, selectedDate, customStartDate, customEndDate]);

  const loadMoreTransactions = useCallback(() => {
    if (!loadingMore && hasMore && !loading) {
      fetchTransactions(currentPage + 1, false);
    }
  }, [loadingMore, hasMore, loading, currentPage, fetchTransactions]);

  // Infinite scroll observer (must be after loadMoreTransactions is defined)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          loadMoreTransactions();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, loadingMore, loading, loadMoreTransactions]);

  const fetchAvailableDates = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0];
    // Backend has no /transactions/dates endpoint; use today so date picker works without 404
    setAvailableDates([today]);
  }, []);

  // Client-side search filter (since we're doing server-side pagination)
  const filteredTransactions = transactions.filter(tx => {
    if (!searchQuery) return true;
    
    return (
      (tx.party?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (tx.personal_contact?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (tx.note?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
    );
  });

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateForExcel = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric'
    });
  };

  const exportToExcel = () => {
    const exportData = filteredTransactions.map(tx => ({
      'Date': formatDateForExcel(tx.transaction_date),
      'Name': tx.party?.name || tx.personal_contact?.name || 'Unknown',
      'Type': tx.transaction_type === "business" 
        ? (tx.type === "credit" ? "Credit (Money In)" : "Debit (Money Out)")
        : (tx.type === "given" ? "You Gave" : "You Received"),
      'Category': tx.transaction_type === "business" ? "Business" : "Personal",
      'Amount (₹)': tx.amount,
      'Payment Method': tx.payment_method || 'N/A',
      'Reference': tx.reference_number || 'N/A',
      'Note': tx.note || 'N/A',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");

    // Auto-size columns
    const colWidths = [
      { wch: 12 }, // Date
      { wch: 20 }, // Name
      { wch: 20 }, // Type
      { wch: 12 }, // Category
      { wch: 15 }, // Amount
      { wch: 15 }, // Payment Method
      { wch: 15 }, // Reference
      { wch: 30 }, // Note
    ];
    ws['!cols'] = colWidths;

    // Generate filename with date range
    let filename = 'Transactions';
    if (dateFilter === "date_picker" && selectedDate) {
      filename = `Transactions_${selectedDate}`;
    } else if (dateFilter === "custom" && customStartDate && customEndDate) {
      filename = `Transactions_${customStartDate}_to_${customEndDate}`;
    } else if (dateFilter !== "all") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let range: { start: Date; end: Date } | null = null;
      
      switch (dateFilter) {
        case "today":
          range = {
            start: today,
            end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
          };
          break;
        case "yesterday":
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          range = {
            start: yesterday,
            end: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1),
          };
          break;
        case "this_week":
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          range = {
            start: weekStart,
            end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
          };
          break;
        case "this_month":
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
          range = {
            start: monthStart,
            end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
          };
          break;
      }
      
      if (range) {
        const startStr = range.start.toISOString().split('T')[0];
        const endStr = range.end.toISOString().split('T')[0];
        filename = `Transactions_${startStr}_to_${endStr}`;
      }
    } else {
      filename = `All_Transactions_${new Date().toISOString().split('T')[0]}`;
    }

    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  const getTransactionLabel = (tx: Transaction) => {
    if (tx.transaction_type === "personal") {
      return tx.type === "given" ? "You Gave" : "You Received";
    } else {
      return tx.type === "credit" ? "Credit (Money In)" : "Debit (Money Out)";
    }
  };

  const getTotalAmount = () => {
    return filteredTransactions.reduce((sum, tx) => {
      if (tx.transaction_type === "business") {
        return sum + (tx.type === "credit" ? tx.amount : -tx.amount);
      } else {
        return sum + (tx.type === "received" ? tx.amount : -tx.amount);
      }
    }, 0);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="px-4 py-4 flex items-center gap-3 border-b border-[#F3F4F6] dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10">
        <button
          onClick={onBack}
          className="w-8 h-8 flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-[#111827] dark:text-white" />
        </button>
        <h1 className="text-lg font-bold text-[#111827] dark:text-white flex-1">
          All Transactions
        </h1>
        <button
          onClick={exportToExcel}
          className="w-9 h-9 rounded-xl bg-[#22C55E] dark:bg-green-600 text-white flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
          title="Export to Excel"
        >
          <Download className="w-5 h-5" />
        </button>
      </div>

      {/* Filters */}
      <div className="px-4 py-4 space-y-3 border-b border-[#F3F4F6] dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-[73px] z-10">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF] dark:text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, note..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#111827] dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-[#22C55E] dark:focus:ring-green-500"
          />
        </div>

        {/* Type Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          {(["all", "business", "personal"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                filterType === type
                  ? "bg-[#22C55E] dark:bg-green-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-[#374151] dark:text-gray-300"
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {/* Date Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          {([
            { value: "date_picker", label: "Select Date" },
            { value: "today", label: "Today" },
            { value: "yesterday", label: "Yesterday" },
            { value: "this_week", label: "This Week" },
            { value: "this_month", label: "This Month" },
            { value: "custom", label: "Custom Range" },
            { value: "all", label: "All" },
          ] as const).map((filter) => (
            <button
              key={filter.value}
              onClick={() => setDateFilter(filter.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                dateFilter === filter.value
                  ? "bg-[#22C55E] dark:bg-green-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-[#374151] dark:text-gray-300"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Date Picker - Shows only dates with transactions */}
        {dateFilter === "date_picker" && (
          <div className="relative">
            <label className="text-xs text-[#6B7280] dark:text-gray-400 mb-1 block">Select Date (with transactions)</label>
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#111827] dark:text-white outline-none focus:ring-2 focus:ring-[#22C55E] dark:focus:ring-green-500"
                list="available-dates"
              />
              <datalist id="available-dates">
                {availableDates.map((date) => (
                  <option key={date} value={date} />
                ))}
              </datalist>
              {availableDates.length > 0 && (
                <div className="mt-1 text-xs text-[#6B7280] dark:text-gray-400">
                  {availableDates.length} date{availableDates.length !== 1 ? 's' : ''} available
                </div>
              )}
            </div>
          </div>
        )}

        {/* Custom Date Range */}
        {dateFilter === "custom" && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-[#6B7280] dark:text-gray-400 mb-1 block">Start Date</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#111827] dark:text-white outline-none focus:ring-2 focus:ring-[#22C55E] dark:focus:ring-green-500"
              />
            </div>
            <div>
              <label className="text-xs text-[#6B7280] dark:text-gray-400 mb-1 block">End Date</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#111827] dark:text-white outline-none focus:ring-2 focus:ring-[#22C55E] dark:focus:ring-green-500"
              />
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="flex items-center justify-between pt-2 border-t border-[#E5E7EB] dark:border-gray-700">
          <span className="text-sm text-[#6B7280] dark:text-gray-400">
            {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
            {hasMore && " (loading more...)"}
          </span>
          <span className={`text-sm font-semibold ${
            getTotalAmount() >= 0 
              ? "text-[#16A34A] dark:text-green-400" 
              : "text-[#DC2626] dark:text-red-400"
          }`}>
            Net: {formatAmount(Math.abs(getTotalAmount()))}
          </span>
        </div>
      </div>

      {/* Transaction List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 hide-scrollbar">
        {loading && transactions.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#22C55E] dark:text-green-400" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 font-medium mb-2">No transactions found</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => {
              const isCredit = tx.transaction_type === "business" 
                ? tx.type === "credit" 
                : tx.type === "received";
              
              return (
                <div
                  key={`${tx.transaction_type}-${tx.id}`}
                  className="bg-white dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {isCredit ? (
                          <ArrowDown className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                        ) : (
                          <ArrowUp className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                        )}
                        <span className={`text-sm font-semibold ${
                          isCredit
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}>
                          {getTransactionLabel(tx)}
                        </span>
                        <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${
                          tx.transaction_type === "business"
                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                            : "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
                        }`}>
                          {tx.transaction_type === "business" ? "Business" : "Personal"}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-[#111827] dark:text-white mb-1 truncate">
                        {tx.party?.name || tx.personal_contact?.name || 'Unknown'}
                      </h3>
                      <p className="text-lg font-bold text-[#111827] dark:text-white mb-2">
                        {formatAmount(tx.amount)}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-[#6B7280] dark:text-gray-400 mb-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(tx.transaction_date)}</span>
                        </div>
                        {tx.payment_method && (
                          <>
                            <span>•</span>
                            <span className="capitalize">{tx.payment_method}</span>
                          </>
                        )}
                      </div>
                      {tx.note && (
                        <p className="text-sm text-[#6B7280] dark:text-gray-400 mt-2">{tx.note}</p>
                      )}
                      {tx.reference_number && (
                        <p className="text-xs text-[#9CA3AF] dark:text-gray-500 mt-1">Ref: {tx.reference_number}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Infinite Scroll Trigger */}
        {hasMore && (
          <div ref={observerTarget} className="flex items-center justify-center py-4">
            {loadingMore && (
              <Loader2 className="w-6 h-6 animate-spin text-[#22C55E] dark:text-green-400" />
            )}
          </div>
        )}
        
        {!hasMore && transactions.length > 0 && (
          <div className="text-center py-4 text-sm text-[#6B7280] dark:text-gray-400">
            No more transactions to load
          </div>
        )}
      </div>
    </div>
  );
}

