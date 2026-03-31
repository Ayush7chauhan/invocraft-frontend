import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Loader2, Edit2, Trash2, X } from "lucide-react";
import api from "../utils/api";
import {} from "../components/ui/autocomplete";

type PaymentMethod = "cash" | "upi" | "bank_transfer" | "other";

type PersonalTransaction = {
  id: number;
  personal_contact_id: number;
  type: "given" | "received";
  amount: number;
  transaction_date: string;
  note: string | null;
  payment_method: PaymentMethod;
  reference_number: string | null;
  personal_contact?: {
    id: number;
    name: string;
  };
};



type PersonalLedgerProps = {
  contactId: number;
  contactName: string;
  onBack: () => void;
};

export default function PersonalLedger({
  contactId,
  contactName,
  onBack,
}: PersonalLedgerProps) {
  const [transactions, setTransactions] = useState<PersonalTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [, setContactBalance] = useState({
    balance: 0,
    youOwe: 0,
    theyOwe: 0,
  });







  useEffect(() => {
    fetchTransactions();
    fetchContactDetails();
  }, [contactId]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await api.get("/personal-transactions", {
        params: { contact_id: contactId },
      });

      if (response.data?.success) {
        setTransactions(response.data.data as PersonalTransaction[]);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchContactDetails = async () => {
    try {
      const response = await api.get(`/personal-contacts/${contactId}`);

      if (response.data?.success) {
        const contact = response.data.data;
        setContactBalance({
          balance: contact.balance || 0,
          youOwe: contact.you_owe || 0,
          theyOwe: contact.they_owe || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching contact:", error);
    }
  };



  const resetForm = () => {
    setShowForm(false);
  };

  const handleEdit = () => {
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure?")) return;

    try {
      await api.delete(`/personal-transactions/${id}`);
      fetchTransactions();
      fetchContactDetails();
    } catch {
      alert("Delete failed");
    }
  };

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();

    if (date.toDateString() === today.toDateString()) return "Today";

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

    return date.toLocaleDateString("en-IN");
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      {/* HEADER */}
      <div className="px-4 py-4 flex items-center gap-3 border-b">
        <button onClick={onBack}>
          <ArrowLeft />
        </button>

        <h1 className="font-bold flex-1">{contactName}</h1>

        {!showForm ? (
          <button onClick={() => setShowForm(true)}>
            <Plus />
          </button>
        ) : (
          <button onClick={resetForm}>
            <X />
          </button>
        )}
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <div className="p-4 space-y-3">
          {transactions.map((tx) => (
            <div key={tx.id} className="border p-3 rounded">
              <div className="flex justify-between">
                <span>{formatDate(tx.transaction_date)}</span>
                <span>{formatAmount(tx.amount)}</span>
              </div>
              <div className="flex gap-2 mt-2">
                <button onClick={() => handleEdit()}>
                  <Edit2 />
                </button>
                <button onClick={() => handleDelete(tx.id)}>
                  <Trash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
