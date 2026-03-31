import { useEffect, useRef, useState } from "react";
import api from "../utils/api";

const LOGO_SRC = "/logo.png";
const SPLASH_DELAY = 1500;

type SplashScreenProps = {
  onComplete: (redirectTo: "home" | "dashboard") => void;
};

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isChecking, setIsChecking] = useState(true);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const redirectTo = (destination: "home" | "dashboard") => {
      timeoutRef.current = window.setTimeout(() => {
        setIsChecking(false);
        onComplete(destination);
      }, SPLASH_DELAY);
    };

    const clearAuth = () => {
      localStorage.removeItem("user");
      localStorage.removeItem("auth_token");
    };

    const handleAuthFail = () => {
      clearAuth();
      redirectTo("home");
    };

    const checkAuth = async () => {
      try {
        const userData = localStorage.getItem("user");
        const token = localStorage.getItem("auth_token");

        if (!userData || !token) {
          redirectTo("home");
          return;
        }

        const response = await api.post("/verify-token", { token });

        if (response.data?.success) {
          const user = response.data?.data?.user;

          if (user) {
            localStorage.setItem("user", JSON.stringify(user));
          }

          redirectTo("dashboard");
        } else {
          handleAuthFail();
        }
      } catch {
        handleAuthFail();
      }
    };

    void checkAuth();

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [onComplete]);

  return (
    <>
      <style>{`
        @keyframes splash-logo-in {
          0% {
            opacity: 0;
            transform: scale(0.6);
          }
          70% {
            transform: scale(1.05);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes splash-float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
        }
        @keyframes splash-title-in {
          0% {
            opacity: 0;
            transform: translateY(16px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes splash-subtitle-in {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
        @keyframes loading-dot {
          0%, 80%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          40% {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes loading-bar {
          0% {
            width: 0%;
            opacity: 0.8;
          }
          50% {
            width: 70%;
            opacity: 1;
          }
          100% {
            width: 100%;
            opacity: 0.8;
          }
        }
        .splash-logo {
          animation: splash-logo-in 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .splash-logo-float {
          animation: splash-float 3s ease-in-out infinite;
        }
        .splash-title {
          opacity: 0;
          animation: splash-title-in 0.6s ease-out 0.35s forwards;
        }
        .splash-subtitle {
          opacity: 0;
          animation: splash-subtitle-in 0.5s ease-out 0.6s forwards;
        }
        .loading-dot-1 {
          animation: loading-dot 1.4s infinite;
          animation-delay: 0s;
        }
        .loading-dot-2 {
          animation: loading-dot 1.4s infinite;
          animation-delay: 0.2s;
        }
        .loading-dot-3 {
          animation: loading-dot 1.4s infinite;
          animation-delay: 0.4s;
        }
        .splash-loading-bar {
          animation: loading-bar 1.5s ease-in-out infinite;
        }
      `}</style>

      <div className="relative min-h-screen w-full bg-[linear-gradient(to_bottom_right,#F8F9FB,#EEF5EE,#F8F9FB)] dark:bg-[linear-gradient(to_bottom_right,#111827,#111827,#1F2937)] flex flex-col items-center justify-center px-4 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(34,197,94,0.12),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(34,197,94,0.08),transparent)] pointer-events-none" />

        {/* Central Content */}
        <div className="flex flex-col items-center justify-center flex-1 relative z-10">
          {/* Logo */}
          <div className="mb-6 relative splash-logo">
            <div className="splash-logo-float">
              <img
                src={LOGO_SRC}
                alt="Invocraft"
                className="w-24 h-24 rounded-2xl object-contain drop-shadow-lg"
              />
            </div>
          </div>

          {/* Main Title */}
          <h1 className="splash-title text-3xl font-bold text-[#2D3748] dark:text-white mb-2 text-center">
            Invocraft
          </h1>

          {/* Subtitle */}
          <p className="splash-subtitle text-base text-[#4A5568] dark:text-gray-400 font-medium mb-10 text-center">
            Simple billing and invoice management
          </p>

          {/* Loading bar + dots */}
          <div className="flex flex-col items-center gap-3 w-full max-w-[200px]">
            <div className="h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="splash-loading-bar h-full bg-[#22C55E] dark:bg-green-500 rounded-full" />
            </div>

            <div className="flex gap-2">
              <div className="w-2 h-2 bg-[#22C55E] dark:bg-green-500 rounded-full loading-dot-1" />
              <div className="w-2 h-2 bg-[#22C55E] dark:bg-green-500 rounded-full loading-dot-2" />
              <div className="w-2 h-2 bg-[#22C55E] dark:bg-green-500 rounded-full loading-dot-3" />
            </div>

            <p className="text-sm text-[#718096] dark:text-gray-400 mt-0.5">
              {isChecking ? "Checking authentication..." : "Loading..."}
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="pb-8 relative z-10">
          <p className="text-xs text-[#A0AEC0] dark:text-gray-500 text-center">
            © {new Date().getFullYear()} Invocraft
          </p>
        </div>
      </div>
    </>
  );
}
