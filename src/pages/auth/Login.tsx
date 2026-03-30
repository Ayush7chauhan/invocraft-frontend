import { useState, useMemo, useEffect } from "react";
import {
  Phone,
  Clock,
  Lock,
  Smartphone,
  CircleAlert,
  ShieldCheck,
} from "lucide-react";

// Use logo from public so replacing public/logo.png updates login + favicon
const LOGO_SRC = "/logo.png";

export default function Login() {
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");

  // Add styles to head
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes login-card-in {
        0% {
          opacity: 0;
          transform: translateY(24px) scale(0.96);
        }
        100% {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      @keyframes login-logo-in {
        0% {
          opacity: 0;
          transform: scale(0.5);
        }
        70% {
          transform: scale(1.08);
        }
        100% {
          opacity: 1;
          transform: scale(1);
        }
      }
      @keyframes login-logo-float {
        0%, 100% {
          transform: translateY(0) scale(1);
        }
        50% {
          transform: translateY(-8px) scale(1.02);
        }
      }
      @keyframes login-logo-glow {
        0%, 100% {
          box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.2);
        }
        50% {
          box-shadow: 0 0 24px 4px rgba(34, 197, 94, 0.15);
        }
      }
      @keyframes login-stagger {
        0% {
          opacity: 0;
          transform: translateY(10px);
        }
        100% {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes login-feature-in {
        0% {
          opacity: 0;
          transform: translateY(6px);
        }
        100% {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .login-card {
        animation: login-card-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      }
      .login-logo {
        animation: login-logo-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      }
      .login-logo-float {
        animation: login-logo-float 3s ease-in-out 0.7s infinite;
      }
      .login-logo-wrap {
        animation: login-logo-glow 2.5s ease-in-out infinite;
      }
      .login-stagger-1 { opacity: 0; animation: login-stagger 0.4s ease-out 0.2s forwards; }
      .login-stagger-2 { opacity: 0; animation: login-stagger 0.4s ease-out 0.3s forwards; }
      .login-stagger-3 { opacity: 0; animation: login-stagger 0.4s ease-out 0.4s forwards; }
      .login-stagger-4 { opacity: 0; animation: login-stagger 0.4s ease-out 0.5s forwards; }
      .login-feature-1 { opacity: 0; animation: login-feature-in 0.35s ease-out 0.7s forwards; }
      .login-feature-2 { opacity: 0; animation: login-feature-in 0.35s ease-out 0.85s forwards; }
      .login-feature-3 { opacity: 0; animation: login-feature-in 0.35s ease-out 1s forwards; }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Validation
  const isValidMobile = useMemo(() => {
    return /^[6-9]\d{9}$/.test(mobile);
  }, [mobile]);

  const handleSubmit = () => {
    if (!isValidMobile) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    setError("");
    alert("OTP Sent");
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 px-4 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(34,197,94,0.08),transparent)] dark:bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(34,197,94,0.06),transparent)] pointer-events-none" />

        {/* Card */}
        <div className="login-card relative z-10 w-full max-w-sm min-h-[550px] max-h-[600px] bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 p-6 flex flex-col justify-between border border-gray-100 dark:border-gray-700">
          {/* Top */}
          <div>
            {/* Logo */}
            <div className="flex justify-center mb-4">
              <div className="login-logo-wrap rounded-2xl p-1">
                <img
                  src={LOGO_SRC}
                  alt="Invocraft Logo"
                  className="login-logo login-logo-float h-20 w-20 rounded-2xl object-contain drop-shadow-lg"
                />
              </div>
            </div>

            {/* App name */}
            <h1 className="login-stagger-1 text-center text-2xl font-bold text-green-600 dark:text-green-400">
              Invocraft
            </h1>

            {/* Title */}
            <h2 className="login-stagger-2 text-center text-lg font-semibold mt-4 text-gray-800 dark:text-gray-100">
              Login with Mobile Number
            </h2>

            <p className="login-stagger-3 text-center text-sm text-gray-500 dark:text-gray-400 mt-1">
              We will send you a one-time password (OTP)
            </p>

            {/* Input */}
            <div className="login-stagger-4 mt-8">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Mobile Number
              </label>

              <div
                className={`
                  flex items-center gap-2
                  border rounded-lg mt-2 px-3 py-3
                  transition
                  ${
                    error
                      ? "border-red-500 ring-1 ring-red-200"
                      : "focus-within:border-green-600 focus-within:ring-2 focus-within:ring-green-100"
                  }
                `}
              >
                <Phone size={18} className="text-gray-400" />
                <span className="text-gray-600 dark:text-gray-300 text-sm">
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
                  className="w-full outline-none text-sm bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400"
                />
              </div>

              {/* Error */}
              {error && <p className="text-xs text-red-500 mt-2">{error}</p>}

              {!error && (
                <div className="flex justify-start items-center gap-1 mt-2 text-green-600">
                  <CircleAlert className="w-5 h-5 pt-1" />
                  <p className="text-xs text-gray-400 mt-1">
                    OTP will be sent via SMS
                  </p>
                </div>
              )}
            </div>

            {/* Button */}
            <button
              onClick={handleSubmit}
              disabled={!mobile}
              className="
                w-full mt-8 py-3 rounded-lg font-semibold
                bg-green-600 text-white
                hover:bg-green-700
                active:scale-95
                disabled:bg-green-300 disabled:cursor-not-allowed
                transition-all duration-200
              "
            >
              Get OTP
            </button>

            <ShieldCheck className="mx-auto mt-4 text-green-600 dark:text-green-400" />
            <p className="text-center text-sm text-gray-600 dark:text-gray-300 mt-4">
              Secure & Fast Login
            </p>
          </div>

          {/* Footer */}
          <div>
            <p className="text-center text-xs text-gray-400">
              By continuing, you agree to our{" "}
              <span className="text-green-600 hover:underline cursor-pointer">
                Terms of Service
              </span>{" "}
              and{" "}
              <span className="text-green-600 hover:underline cursor-pointer">
                Privacy Policy
              </span>
            </p>

            {/* Feature icons */}
            <div className="grid grid-cols-3 gap-4 mt-6 w-full max-w-xs mx-auto">
              <Feature
                icon={<Clock size={22} />}
                label="Quick Login"
                className="login-feature-1"
              />
              <Feature
                icon={<Lock size={22} />}
                label="Secure"
                className="login-feature-2"
              />
              <Feature
                icon={<Smartphone size={22} />}
                label="No Password"
                className="login-feature-3"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* Reusable mini component */
function Feature({
  icon,
  label,
  className = "",
}: {
  icon: React.ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center min-w-0 ${className}`}
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700/60 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-gray-700 hover:scale-105 transition-all duration-200 shrink-0">
        {icon}
      </div>
      <p className="text-xs mt-2 text-center text-gray-600 dark:text-gray-400 font-medium leading-tight">
        {label}
      </p>
    </div>
  );
}
