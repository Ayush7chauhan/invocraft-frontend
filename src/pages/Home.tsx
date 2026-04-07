import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import axios from "axios";
import {
  Send,
  ShieldCheck,
  Clock,
  Lock,
  Smartphone,
  CircleAlert,
  Loader2,
} from "lucide-react";

export default function Home() {
  const [mobile, setMobile] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();


  const isValidMobile = useMemo(() => /^[6-9]\d{9}$/.test(mobile), [mobile]);

  const handleSubmit = async () => {
    if (!isValidMobile) return;

    setIsLoading(true);
    setError("");

    const startTime = Date.now();

    try {
      const response = await api.post("/send-otp", {
        mobile_number: mobile,
      });

      const elapsed = Date.now() - startTime;
      const minDelay = 1500;
      if (elapsed < minDelay) {
        await new Promise((resolve) => setTimeout(resolve, minDelay - elapsed));
      }

      if (response.data.success) {
        localStorage.setItem("temp_mobile", mobile);
        navigate("/otp");
      } else {
        setError(response.data.message || "Failed to send OTP");
      }
    } catch (err: unknown) {
      const elapsed = Date.now() - startTime;
      const minDelay = 1500;
      if (elapsed < minDelay) {
        await new Promise((resolve) => setTimeout(resolve, minDelay - elapsed));
      }

      setError(
        axios.isAxiosError(err)
          ? (err.response?.data?.message ??
              "Failed to send OTP. Please try again.")
          : "Failed to send OTP. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-[#22C55E] dark:bg-green-600 rounded-2xl shadow-md flex items-center justify-center mb-4">
          <img src="/logo.png" alt="Invocraft Logo" className="w-full h-full" />
        </div>

        <h1 className="text-xl font-bold text-[#1F2937] dark:text-white mb-6">
          Invocraft
        </h1>

        <h2 className="text-lg font-semibold text-[#1F2937] dark:text-gray-100 mb-1">
          Login with Mobile Number
        </h2>
        <p className="text-sm text-[#6B7280] dark:text-gray-400 mb-8">
          We will send you a one-time password (OTP)
        </p>

        {error && (
          <div className="w-full mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="w-full text-left">
          <label className="text-sm font-medium text-[#1F2937] dark:text-gray-200">
            Mobile Number
          </label>
          <div className="mt-2 flex items-center border border-[#E5E7EB] dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800">
            <span className="px-4 py-3 text-sm text-[#6B7280] dark:text-gray-400 border-r border-[#E5E7EB] dark:border-gray-700">
              +91
            </span>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={mobile}
              onChange={(e) => {
                setMobile(e.target.value.replace(/\D/g, ""));
                setError("");
              }}
              placeholder="Enter 10-digit mobile number"
              className="w-full px-4 py-3 text-sm outline-none bg-transparent text-[#1F2937] dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              autoFocus
            />
          </div>

          <div className="flex items-center gap-2 mt-3 text-[#16A34A] dark:text-green-400">
            <CircleAlert className="w-4 h-4" />
            <span className="text-xs text-[#6B7280] dark:text-gray-400">
              OTP will be sent via SMS
            </span>
          </div>
        </div>

        <button
          className={`w-full mt-8 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition ${
            isValidMobile && !isLoading
              ? "bg-[#86E2A8] dark:bg-green-600 text-white hover:bg-[#7ED3B3] dark:hover:bg-green-700"
              : "bg-[#E5E7EB] dark:bg-gray-700 text-[#9CA3AF] dark:text-gray-500 cursor-not-allowed"
          }`}
          disabled={!isValidMobile || isLoading}
          onClick={handleSubmit}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Get OTP
            </>
          )}
        </button>

        <div className="flex items-center gap-2 mt-8 text-[#16A34A] dark:text-green-400">
          <ShieldCheck className="w-5 h-5" />
          <span className="text-sm text-[#374151] dark:text-gray-300">
            Secure &amp; Fast Login
          </span>
        </div>

        <div className="mt-8 text-xs text-[#6B7280] dark:text-gray-400">
          <p>By continuing, you agree to our</p>
          <p className="text-[#22C55E] dark:text-green-400 underline mt-1">
            Terms of Service
          </p>
          <p className="mt-1">and</p>
          <p className="text-[#22C55E] dark:text-green-400 underline mt-1">
            Privacy Policy
          </p>
        </div>

        <div className="w-full border-t border-[#F3F4F6] dark:border-gray-800 mt-8 pt-6 flex justify-between">
          <Feature icon={<Clock className="w-5 h-5" />} label="Quick Login" />
          <Feature icon={<Lock className="w-5 h-5" />} label="Secure" />
          <Feature
            icon={<Smartphone className="w-5 h-5" />}
            label="No Password"
          />
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center text-[#374151] dark:text-gray-300">
      <div className="w-10 h-10 rounded-xl bg-[#ECFDF3] dark:bg-green-900/30 flex items-center justify-center text-[#22C55E] dark:text-green-400">
        {icon}
      </div>
      <span className="text-xs mt-2">{label}</span>
    </div>
  );
}
