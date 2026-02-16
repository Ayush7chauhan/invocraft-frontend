import { useState, useEffect } from "react";
import {
  Store,
  User,
  Phone,
  MapPin,
  CheckCircle2,
  Apple,
  Stethoscope,
  Store as StoreIcon,
  MoreHorizontal,
  ArrowRight,
  Loader2,
  CheckCircle,
} from "lucide-react";
import api from "../utils/api";

type SetupShopProps = {
  mobile: string;
  onContinue: () => void;
};

export default function SetupShop({ mobile, onContinue }: SetupShopProps) {
  const [shopName, setShopName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [shopAddress, setShopAddress] = useState("");
  const [businessType, setBusinessType] = useState<
    "grocery" | "medical" | "general" | "other" | null
  >(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const validate = () => {
      const newErrors: Record<string, string> = {};
      
      // Shop name is optional - no validation needed
      
      // Owner name is required
      if (!ownerName.trim()) {
        // Don't show error until user tries to submit
      } else if (ownerName.trim().length < 2) {
        newErrors.ownerName = "Owner name must be at least 2 characters";
      }

      // Shop address is optional, but if provided, validate length
      if (shopAddress.trim() && shopAddress.trim().length < 10) {
        newErrors.shopAddress = "Address must be at least 10 characters";
      }

      setErrors(newErrors);
      setIsFormValid(
        ownerName.trim().length >= 2 &&
        (!shopAddress.trim() || shopAddress.trim().length >= 10)
      );
    };

    validate();
  }, [shopName, ownerName, shopAddress]);

  const handleSubmit = async () => {
    // Validate before submit
    if (!ownerName.trim()) {
      setErrors({ ownerName: "Owner name is required" });
      return;
    }
    
    if (ownerName.trim().length < 2) {
      setErrors({ ownerName: "Owner name must be at least 2 characters" });
      return;
    }

    if (!isFormValid) return;

    setIsLoading(true);
    setErrors({});

    try {
      const tempUser = JSON.parse(localStorage.getItem('temp_user') || '{}');
      
      const payload: any = {
        user_id: tempUser.id,
        owner_name: ownerName.trim(),
        is_registration_complete: true
      };

      // Only include fields if they have values
      if (shopName.trim()) {
        payload.shop_name = shopName.trim();
      }
      if (shopAddress.trim()) {
        payload.shop_address = shopAddress.trim();
      }
      if (businessType) {
        payload.business_type = businessType;
      }

      const response = await api.post('/update-shop-details', payload);

      if (response.data.success) {
        setIsSuccess(true);
        
        // Store user data with token
        const userData = {
          ...response.data.data.user,
          token: response.data.data.token
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('auth_token', response.data.data.token);
        localStorage.removeItem('temp_user');
        localStorage.removeItem('temp_mobile');
        
        // Wait 1.5 seconds to show success, then navigate
        setTimeout(() => {
          onContinue();
        }, 1500);
      } else {
        setErrors({ submit: response.data.message || 'Failed to save shop details' });
      }
    } catch (err: any) {
      setErrors({ submit: err.response?.data?.message || 'Failed to save shop details. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const formatMobile = (mob: string) => {
    const clean = mob.replace(/\D/g, "");
    if (clean.length === 10) {
      return `+91 ${clean.slice(0, 5)} ${clean.slice(5)}`;
    }
    return mob;
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center justify-center px-4">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-[#22C55E] dark:bg-green-600 flex items-center justify-center mb-6 animate-bounce">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-[#111827] dark:text-white mb-2">
            Setup Complete!
          </h2>
          <p className="text-sm text-[#6B7280] dark:text-gray-400">
            Redirecting to dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center px-4 py-8 overflow-y-auto hide-scrollbar">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-[#22C55E] dark:bg-green-600 flex items-center justify-center mb-4">
            <Store className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#111827] dark:text-white">
            Set Up Your Shop
          </h1>
          <p className="text-sm text-[#6B7280] dark:text-gray-400 mt-2">
            Complete your profile to continue
          </p>
        </div>

        <div className="mt-8 border-t border-[#F3F4F6] dark:border-gray-800" />

        <div className="mt-6 space-y-5">
          <div>
            <label className="text-sm font-medium text-[#111827] dark:text-gray-200">
              Shop Name <span className="text-[#9CA3AF] dark:text-gray-500">(Optional)</span>
            </label>
            <div className={`mt-2 flex items-center border rounded-xl px-4 py-3 ${
              errors.shopName 
                ? "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20" 
                : "border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-800"
            }`}>
              <input
                type="text"
                placeholder="Enter your shop name (optional)"
                value={shopName}
                onChange={(e) => {
                  setShopName(e.target.value);
                  if (errors.shopName) {
                    setErrors(prev => ({ ...prev, shopName: "" }));
                  }
                }}
                className="w-full text-sm outline-none bg-transparent text-[#111827] dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
              <StoreIcon className="w-4 h-4 text-[#9CA3AF] dark:text-gray-500" />
            </div>
            {errors.shopName && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.shopName}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-[#111827] dark:text-gray-200">
              Owner Name <span className="text-[#EF4444] dark:text-red-400">*</span>
            </label>
            <div className={`mt-2 flex items-center border rounded-xl px-4 py-3 ${
              errors.ownerName 
                ? "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20" 
                : "border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-800"
            }`}>
              <input
                type="text"
                placeholder="Enter your full name"
                value={ownerName}
                onChange={(e) => {
                  setOwnerName(e.target.value);
                  if (errors.ownerName) {
                    setErrors(prev => ({ ...prev, ownerName: "" }));
                  }
                }}
                className="w-full text-sm outline-none bg-transparent text-[#111827] dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
              <User className="w-4 h-4 text-[#9CA3AF] dark:text-gray-500" />
            </div>
            {errors.ownerName && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.ownerName}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-[#111827] dark:text-gray-200">
              Mobile Number
            </label>
            <div className="mt-2 flex items-center gap-3 border border-[#E5E7EB] dark:border-gray-700 rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-800/50">
              <span className="text-sm text-[#6B7280] dark:text-gray-400">{formatMobile(mobile)}</span>
              <CheckCircle2 className="w-4 h-4 text-[#22C55E] dark:text-green-400" />
              <Phone className="w-4 h-4 text-[#9CA3AF] dark:text-gray-500" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-[#111827] dark:text-gray-200">
              Shop Address <span className="text-[#9CA3AF] dark:text-gray-500">(Optional)</span>
            </label>
            <div className={`mt-2 flex items-start border rounded-xl px-4 py-3 ${
              errors.shopAddress 
                ? "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20" 
                : "border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-800"
            }`}>
              <textarea
                placeholder="Enter your complete shop address"
                value={shopAddress}
                onChange={(e) => {
                  setShopAddress(e.target.value);
                  if (errors.shopAddress) {
                    setErrors(prev => ({ ...prev, shopAddress: "" }));
                  }
                }}
                rows={3}
                className="w-full text-sm outline-none bg-transparent text-[#111827] dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none"
              />
              <MapPin className="w-4 h-4 text-[#9CA3AF] dark:text-gray-500 mt-1 flex-shrink-0" />
            </div>
            {errors.shopAddress && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.shopAddress}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-[#111827] dark:text-gray-200">
              Business Type
            </label>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <TypeButton
                label="Grocery"
                icon={<Apple className="w-4 h-4" />}
                selected={businessType === "grocery"}
                onClick={() => setBusinessType("grocery")}
              />
              <TypeButton
                label="Medical"
                icon={<Stethoscope className="w-4 h-4" />}
                selected={businessType === "medical"}
                onClick={() => setBusinessType("medical")}
              />
              <TypeButton
                label="General Store"
                icon={<StoreIcon className="w-4 h-4" />}
                selected={businessType === "general"}
                onClick={() => setBusinessType("general")}
              />
              <TypeButton
                label="Other"
                icon={<MoreHorizontal className="w-4 h-4" />}
                selected={businessType === "other"}
                onClick={() => setBusinessType("other")}
              />
            </div>
          </div>
        </div>

        {errors.submit && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
          </div>
        )}

        <button
          className={`w-full mt-8 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition ${
            isFormValid && !isLoading
              ? "bg-[#86E2A8] dark:bg-green-600 text-white hover:bg-[#7ED3B3] dark:hover:bg-green-700"
              : "bg-[#E5E7EB] dark:bg-gray-700 text-[#9CA3AF] dark:text-gray-500 cursor-not-allowed"
          }`}
          onClick={handleSubmit}
          disabled={!isFormValid || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Continue to Dashboard
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <p className="text-center text-xs text-[#9CA3AF] dark:text-gray-500 mt-3">
          You can edit this later
        </p>
      </div>
    </div>
  );
}

function TypeButton({
  label,
  icon,
  selected,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm transition ${
        selected
          ? "border-[#22C55E] dark:border-green-500 text-[#16A34A] dark:text-green-400 bg-[#ECFDF3] dark:bg-green-900/30"
          : "border-[#E5E7EB] dark:border-gray-700 text-[#374151] dark:text-gray-300 bg-white dark:bg-gray-800 hover:border-[#22C55E] dark:hover:border-green-500"
      }`}
    >
      <span className="text-[#22C55E] dark:text-green-400">{icon}</span>
      {label}
    </button>
  );
}
