import { 
  LayoutDashboard, 
  Receipt, 
  Wallet, 
  Package, 
  Plus, 
  Users,
  Building2,
  Settings
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../lib/utils";

const items = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
  { icon: Receipt, label: "Ledger", href: "/khata" },
  { icon: Plus, label: "Record", href: "/bills", highlight: true },
  { icon: Package, label: "Inventory", href: "/products/new" },
  { icon: Settings, label: "Account", href: "/settings" },
];

export default function Footer() {
  const location = useLocation();

  return (
    <footer className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-t h-[72px] safe-area-inset-bottom">
      <div className="grid h-full grid-cols-5 items-center px-2">
        {items.map((item) => {
          const isActive = location.pathname === item.href;
          
          if (item.highlight) {
            return (
              <Link 
                key={item.label}
                to={item.href} 
                className="flex flex-col items-center justify-center group"
              >
                <div className="relative -top-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all duration-300">
                  <item.icon className="h-6 w-6" />
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={item.label}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1.5 transition-all duration-300 relative px-2",
                isActive ? "text-primary px-3" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive && "stroke-[2.5px]")} />
              <span className={cn("text-[9px] font-black uppercase tracking-[0.1em]", isActive && "text-primary font-black")}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </footer>
  );
}
