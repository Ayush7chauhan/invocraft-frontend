import { useEffect, useMemo, useState } from "react";
import { 
  ArrowLeft, 
  ShieldCheck, 
  RefreshCw, 
  CheckCircle2, 
  Lock, 
  Clock,
  Layers,
  ArrowRight
} from "lucide-react";
import axios from "axios";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

import Button from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/card";
import Badge from "../../components/ui/Badge";
import { cn } from "../../lib/utils";

const LOGO_SRC = "/logo.png";

export default function OTP() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const mobile = location.state?.mobile || localStorage.getItem("temp_mobile") || "IDENTIFIER_NULL";
  
  const onBack = () => navigate("/auth/login");

  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (timeLeft <= 0) return;
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

  const otpValue = otp.join("");

  const handleVerify = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (otpValue.length !== 6) {
      setError("Incomplete 6-digit verification token");
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
      const response = await api.post("/verify-otp", {
        mobile_number: cleanMobile,
        otp: otpValue,
      });

      if (response.data.success) {
        const user = response.data.data.user;
        const token = response.data.data.token;

        localStorage.setItem("temp_user", JSON.stringify(user));
        localStorage.setItem("temp_mobile", mobile);

        if (token) {
          localStorage.setItem("auth_token", token);
          localStorage.setItem("user", JSON.stringify(user));
        }

        if (user.is_registration_complete && token) {
          login({ ...user, is_setup_complete: true }, token);
          navigate("/dashboard");
        } else {
          login({ ...user, is_setup_complete: false }, token);
          navigate("/setup-shop");
        }
      } else {
        setError(response.data.message || "Invalid verification token");
        setOtp(["", "", "", "", "", ""]);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || "Verification failed. Node rejected token.");
      } else {
        setError("Verification protocol failure.");
      }
      setOtp(["", "", "", "", "", ""]);
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
      const response = await api.post("/resend-otp", {
        mobile_number: cleanMobile,
      });

      if (response.data.success) {
        setOtp(["", "", "", "", "", ""]);
        setTimeLeft(300);
      } else {
        setError(response.data.message || "Resend protocol rejected");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || "Resend node unreachable.");
      } else {
        setError("Resend failure.");
      }
    } finally {
      setIsResending(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleOtpChange = (value: string, index: number) => {
    const digit = value.replace(/\D/g, "");
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setError("");

    if (digit && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      (nextInput as HTMLInputElement | null)?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      (prevInput as HTMLInputElement | null)?.focus();
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background overflow-hidden theme-transition">
      {/* Left: Branding & Logic (Desktop) */}
      <div className="hidden md:flex flex-1 relative bg-zinc-950 items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        
        <div className="relative z-10 max-w-lg space-y-12 animate-in fade-in slide-in-from-left-8 duration-1000">
           <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-white flex items-center justify-center shadow-2xl shadow-emerald-500/20">
                 <img src={LOGO_SRC} alt="Invocraft" className="h-10 w-10 object-contain" />
              </div>
              <div className="flex flex-col">
                 <h1 className="text-3xl font-black text-white tracking-widest uppercase tracking-[0.2em] leading-none">INVOCRAFT</h1>
                 <span className="text-emerald-500 font-black text-[10px] tracking-[0.4em] uppercase mt-1.5 opacity-80">Security Control Hub</span>
              </div>
           </div>

           <div className="space-y-6">
              <h2 className="text-5xl font-black text-white tracking-tighter leading-[1.1]">Identity Validation Protocol.</h2>
              <p className="text-zinc-400 text-lg font-medium leading-relaxed max-w-md">
                 Multi-factor authentication via mobile registry tokens. 
                 Ensuring secure access to your strategic fiscal platform.
              </p>
           </div>

           <div className="flex items-center gap-6 pt-12 border-t border-zinc-800">
              <div className="flex items-center gap-2">
                 <Lock className="w-4 h-4 text-emerald-500" />
                 <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">AES-256</span>
              </div>
              <div className="flex items-center gap-2">
                 <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                 <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">MFA_ACTIVE</span>
              </div>
           </div>
        </div>

        <div className="absolute bottom-0 right-0 p-24 opacity-10">
           <Layers size={400} className="text-emerald-500" />
        </div>
      </div>

      {/* Right: OTP Interface */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative">
        {/* Mobile Header */}
        <div className="md:hidden absolute top-8 left-8 flex items-center gap-3">
           <button onClick={onBack} className="flex items-center justify-center h-8 w-8 rounded-full hover:bg-muted transition-colors">
              <ArrowLeft className="h-4 w-4" />
           </button>
           <div className="h-6 w-1 bg-border rounded-full mx-1" />
           <span className="font-black text-[10px] uppercase tracking-[0.2em] text-foreground">VALIDATION_NODE</span>
        </div>

        <div className="w-full max-w-sm space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
           <div className="space-y-3 text-center md:text-left">
              <Badge variant="outline" className="text-[9px] font-black h-5 px-3 uppercase tracking-widest bg-emerald-50 text-emerald-700 border-emerald-100">IDENTITY_CHALLENGE</Badge>
              <h3 className="text-3xl font-black text-foreground tracking-tighter">Enter Token</h3>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest leading-relaxed">
                 A cryptographic token has been synchronized with <span className="font-black text-foreground">{maskedMobile}</span>. 
                 Please register the digits below.
              </p>
           </div>

           <div className="space-y-8">
              <div className="flex justify-between gap-2 sm:gap-3 px-1">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, index)}
                    onKeyDown={(e) => handleOtpKeyDown(e, index)}
                    className="w-full h-14 text-center text-xl font-black border border-input rounded-md bg-background focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-sm outline-none"
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              {error && (
                 <p className="text-[10px] font-black text-destructive uppercase tracking-widest text-center animate-pulse">{error}</p>
              )}

              <div className="space-y-4">
                 <Button 
                    onClick={handleVerify}
                    disabled={otpValue.length !== 6 || isLoading}
                    isLoading={isLoading}
                    className="w-full h-14 rounded-md font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-emerald-500/20 group overflow-hidden relative"
                 >
                    VERIFY & INITIALIZE <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                 </Button>

                 <div className="flex flex-col items-center gap-4 pt-4">
                    <div className="flex items-center gap-2">
                       <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                       <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Resend available: {formatTimer(timeLeft)}</span>
                    </div>
                    
                    <button
                      className={cn(
                        "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all",
                        timeLeft === 0 
                          ? "text-emerald-600 hover:text-emerald-700 hover:translate-y-[-1px]" 
                          : "text-muted-foreground/40 cursor-not-allowed"
                      )}
                      onClick={handleResend}
                      disabled={timeLeft !== 0 || isResending}
                    >
                      <RefreshCw className={cn("w-3.5 h-3.5", isResending && "animate-spin")} />
                      {isResending ? "RE-DISPATCHING..." : "RE-DISPATCH TOKEN"}
                    </button>
                 </div>
              </div>
           </div>

           <div className="pt-8 flex items-center justify-between border-t border-zinc-100">
              <button 
                onClick={onBack}
                className="flex items-center gap-2 text-[9px] font-black text-muted-foreground hover:text-foreground uppercase tracking-widest transition-colors"
              >
                 <ArrowLeft size={12} /> RE-CONFIGURE IDENTIFIER
              </button>
              <div className="flex items-center gap-2">
                 <ShieldCheck size={14} className="text-emerald-500" />
                 <span className="text-[9px] font-black text-muted-foreground uppercase opacity-40">ENCRYPTED_NODE</span>
              </div>
           </div>
        </div>

        {/* Footer Credit */}
        <div className="absolute bottom-8 text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-30">
           ID_PROTOCOL: V2.4-STABLE
        </div>
      </div>
    </div>
  );
}
