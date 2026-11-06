"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Package,
  ShoppingBag,
  RefreshCw,
  Search,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useListCustomerOrdersQuery } from "@/modules/order/orderApi";
import { OrderCard } from "@/modules/order/components/store/OrderCard";
import { AccountLayoutShell } from "@/modules/account/components/AccountLayoutShell";

export default function CustomerOrdersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const { data: ordersData, isLoading, isFetching, refetch } =
    useListCustomerOrdersQuery();

  const orders = ordersData?.data ?? [];

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

  const actions = (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => refetch()}
      disabled={isFetching}
      className="gap-1.5 text-xs font-semibold"
    >
      <RefreshCw className={cn("size-3.5", isFetching && "animate-spin")} />
      <span>Refresh</span>
    </Button>
  );

  return (
    <AccountLayoutShell
      title="My Orders"
      description="View order history, check shipping statuses, and review invoices."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Account", href: "/account" },
        { label: "Orders" },
      ]}
      actions={actions}
    >
      <div className="space-y-6">
        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by order # or product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 pl-9 text-xs sm:text-sm rounded-xl bg-card border-border/80"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-xl border border-border/80 bg-card px-3 text-xs sm:text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-2xs"
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
                className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-xs"
              >
                <div className="flex justify-between items-center">
                  <Skeleton className="h-5 w-32 rounded-md" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border/80 bg-card p-8 sm:p-14 text-center shadow-xs">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground shadow-2xs">
              <Package className="size-7" />
            </div>
            <h3 className="mt-4 text-xl font-bold text-foreground">
              {orders.length === 0
                ? "You haven't placed any orders yet"
                : "No orders match your filter"}
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
              {orders.length === 0
                ? "Browse through our collection and discover quality products to make your first purchase."
                : "Try searching with a different order number or clear the status filter."}
            </p>
            {orders.length === 0 ? (
              <Link
                href="/products"
                className={cn(buttonVariants({ size: "default" }), "mt-6 gap-2 rounded-xl font-bold shadow-md")}
              >
                <ShoppingBag className="size-4" />
                <span>Start Shopping</span>
              </Link>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("ALL");
                }}
                className="mt-5 text-xs font-bold rounded-xl"
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </AccountLayoutShell>
  );
}
