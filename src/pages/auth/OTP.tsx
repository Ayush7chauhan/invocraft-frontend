import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Zap, Loader2 } from "lucide-react";
import api from "../../utils/api";

type OTPProps = {
  mobile: string;
  onBack: () => void;
  onVerify: (requiresRegistration: boolean) => void;
};

export default function OTP({ mobile, onBack, onVerify }: OTPProps) {
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (timeLeft === 0) return;
    const timer = window.setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [timeLeft]);

  const maskedMobile = useMemo(() => {
    const digits = mobile.replace(/\D/g, "");
    if (digits.length === 10) {
      return `+91 ${digits.slice(0, 2)}XXXXXX${digits.slice(-2)}`;
    }
    return `+91 ${mobile}`;
  }, [mobile]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError("Please enter complete 6-digit OTP");
      return;
    }

    const cleanMobile = mobile.replace(/\D/g, "");
    if (cleanMobile.length !== 10) {
      onBack();
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await api.post('/verify-otp', {
        mobile_number: cleanMobile,
        otp: otp
      });

      if (response.data.success) {
        const user = response.data.data.user;
        const token = response.data.data.token;
        
        localStorage.setItem('temp_user', JSON.stringify(user));
        localStorage.setItem('temp_mobile', mobile);
        
        // If token is provided (user already registered), store it
        if (token) {
          localStorage.setItem('auth_token', token);
          localStorage.setItem('user', JSON.stringify(user));
        }
        
        // Check if registration is complete
        if (user.is_registration_complete && token) {
          // User is already registered, go directly to dashboard
          onVerify(false); // false = no registration needed, go to dashboard
        } else {
          // User needs to complete registration
          onVerify(true); // true = requires registration, go to setup
        }
      } else {
        setError(response.data.message || 'Invalid OTP');
        setOtp("");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
      setOtp("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    const cleanMobile = mobile.replace(/\D/g, "");
    if (cleanMobile.length !== 10) {
      onBack();
      return;
    }

    setIsResending(true);
    setError("");

    try {
      const response = await api.post('/resend-otp', {
        mobile_number: cleanMobile
      });

      if (response.data.success) {
        setOtp("");
        setTimeLeft(300);
      } else {
        setError(response.data.message || 'Failed to resend OTP');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      <div className="px-4 py-4 flex items-center gap-3 border-b border-[#F3F4F6] dark:border-gray-800">
        <button
          className="w-8 h-8 flex items-center justify-center"
          onClick={onBack}
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-[#111827] dark:text-white" />
        </button>
        <h1 className="text-base font-semibold text-[#111827] dark:text-white">Verify OTP</h1>
      </div>

      <div className="flex-1 flex flex-col items-center text-center px-6 pt-10">
        <h2 className="text-2xl font-bold text-[#111827] dark:text-white mb-3">Enter OTP</h2>
        <p className="text-sm text-[#6B7280] dark:text-gray-400">
          Enter the 6-digit OTP sent to
        </p>
        <p className="text-sm font-semibold text-[#111827] dark:text-white mt-1">
          {maskedMobile}
        </p>

        {error && (
          <div className="w-full max-w-sm mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="flex gap-3 mt-8">
          {[...Array(6)].map((_, index) => (
            <input
              key={index}
              type="text"
              maxLength={1}
              value={otp[index] || ""}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                const target = e.target as HTMLInputElement;
                if (!val) {
                  const newOtp = otp.substring(0, index) + otp.substring(index + 1);
                  setOtp(newOtp);
                  const prev = target.previousElementSibling as HTMLInputElement;
                  if (prev) prev.focus();
                  return;
                }
                const newOtp =
                  otp.substring(0, index) + val + otp.substring(index + 1);
                setOtp(newOtp);
                setError("");
                const next = target.nextElementSibling as HTMLInputElement;
                if (next) next.focus();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Backspace' && !otp[index] && index > 0) {
                  const target = e.target as HTMLInputElement;
                  const prev = target.previousElementSibling as HTMLInputElement;
                  if (prev) prev.focus();
                }
              }}
              className="w-12 h-12 text-center text-lg font-semibold border border-[#E5E7EB] dark:border-gray-700 rounded-lg focus:border-[#34D399] dark:focus:border-green-500 focus:ring-2 focus:ring-[#D1FAE5] dark:focus:ring-green-900/50 outline-none bg-white dark:bg-gray-800 text-[#111827] dark:text-white"
              autoFocus={index === 0}
            />
          ))}
        </div>

        <p className="text-sm text-[#6B7280] dark:text-gray-400 mt-6">
          Resend OTP in{" "}
          <span className="font-semibold text-[#111827] dark:text-white">
            {formatTimer(timeLeft)}
          </span>
        </p>
        <button
          className={`text-sm mt-3 ${
            timeLeft === 0
              ? "text-[#34D399] dark:text-green-400 font-semibold"
              : "text-[#9CA3AF] dark:text-gray-500 cursor-not-allowed"
          }`}
          onClick={handleResend}
          disabled={timeLeft !== 0 || isResending}
        >
          {isResending ? 'Sending...' : 'Resend OTP'}
        </button>

        <button
          onClick={handleVerify}
          disabled={otp.length !== 6 || isLoading}
          className={`w-full max-w-sm mt-8 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition ${
            otp.length === 6 && !isLoading
              ? "bg-[#7ED3B3] dark:bg-green-600 text-white hover:bg-[#6EC9A3] dark:hover:bg-green-700"
              : "bg-[#E5E7EB] dark:bg-gray-700 text-[#9CA3AF] dark:text-gray-500 cursor-not-allowed"
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Verifying...
            </>
          ) : (
            'Verify & Login'
          )}
        </button>
      </div>

      <div className="py-8 flex flex-col items-center text-center">
        <div className="w-10 h-10 bg-[#22C55E] dark:bg-green-600 rounded-xl flex items-center justify-center mb-2">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <p className="text-sm font-semibold text-[#111827] dark:text-white">
          Invocraft
        </p>
        <p className="text-xs text-[#6B7280] dark:text-gray-400">Secure &amp; Fast Verification</p>
      </div>
    </div>
  );
}
