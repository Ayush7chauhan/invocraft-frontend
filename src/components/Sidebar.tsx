import { useState } from "react";
import { 
  BarChart3, 
  Package, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  LayoutDashboard,
  ChevronDown,
  Users,
  Receipt,
  Wallet
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { cn } from "../lib/utils";
import Button from "./ui/Button";

type NavItem = {
  title: string;
  href?: string;
  icon: any;
  items?: { title: string; href: string }[];
};

const mainNav: NavItem[] = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Financials",
    icon: BarChart3,
    items: [
      { title: "Credit Ledger", href: "/khata" },
      { title: "Personal Ledger", href: "/personal-expense" },
      { title: "Invoices & Bills", href: "/bills" },
    ],
  },
  {
    title: "Inventory",
    icon: Package,
    items: [
      { title: "Catalog", href: "/products/new" },
      { title: "Classifications", href: "/products/categories" },
    ],
  },
  {
    title: "Network",
    href: "/parties/new",
    icon: Users,
  },
  {
    title: "Intelligence",
    href: "/reports",
    icon: BarChart3,
  },
];

const secondaryNav: NavItem[] = [
  {
    title: "Configuration",
    href: "/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(["Financials", "Inventory"]);

  const toggleExpand = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    );
  };

  const isActive = (href?: string) => href && location.pathname === href;
  const isChildActive = (items?: { href: string }[]) => items?.some(item => location.pathname === item.href);

  const signMember = user?.owner_name || "Account Owner";
  const shopDescriptor = user?.shop_name || "Enterprise Portal";

  return (
    <>
      {/* Mobile Trigger */}
      <div className="lg:hidden sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b bg-background/80 backdrop-blur-md px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 px-4">
        <button
          type="button"
          className="-m-2.5 p-2.5 text-muted-foreground lg:hidden"
          onClick={() => setIsOpen(true)}
        >
          <Menu className="h-6 w-6" aria-hidden="true" />
        </button>
        <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
          <div className="flex-1 flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-black text-xs">IV</div>
            <span className="font-bold text-sm tracking-tight uppercase tracking-widest">{shopDescriptor}</span>
          </div>
        </div>
      </div>

      {/* Sidebar background overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-background border-r transition-all duration-300 ease-in-out lg:static lg:translate-x-0 outline-none",
        !isOpen && "-translate-x-full"
      )}>
        <div className="flex h-16 shrink-0 items-center justify-between border-b px-6">
          <Link to="/dashboard" className="flex items-center gap-3 group" onClick={() => setIsOpen(false)}>
            <div className="h-9 w-9 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-black text-sm group-hover:scale-95 transition-transform">IV</div>
            <div className="flex flex-col">
              <span className="font-bold text-sm leading-none tracking-tight uppercase tracking-[0.2em]">INVOCRAFT</span>
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mt-0.5">Enterprise v2</span>
            </div>
          </Link>
          <button className="lg:hidden p-2 text-muted-foreground hover:bg-muted rounded-md" onClick={() => setIsOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col overflow-y-auto px-4 py-6 custom-scrollbar gap-8">
          {/* Main Navigation */}
          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground px-2">Navigation Core</p>
            <ul className="space-y-1">
              {mainNav.map((item) => (
                <li key={item.title}>
                  {item.items ? (
                    <div className="space-y-1">
                      <button
                        onClick={() => toggleExpand(item.title)}
                        className={cn(
                          "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent/50 hover:text-accent-foreground",
                          (isChildActive(item.items) || expandedItems.includes(item.title)) ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </div>
                        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", expandedItems.includes(item.title) && "rotate-180")} />
                      </button>
                      {expandedItems.includes(item.title) && (
                        <ul className="ml-7 space-y-1 mt-1 border-l pl-2 animate-in slide-in-from-top-2 duration-200">
                          {item.items.map((subItem) => (
                            <li key={subItem.href}>
                              <Link
                                to={subItem.href}
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                  "block rounded-md px-3 py-1.5 text-[13px] font-medium transition-all duration-200",
                                  isActive(subItem.href) 
                                    ? "bg-accent text-accent-foreground font-semibold" 
                                    : "text-muted-foreground hover:text-foreground"
                                )}
                              >
                                {subItem.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <Link
                      to={item.href!}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
                        isActive(item.href) 
                          ? "bg-primary text-primary-foreground shadow-sm" 
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.title}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Secondary Navigation */}
          <div className="space-y-4">
             <p className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground px-2">Management</p>
             <ul className="space-y-1">
               {secondaryNav.map((item) => (
                 <li key={item.title}>
                    <Link
                      to={item.href!}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
                        isActive(item.href) 
                          ? "bg-primary text-primary-foreground shadow-sm" 
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.title}
                    </Link>
                 </li>
               ))}
             </ul>
          </div>
        </nav>

        {/* Action Footer */}
        <div className="mt-auto border-t p-4 bg-muted/30">
          <div className="flex items-center gap-4 mb-4 px-2">
            <div className="h-10 w-10 rounded-md bg-accent flex items-center justify-center text-xs font-black uppercase overflow-hidden border shadow-sm">
                <img src={`https://ui-avatars.com/api/?name=${signMember}&background=transparent&color=27272a&bold=true`} alt="Avatar" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-[11px] font-black uppercase tracking-widest text-foreground truncate">{signMember}</span>
              <span className="text-[9px] font-bold text-muted-foreground uppercase truncate tracking-widest leading-none mt-1">{shopDescriptor}</span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-1">
             <Button variant="ghost" size="sm" className="flex-1 text-xs font-black uppercase tracking-[0.2em] h-9 gap-2 hover:bg-destructive/10 hover:text-destructive" onClick={logout}>
                <LogOut className="h-3.5 w-3.5" /> LOGOUT
             </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
