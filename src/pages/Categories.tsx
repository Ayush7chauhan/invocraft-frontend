import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Plus,
  X,
  FolderOpen,
  Loader2,
  Trash2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import api from "../utils/api";

type Category = {
  id: number;
  name: string;
};

import { useNavigate, useLocation } from "react-router-dom";

export default function Categories() {
  const navigate = useNavigate();
  const location = useLocation();
  const onBack = () => navigate(-1);
  
  const state = location.state as { initialShowForm?: boolean } | null;
  const initialShowForm = state?.initialShowForm || false;

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(!!initialShowForm);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get("/categories");
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (e) {
      console.error("Error fetching categories:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setNewName("");
    setError("");
    setShowForm(true);
  };

  const handleConfirmAdd = () => {
    const name = newName.trim().replace(/\s+/g, " ");
    if (!name) {
      setError("Category name is required.");
      return;
    }
    if (name.length > 50) {
      setError("Category name must be under 50 characters.");
      return;
    }
    setNewName(name);
    setShowConfirm(true);
  };

  const handleAddCategory = async () => {
    const name = newName.trim();
    if (!name) return;
    setError("");
    setIsSubmitting(true);
    try {
      const response = await api.post("/categories", { name });
      if (response.data.success) {
        setShowConfirm(false);
        setShowForm(false);
        setNewName("");
        fetchCategories();
        window.dispatchEvent(new CustomEvent("dashboard-refresh"));
      }
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message || "Failed to add category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (
      !window.confirm(
        "Delete this category? Products using it will keep the category name.",
      )
    )
      return;
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
      window.dispatchEvent(new CustomEvent("dashboard-refresh"));
    } catch (e) {
      console.error(e);
      alert("Failed to delete category");
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      <div className="px-4 py-4 flex items-center gap-3 border-b border-[#F3F4F6] dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10">
        <button
          onClick={onBack}
          className="w-8 h-8 flex items-center justify-center"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-[#111827] dark:text-white" />
        </button>
        <h1 className="text-lg font-bold text-[#111827] dark:text-white flex-1">
          Categories
        </h1>
        {!showForm && (
          <button
            onClick={handleOpenAdd}
            className="w-9 h-9 rounded-xl bg-[#22C55E] dark:bg-green-600 text-white flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <Plus className="w-5 h-5" />
          </button>
        )}
        {showForm && (
          <button
            onClick={() => {
              setShowForm(false);
              setShowConfirm(false);
              setNewName("");
              setError("");
            }}
            className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 hide-scrollbar">
        {showForm ? (
          <div className="space-y-4">
            <p className="text-sm text-[#6B7280] dark:text-gray-400">
              Add categories here. Use them when adding products so billing is
              easier.
            </p>
            <div>
              <label className="text-sm font-medium text-[#111827] dark:text-gray-200 mb-2 block">
                Category name
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  setError("");
                }}
                placeholder="e.g. Electronics, Grocery"
                className={`w-full px-4 py-3 rounded-xl border ${
                  error
                    ? "border-red-300 dark:border-red-700"
                    : "border-[#E5E7EB] dark:border-gray-700"
                } bg-white dark:bg-gray-800 text-[#111827] dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-[#22C55E] dark:focus:ring-green-500`}
              />
              {error && (
                <div className="mt-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl p-3 flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleConfirmAdd}
              disabled={!newName.trim()}
              className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 bg-[#22C55E] dark:bg-green-600 text-white hover:bg-[#16A34A] dark:hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="w-4 h-4" />
              Add category
            </button>
          </div>
        ) : (
          <>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#22C55E] dark:text-green-400" />
              </div>
            ) : categories.length === 0 ? (
              <div
                onClick={handleOpenAdd}
                className="border-2 border-dashed border-[#E5E7EB] dark:border-gray-700 rounded-xl p-8 text-center cursor-pointer hover:border-[#22C55E] dark:hover:border-green-500"
              >
                <FolderOpen className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  No categories yet
                </p>
                <p className="text-sm text-[#22C55E] dark:text-green-400 font-medium">
                  Add categories before adding products
                </p>
              </div>
            ) : (
              <ul className="space-y-2">
                {categories.map((cat) => (
                  <li
                    key={cat.id}
                    className="flex items-center justify-between py-3 px-4 rounded-xl border border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-800"
                  >
                    <span className="font-medium text-[#111827] dark:text-white">
                      {cat.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDelete(cat.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>

      {/* Confirm add category popup */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => !isSubmitting && setShowConfirm(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-[#111827] dark:text-white mb-2">
              Confirm category
            </h3>
            <p className="text-sm text-[#6B7280] dark:text-gray-400 mb-4">
              Add category{" "}
              <strong className="text-[#111827] dark:text-white">
                "{newName.trim()}"
              </strong>
              ?
            </p>
            {error && (
              <p className="text-xs text-red-600 dark:text-red-400 mb-3">
                {error}
              </p>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => !isSubmitting && setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-xl font-medium border border-[#E5E7EB] dark:border-gray-700 text-[#111827] dark:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddCategory}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl font-medium bg-[#22C55E] dark:bg-green-600 text-white disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Confirm"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
