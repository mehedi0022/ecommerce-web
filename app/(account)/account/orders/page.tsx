"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Package,
  ArrowLeft,
  ShoppingBag,
  RefreshCw,
  Search,
  Filter,
  AlertCircle,
  Truck,
  Heart,
  MapPin,
  RotateCcw,
  UserRound,
  LogOut,
  Star,
} from "lucide-react";
import { StoreContainer } from "@/components/layout/store/StoreContainer";
import { Card } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/redux/hooks";
import { useLogoutMutation } from "@/modules/auth/authApi";
import { useRouter } from "next/navigation";
import { useListCustomerOrdersQuery } from "@/modules/order/orderApi";
import { OrderCard } from "@/modules/order/components/store/OrderCard";
import type { Order } from "@/modules/order/order.types";

const menuItems = [
  { href: "/account", label: "Overview", icon: UserRound },
  { href: "/account/orders", label: "My orders", icon: Package },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/reviews", label: "My reviews", icon: Star },
  { href: "/account/returns", label: "Returns", icon: RotateCcw },
];

export default function CustomerOrdersPage() {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const { data: ordersData, isLoading, isFetching, refetch } =
    useListCustomerOrdersQuery();

  const orders = ordersData?.data ?? [];

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } finally {
      router.replace("/login");
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      !search.trim() ||
      order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      order.items?.some((i) =>
        i.productName.toLowerCase().includes(search.toLowerCase())
      );

    const matchesStatus =
      statusFilter === "ALL" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-muted/30 py-8 sm:py-12">
      <StoreContainer>
        {/* ── Breadcrumbs ─────────────────────────────────────────────────── */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex items-center gap-2 text-xs text-muted-foreground"
        >
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span>/</span>
          <Link href="/account" className="hover:text-foreground">
            Account
          </Link>
          <span>/</span>
          <span className="font-medium text-foreground">Orders</span>
        </nav>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              My Orders
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              View order history, check statuses, and review invoices.
            </p>
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "gap-1.5 text-xs font-semibold self-start sm:self-auto"
            )}
          >
            <RefreshCw className={cn("size-3.5", isFetching && "animate-spin")} />
            Refresh
          </button>
        </div>

        {/* ── Layout Grid ─────────────────────────────────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          {/* Account Sidebar Navigation */}
          <aside className="hidden lg:block">
            <Card className="overflow-hidden">
              <div className="border-b bg-primary p-4 text-primary-foreground">
                <p className="font-semibold text-sm truncate">
                  {user?.fullName || user?.userName}
                </p>
                <p className="mt-0.5 truncate text-xs text-primary-foreground/70">
                  {user?.email}
                </p>
              </div>
              <nav className="p-2 space-y-0.5" aria-label="Account navigation">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.href === "/account/orders";
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Icon className="size-4" />
                      {item.label}
                    </Link>
                  );
                })}
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-destructive transition hover:bg-destructive/10"
                >
                  <LogOut className="size-4" />
                  {isLoggingOut ? "Signing out..." : "Sign out"}
                </button>
              </nav>
            </Card>
          </aside>

          {/* Main Orders Content */}
          <section className="space-y-6">
            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by order # or product..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-9 pl-9 text-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-9 rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Orders Feed */}
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-border bg-card p-6 space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
                <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Package className="size-7" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-foreground">
                  {orders.length === 0
                    ? "You haven't placed any orders yet"
                    : "No orders match your filter"}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
                  {orders.length === 0
                    ? "Browse through our collection and discover quality products to make your first purchase."
                    : "Try searching with a different order number or clear the status filter."}
                </p>
                {orders.length === 0 ? (
                  <Link
                    href="/products"
                    className={cn(buttonVariants({ size: "default" }), "mt-5 gap-2")}
                  >
                    <ShoppingBag className="size-4" />
                    Start Shopping
                  </Link>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("ALL");
                    }}
                    className="mt-4 text-xs font-semibold"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </StoreContainer>
    </main>
  );
}
