import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Moon,
  Sun,
  Bell,
  User,
  Building2,
  Phone,
  MapPin,
  Save,
  Loader2,
  LogOut,
  Trash2,
  Mail,
} from "lucide-react";
import axios from "axios";
import { useTheme } from "../hooks/useTheme";
import api from "../utils/api";
import LogoutModal from "../components/LogoutModal";

type SettingsProps = {
  onBack: () => void;
  onLogout?: () => void;
};

type UserData = {
  id: number;
  shop_name?: string | null;
  owner_name?: string | null;
  shop_address?: string | null;
  mobile_number?: string | null;
  email?: string | null;
  business_type?: string | null;
  is_registration_complete?: boolean;
};

type FormDataState = {
  shop_name: string;
  owner_name: string;
  shop_address: string;
  mobile_number: string;
  email: string;
  business_type: string;
};

type NotificationSettings = {
  lowStock: boolean;
  paymentReminder: boolean;
  newCustomer: boolean;
  dailySummary: boolean;
};

type UpdateShopPayload = {
  user_id: number;
  shop_name: string | null;
  owner_name: string;
  shop_address: string | null;
  business_type: string | null;
  is_registration_complete: boolean;
};

export default function Settings({ onBack, onLogout }: SettingsProps) {
  const { isDarkMode, toggleTheme } = useTheme();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [notifications, setNotifications] = useState<NotificationSettings>({
    lowStock: true,
    paymentReminder: true,
    newCustomer: false,
    dailySummary: true,
  });

  const [formData, setFormData] = useState<FormDataState>({
    shop_name: "",
    owner_name: "",
    shop_address: "",
    mobile_number: "",
    email: "",
    business_type: "",
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      setLoading(false);
      return;
    }

    try {
      const user: UserData = JSON.parse(storedUser);

      setUserData(user);
      setFormData({
        shop_name: user.shop_name || "",
        owner_name: user.owner_name || "",
        shop_address: user.shop_address || "",
        mobile_number: user.mobile_number || "",
        email: user.email || "",
        business_type: user.business_type || "",
      });
    } catch (error) {
      console.error("Error parsing user data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSave = async () => {
    if (!userData?.id) {
      alert("Session expired. Please log in again.");
      return;
    }

    if (!formData.owner_name.trim()) {
      alert("Owner name is required.");
      return;
    }

    setSaving(true);

    try {
      const payload: UpdateShopPayload = {
        user_id: userData.id,
        shop_name: formData.shop_name.trim() || null,
        owner_name: formData.owner_name.trim(),
        shop_address: formData.shop_address.trim() || null,
        business_type: formData.business_type.trim() || null,
        is_registration_complete: userData.is_registration_complete !== false,
      };

      const response = await api.post("/update-shop-details", payload);

      if (response.data?.success) {
        const updatedUser: UserData = {
          ...response.data.data.user,
          email: formData.email.trim() || null,
        };

        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUserData(updatedUser);

        alert("Settings saved successfully!");
      } else {
        alert(response.data?.message || "Failed to save settings.");
      }
    } catch (error: unknown) {
      console.error("Error saving settings:", error);

      if (axios.isAxiosError(error)) {
        const apiMessage =
          error.response?.data?.message ||
          (error.response?.data?.errors
            ? JSON.stringify(error.response.data.errors)
            : null);

        alert(apiMessage || "Failed to save settings. Please try again.");
      } else {
        alert("Failed to save settings. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("auth_token");

    if (onLogout) {
      onLogout();
    } else {
      window.location.href = "/";
    }
  };

  const toggleNotification = (key: keyof NotificationSettings) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const notificationDescriptions: Record<keyof NotificationSettings, string> = {
    lowStock: "Get notified when stock is low",
    paymentReminder: "Reminders for pending payments",
    newCustomer: "Notifications for new customers",
    dailySummary: "Daily business summary",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#22C55E] dark:text-green-400" />
      </div>
    );
  }

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
          Settings
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 hide-scrollbar">
        {/* Profile Section */}
        <div className="mb-6">
          <h2 className="text-base font-bold text-[#111827] dark:text-white mb-4">
            Profile
          </h2>

          <div className="space-y-4">
            {/* Shop Name */}
            <div>
              <label className="text-sm font-medium text-[#111827] dark:text-gray-200 mb-2 block">
                Shop Name
              </label>

              <div className="flex items-center gap-2 border border-[#E5E7EB] dark:border-gray-700 rounded-xl px-4 py-3 bg-white dark:bg-gray-800">
                <Building2 className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  value={formData.shop_name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      shop_name: e.target.value,
                    }))
                  }
                  placeholder="Enter shop name"
                  className="flex-1 outline-none bg-transparent text-[#111827] dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
            </div>

            {/* Owner Name */}
            <div>
              <label className="text-sm font-medium text-[#111827] dark:text-gray-200 mb-2 block">
                Owner Name
              </label>

              <div className="flex items-center gap-2 border border-[#E5E7EB] dark:border-gray-700 rounded-xl px-4 py-3 bg-white dark:bg-gray-800">
                <User className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  value={formData.owner_name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      owner_name: e.target.value,
                    }))
                  }
                  placeholder="Enter owner name"
                  className="flex-1 outline-none bg-transparent text-[#111827] dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
            </div>

            {/* Mobile */}
            <div>
              <label className="text-sm font-medium text-[#111827] dark:text-gray-200 mb-2 block">
                Mobile Number
              </label>

              <div className="flex items-center gap-2 border border-[#E5E7EB] dark:border-gray-700 rounded-xl px-4 py-3 bg-white dark:bg-gray-800">
                <Phone className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="tel"
                  value={formData.mobile_number}
                  disabled
                  className="flex-1 outline-none bg-transparent text-gray-500 dark:text-gray-400"
                />
              </div>

              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Mobile number cannot be changed
              </p>
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-[#111827] dark:text-gray-200 mb-2 block">
                Email (Optional)
              </label>

              <div className="flex items-center gap-2 border border-[#E5E7EB] dark:border-gray-700 rounded-xl px-4 py-3 bg-white dark:bg-gray-800">
                <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  placeholder="Enter email address"
                  className="flex-1 outline-none bg-transparent text-[#111827] dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="text-sm font-medium text-[#111827] dark:text-gray-200 mb-2 block">
                Shop Address
              </label>

              <div className="flex items-start gap-2 border border-[#E5E7EB] dark:border-gray-700 rounded-xl px-4 py-3 bg-white dark:bg-gray-800">
                <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-1 shrink-0" />
                <textarea
                  value={formData.shop_address}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      shop_address: e.target.value,
                    }))
                  }
                  placeholder="Enter shop address"
                  rows={3}
                  className="flex-1 outline-none bg-transparent text-[#111827] dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none"
                />
              </div>
            </div>

            {/* Business Type */}
            <div>
              <label className="text-sm font-medium text-[#111827] dark:text-gray-200 mb-2 block">
                Business Type
              </label>

              <select
                value={formData.business_type}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    business_type: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#111827] dark:text-white outline-none focus:ring-2 focus:ring-[#22C55E] dark:focus:ring-green-500"
              >
                <option value="">Select business type</option>
                <option value="grocery">Grocery</option>
                <option value="medical">Medical</option>
                <option value="general">General Store</option>
                <option value="restaurant">Restaurant</option>
                <option value="electronics">Electronics</option>
                <option value="clothing">Clothing</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Save */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 bg-[#22C55E] dark:bg-green-600 text-white hover:bg-[#16A34A] dark:hover:bg-green-700 shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        {/* Preferences */}
        <div className="mb-6">
          <h2 className="text-base font-bold text-[#111827] dark:text-white mb-4">
            Preferences
          </h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-xl border border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex items-center gap-3">
                {isDarkMode ? (
                  <Moon className="w-5 h-5 text-[#111827] dark:text-white" />
                ) : (
                  <Sun className="w-5 h-5 text-[#111827] dark:text-white" />
                )}

                <div>
                  <p className="text-sm font-medium text-[#111827] dark:text-white">
                    Dark Mode
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Toggle dark theme
                  </p>
                </div>
              </div>

              <button
                onClick={toggleTheme}
                className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                  isDarkMode
                    ? "bg-[#22C55E] dark:bg-green-600"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                    isDarkMode ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="mb-6">
          <h2 className="text-base font-bold text-[#111827] dark:text-white mb-4">
            Notifications
          </h2>

          <div className="space-y-3">
            {(
              Object.entries(notifications) as [
                keyof NotificationSettings,
                boolean,
              ][]
            ).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between p-4 rounded-xl border border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-800"
              >
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-[#111827] dark:text-white" />
                  <div>
                    <p className="text-sm font-medium text-[#111827] dark:text-white">
                      {key
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase())}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {notificationDescriptions[key]}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => toggleNotification(key)}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                    value
                      ? "bg-[#22C55E] dark:bg-green-600"
                      : "bg-gray-300 dark:bg-gray-600"
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                      value ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Account */}
        <div className="mb-6">
          <h2 className="text-base font-bold text-[#111827] dark:text-white mb-4">
            Account
          </h2>

          <div className="space-y-3">
            <button
              onClick={() => setShowLogoutModal(true)}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-medium">Logout</span>
              </div>
            </button>

            <button
              className="w-full flex items-center justify-between p-4 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200"
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure you want to delete your account? This action cannot be undone.",
                  )
                ) {
                  alert("Account deletion feature coming soon");
                }
              }}
            >
              <div className="flex items-center gap-3">
                <Trash2 className="w-5 h-5" />
                <span className="text-sm font-medium">Delete Account</span>
              </div>
            </button>
          </div>
        </div>

        {/* App Info */}
        <div className="text-center py-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Invocraft v1.0.0
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            © {new Date().getFullYear()} All rights reserved
          </p>
        </div>
      </div>

      {showLogoutModal && (
        <LogoutModal
          isOpen={showLogoutModal}
          onConfirm={handleLogout}
          onClose={() => setShowLogoutModal(false)}
        />
      )}
    </div>
  );
}
