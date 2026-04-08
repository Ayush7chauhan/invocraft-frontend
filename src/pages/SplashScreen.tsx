import { useEffect, useRef, useState } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/ui/LoadingSpinner";

const LOGO_SRC = "/logo.png";
const SPLASH_DELAY = 1200;

export default function SplashScreen() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Initializing Core Engine...");
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const redirectTo = (destination: "auth" | "dashboard") => {
      timeoutRef.current = window.setTimeout(() => {
        navigate(destination === "dashboard" ? "/dashboard" : "/auth/login");
      }, SPLASH_DELAY);
    };

    const clearAuth = () => {
      localStorage.removeItem("user");
      localStorage.removeItem("auth_token");
    };

    const handleAuthFail = () => {
      clearAuth();
      setStatus("Re-authenticating...");
      redirectTo("auth");
    };

    const checkAuth = async () => {
      try {
        const userData = localStorage.getItem("user");
        const token = localStorage.getItem("auth_token");

        if (!userData || !token) {
          setStatus("Identity Required...");
          redirectTo("auth");
          return;
        }

        setStatus("Synchronizing Nodes...");
        const response = await api.post("/verify-token", { token });

        if (response.data?.success) {
          const user = response.data?.data?.user;
          if (user) {
            localStorage.setItem("user", JSON.stringify(user));
          }
          setStatus("System Online...");
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
  }, [navigate]);

  return (
    <div className="min-h-screen w-full bg-zinc-950 flex flex-col items-center justify-center relative overflow-hidden theme-transition">
      {/* Background Architectural Grid */}
      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05),transparent_70%)]" />

      {/* Central Identity Module */}
      <div className="flex flex-col items-center justify-center z-10 space-y-10 animate-in fade-in zoom-in duration-1000">
        <div className="relative group">
          <div className="absolute -inset-4 bg-emerald-500/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="h-24 w-24 rounded-2xl bg-white p-4 shadow-2xl relative">
             <img src={LOGO_SRC} alt="Invocraft" className="w-full h-full object-contain" />
          </div>
        </div>

        <div className="flex flex-col items-center space-y-2">
           <h1 className="text-3xl font-black text-white tracking-[0.3em] uppercase leading-none">INVOCRAFT</h1>
           <span className="text-emerald-500 font-black text-[9px] tracking-[0.5em] uppercase opacity-60">STRATEGIC BUSINESS PROTOCOL</span>
        </div>

        <div className="flex flex-col items-center space-y-4 pt-10">
           <LoadingSpinner size="md" variant="secondary" />
           <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.25em] animate-pulse">
              {status}
           </p>
        </div>
      </div>

      {/* Legalese Footer */}
      <div className="absolute bottom-12 text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">
         CORE_ENGINE: STABLE_V2.4.0
      </div>
    </div>
  );
}
