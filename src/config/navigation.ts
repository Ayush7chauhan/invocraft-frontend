import {
  LayoutDashboard,
  BookOpen,
  PlusSquare,
  ListOrdered,
  Wallet,
  ReceiptText,
  Contact,
  UsersRound,
  UserPlus,
  PackageSearch,
  PackagePlus,
  Tags,
  FolderOpen,
  Receipt,
  FilePlus,
  Settings as SettingsIcon,
  type LucideIcon
} from "lucide-react";

export type NavItem = {
  title: string;
  href?: string;
  icon?: LucideIcon;
  items?: NavItem[];
  state?: Record<string, unknown>;
};

export const NAVIGATION_CONFIG: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Khata Book",
    icon: BookOpen,
    items: [
      { title: "Khata Book Entry", href: "/khata-book/entry", icon: PlusSquare },
      { title: "Khata Book Transactions", href: "/khata-book/transactions", icon: ListOrdered },
    ],
  },
  {
    title: "Personal Transactions",
    icon: Wallet,
    items: [
      { title: "Expenses & Purchases", href: "/personal/expenses", icon: ReceiptText },
      { title: "Personal Contacts", href: "/personal/contacts", icon: Contact },
    ],
  },
  {
    title: "Parties & Ledger",
    icon: UsersRound,
    items: [
      { title: "New Party", href: "/parties/new", icon: UserPlus, state: { initialShowForm: true } },
    ],
  },
  {
    title: "Products",
    icon: PackageSearch,
    items: [
      { title: "New Product", href: "/products/new", icon: PackagePlus, state: { initialShowForm: true } },
      { title: "New Category", href: "/products/categories", icon: Tags, state: { initialShowForm: true } },
      { title: "Categories", href: "/products/categories", icon: FolderOpen },
    ],
  },
  {
    title: "Bill",
    icon: Receipt,
    items: [
      { title: "Bills & Invoices", href: "/bills", icon: Receipt },
      { title: "Create Invoice", href: "/bills/create", icon: FilePlus },
    ],
  },
  {
    title: "Settings",
    href: "/settings",
    icon: SettingsIcon,
  },
];
