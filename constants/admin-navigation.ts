import type { LucideIcon } from "lucide-react";
import {
  FolderTree,
  LayoutDashboard,
  Megaphone,
  Settings,
  ShoppingBag,
  Truck,
  Users,
} from "lucide-react";
export type AdminNavChild = { title: string; href: string };
export type AdminNavItem = {
  title: string;
  href: string;
  icon?: LucideIcon;
  badge?: string;
  children?: AdminNavChild[];
};
export const adminNavigation: AdminNavItem[] = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
  {
    title: "Catalog",
    href: "/admin/catalog",
    icon: FolderTree,
    children: [
      { title: "Products", href: "/admin/products" },
      { title: "Categories", href: "/admin/catalog/categories" },
      { title: "Brands", href: "/admin/brands" },
      { title: "Attributes", href: "/admin/attributes" },
      { title: "Variants", href: "/admin/variants" },
      { title: "Inventory", href: "/admin/inventory" },
    ],
  },
  {
    title: "Sales",
    href: "/admin/orders",
    icon: ShoppingBag,
    badge: "12",
    children: [
      { title: "Orders", href: "/admin/orders" },
      { title: "Shipments", href: "/admin/shipments" },
      { title: "Returns", href: "/admin/returns" },
      { title: "Refunds", href: "/admin/refunds" },
      { title: "Coupons", href: "/admin/coupons" },
    ],
  },
  {
    title: "Storefront",
    href: "/admin/navigation",
    icon: Megaphone,
    children: [
      { title: "Navigation", href: "/admin/navigation" },
      { title: "Sliders & Banners", href: "/admin/sliders" },
      { title: "Popups", href: "/admin/popups" },
    ],
  },
  {
    title: "Customers",
    href: "/admin/customers",
    icon: Users,
    children: [
      { title: "Customers", href: "/admin/customers" },
      { title: "Reviews", href: "/admin/reviews" },
      { title: "Admin Users", href: "/admin/users" },
    ],
  },
  { title: "Shipping", href: "/admin/shipping", icon: Truck },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
    children: [
      { title: "General Settings", href: "/admin/settings" },
      { title: "Invoice & Labels", href: "/admin/settings/invoice" },
      { title: "Payment Methods", href: "/admin/settings/payments" },
      { title: "Courier Integration", href: "/admin/settings/courier" },
      { title: "Notifications & SMS", href: "/admin/settings/notifications" },
    ],
  },
];
