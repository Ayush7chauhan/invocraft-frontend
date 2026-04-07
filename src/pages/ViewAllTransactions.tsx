import { useState, useEffect, useRef, useCallback } from "react";
import {
  ArrowLeft,
  Download,
  ArrowUp,
  ArrowDown,
  Loader2,
  Search,
} from "lucide-react";
import api from "../utils/api";
import * as XLSX from "xlsx";

type Transaction = {
  id: number;
  type: "debit" | "credit" | "given" | "received";
  amount: number;
  transaction_date: string;
  note: string | null;
  payment_method?: string;
  reference_number?: string | null;
  transaction_type?: "business" | "personal";
  party?: { name: string };
  personal_contact?: { name: string };
};

import { useNavigate } from "react-router-dom";

export default function ViewAllTransactions() {
  const navigate = useNavigate();
  const onBack = () => navigate(-1);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);

  // ✅ FETCH DATA
  const fetchTransactions = useCallback(async (page = 1, reset = false) => {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const params: Record<string, number> = {
        page,
        per_page: 20,
      };

      const res = await api.get("/transactions", { params });

      const data: Transaction[] = res.data?.data || [];

      if (reset) {
        setTransactions(data);
      } else {
        setTransactions((prev) => [...prev, ...data]);
      }

      setHasMore(res.data?.pagination?.has_more ?? false);
      setCurrentPage(page);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions(1, true);
  }, [fetchTransactions]);

  // ✅ INFINITE SCROLL
  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore && !loading) {
      fetchTransactions(currentPage + 1);
    }
  }, [loadingMore, hasMore, loading, currentPage, fetchTransactions]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0] && entries[0].isIntersecting && hasMore && !loadingMore) {
        loadMore();
      }
    });

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [loadMore, hasMore, loadingMore]);

  // ✅ SEARCH FILTER FIXED
  const filtered = transactions.filter((tx) => {
    if (!searchQuery) return true;

    const q = searchQuery.toLowerCase();

    return (
      tx.party?.name?.toLowerCase().includes(q) ||
      tx.personal_contact?.name?.toLowerCase().includes(q) ||
      tx.note?.toLowerCase().includes(q)
    );
  });

  const formatAmount = (amt: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amt);

  const exportExcel = () => {
    const data = filtered.map((tx) => ({
      Name: tx.party?.name || tx.personal_contact?.name || "Unknown",
      Amount: tx.amount,
      Date: tx.transaction_date,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    XLSX.writeFile(wb, "transactions.xlsx");
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* HEADER */}
      <div className="flex items-center p-4 border-b">
        <button onClick={onBack}>
          <ArrowLeft />
        </button>

        <h1 className="ml-3 font-bold flex-1">Transactions</h1>

        <button onClick={exportExcel}>
          <Download />
        </button>
      </div>

      {/* SEARCH */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 border p-2 w-full rounded"
            placeholder="Search..."
          />
        </div>
      </div>

      {/* LIST */}
      <div className="p-4 space-y-3">
        {loading ? (
          <Loader2 className="animate-spin" />
        ) : (
          filtered.map((tx) => {
            const isCredit = tx.type === "credit";

            return (
              <div key={tx.id} className="border p-3 rounded-xl">
                <div className="flex items-center gap-2">
                  {isCredit ? (
                    <ArrowDown className="text-green-500 shrink-0" />
                  ) : (
                    <ArrowUp className="text-red-500 shrink-0" />
                  )}
                  <span>{tx.party?.name || "Unknown"}</span>
                </div>

                <p className="font-bold">{formatAmount(tx.amount)}</p>
              </div>
            );
          })
        )}

        {/* LOAD MORE */}
        <div ref={observerTarget} className="text-center py-4">
          {loadingMore && <Loader2 className="animate-spin" />}
        </div>
      </div>
    </div>
  );
}
