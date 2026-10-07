import type { LucideIcon } from "lucide-react";
import {
  FolderTree,
  LayoutDashboard,
  Megaphone,
  Settings,
  ShoppingBag,
  Truck,
  Users,
  ShieldCheck,
} from "lucide-react";

export type AdminNavChild = {
  title: string;
  href: string;
  requiredPermission?: string | string[];
};

export type AdminNavItem = {
  title: string;
  href: string;
  icon?: LucideIcon;
  badge?: string;
  requiredPermission?: string | string[];
  children?: AdminNavChild[];
};

export const adminNavigation: AdminNavItem[] = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
  {
    title: "Catalog",
    href: "/admin/catalog",
    icon: FolderTree,
    requiredPermission: [
      "products:read:any",
      "categories:read:any",
      "brands:read:any",
      "attributes:read:any",
      "inventory:read:any",
    ],
    children: [
      { title: "Products", href: "/admin/products", requiredPermission: "products:read:any" },
      { title: "Categories", href: "/admin/catalog/categories", requiredPermission: "categories:read:any" },
      { title: "Brands", href: "/admin/brands", requiredPermission: "brands:read:any" },
      { title: "Attributes", href: "/admin/attributes", requiredPermission: "attributes:read:any" },
      { title: "Variants", href: "/admin/variants", requiredPermission: "products:read:any" },
      { title: "Inventory", href: "/admin/inventory", requiredPermission: "inventory:read:any" },
    ],
  },
  {
    title: "Sales",
    href: "/admin/orders",
    icon: ShoppingBag,
    requiredPermission: [
      "orders:read:any",
      "orders:manage",
      "shipments:manage",
      "returns:read",
      "refunds:read",
      "coupons:manage",
    ],
    children: [
      { title: "Orders", href: "/admin/orders", requiredPermission: "orders:read:any" },
      { title: "Shipments", href: "/admin/shipments", requiredPermission: "shipments:manage" },
      { title: "Returns", href: "/admin/returns", requiredPermission: "returns:read" },
      { title: "Refunds", href: "/admin/refunds", requiredPermission: "refunds:read" },
      { title: "Coupons", href: "/admin/coupons", requiredPermission: "coupons:manage" },
    ],
  },
  {
    title: "Storefront",
    href: "/admin/navigation",
    icon: Megaphone,
    requiredPermission: [
      "navigation:read:any",
      "sliders:read:any",
      "popups:read:any",
    ],
    children: [
      { title: "Navigation", href: "/admin/navigation", requiredPermission: "navigation:read:any" },
      { title: "Sliders & Banners", href: "/admin/sliders", requiredPermission: "sliders:read:any" },
      { title: "Popups", href: "/admin/popups", requiredPermission: "popups:read:any" },
    ],
  },
  {
    title: "Customers",
    href: "/admin/customers",
    icon: Users,
    requiredPermission: ["users:read:any", "reviews:read"],
    children: [
      { title: "Customers", href: "/admin/customers", requiredPermission: "users:read:any" },
      { title: "Reviews", href: "/admin/reviews", requiredPermission: "reviews:read" },
    ],
  },
  {
    title: "Staff & Roles",
    href: "/admin/users",
    icon: ShieldCheck,
    requiredPermission: ["users:read:any", "users:create", "rbac:roles:manage"],
    children: [
      { title: "Staff Members", href: "/admin/users", requiredPermission: "users:read:any" },
      { title: "Roles & Permissions", href: "/admin/roles", requiredPermission: "rbac:roles:manage" },
    ],
  },
  {
    title: "Shipping",
    href: "/admin/shipping",
    icon: Truck,
    requiredPermission: "shipping:manage",
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
    requiredPermission: ["orders:manage", "shipping:manage", "rbac:roles:manage"],
    children: [
      { title: "General Settings", href: "/admin/settings" },
      { title: "Invoice & Labels", href: "/admin/settings/invoice" },
      { title: "Payment Methods", href: "/admin/settings/payments" },
      { title: "Courier Integration", href: "/admin/settings/courier" },
      { title: "Notifications & SMS", href: "/admin/settings/notifications" },
    ],
  },
];
