"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  Boxes,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Package,
  Plus,
  RefreshCw,
  ShoppingBag,
  ShoppingCart,
  Truck,
  Users,
  Warehouse,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useGetDashboardAnalyticsQuery } from "../dashboardApi";
import type { DashboardPeriod } from "../dashboard.types";
import { cn } from "@/lib/utils";
import { mediaUrl } from "@/modules/catalog/catalog.utils";

function ProductThumb({
  src,
  alt,
  className,
}: {
  src?: string | null;
  alt: string;
  className?: string;
}) {
  const [error, setError] = useState(false);
  const resolved = src ? mediaUrl(src) : null;

  if (!resolved || error) {
    return (
      <div
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted text-muted-foreground",
          className,
        )}
      >
        <Package className="size-4 opacity-70" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "size-9 shrink-0 overflow-hidden rounded-lg border bg-muted",
        className,
      )}
    >
      <img
        src={resolved}
        alt={alt}
        onError={() => setError(true)}
        className="size-full object-cover"
      />
    </div>
  );
}

const statusColors: Record<string, { bg: string; text: string; icon: any }> = {
  PENDING: {
    bg: "bg-amber-500/10",
    text: "text-amber-700 dark:text-amber-400",
    icon: Clock3,
  },
  CONFIRMED: {
    bg: "bg-blue-500/10",
    text: "text-blue-700 dark:text-blue-400",
    icon: CheckCircle2,
  },
  PROCESSING: {
    bg: "bg-indigo-500/10",
    text: "text-indigo-700 dark:text-indigo-400",
    icon: Package,
  },
  SHIPPED: {
    bg: "bg-violet-500/10",
    text: "text-violet-700 dark:text-violet-400",
    icon: Truck,
  },
  DELIVERED: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-400",
    icon: Boxes,
  },
  CANCELLED: {
    bg: "bg-rose-500/10",
    text: "text-rose-700 dark:text-rose-400",
    icon: XCircle,
  },
  RETURNED: {
    bg: "bg-zinc-500/10",
    text: "text-zinc-700 dark:text-zinc-400",
    icon: RefreshCw,
  },
};

export function DashboardOverview() {
  const [period, setPeriod] = useState<DashboardPeriod>("30d");
  const [chartMetric, setChartMetric] = useState<"sales" | "orders">("sales");

  // Fetch live dashboard analytics with 30-second background polling
  const { data, isLoading, isFetching, refetch } =
    useGetDashboardAnalyticsQuery({ period }, { pollingInterval: 30000 });

  const analytics = data?.data;
  const metrics = analytics?.metrics;
  const salesTrend = analytics?.salesTrend ?? [];
  const recentOrders = analytics?.recentOrders ?? [];
  const lowStockItems = analytics?.lowStockItems ?? [];
  const topProducts = analytics?.topSellingProducts ?? [];
  const paymentDistribution = analytics?.paymentDistribution ?? [];
  const statusCounts = analytics?.orderStatusBreakdown ?? {
    pending: 0,
    confirmed: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    returned: 0,
  };

  const formatTaka = (amount: number | string) => {
    const num = Number(amount || 0);
    return `৳${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="mx-auto max-w-[1520px] space-y-6">
      {/* ── Dashboard Header ────────────────────────────────────────────── */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Live Analytics & Operations
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Sync
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Real-time store performance, fulfillment workload, and stock
            telemetry.
          </p>
        </div>

        {/* Controls: Refresh & Period Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-9 gap-1.5 text-xs"
            title="Refresh analytics data"
          >
            <RefreshCw
              className={cn(
                "size-3.5",
                isFetching && "animate-spin text-primary",
              )}
            />
            {isFetching ? "Syncing..." : "Refresh"}
          </Button>

          <div className="flex rounded-lg border bg-card p-0.5 text-xs shadow-xs">
            {(
              [
                { id: "today", label: "Today (24h)" },
                { id: "7d", label: "7 Days" },
                { id: "30d", label: "30 Days" },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                onClick={() => setPeriod(item.id)}
                className={cn(
                  "rounded-md px-3 py-1.5 font-medium transition-all",
                  period === item.id
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── ROW 1: 4 Executive KPI Cards ──────────────────────────────────── */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* KPI 1: Revenue */}
        <Card className="shadow-xs border-border/80">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Total Revenue
                </p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-foreground font-mono">
                  {isLoading
                    ? "..."
                    : (metrics?.sales.formattedValue ?? "৳0.00")}
                </p>
              </div>
              <span className="rounded-xl bg-primary/10 p-2.5 text-primary">
                <CircleDollarSign className="size-5" />
              </span>
            </div>
            <div className="mt-3.5 flex items-center justify-between border-t pt-3 text-xs">
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 font-semibold",
                  (metrics?.sales.changePercentage ?? 0) >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400",
                )}
              >
                {(metrics?.sales.changePercentage ?? 0) >= 0 ? (
                  <ArrowUpRight className="size-3.5" />
                ) : (
                  <ArrowDownRight className="size-3.5" />
                )}
                {Math.abs(metrics?.sales.changePercentage ?? 0)}%
                <span className="font-normal text-muted-foreground ml-1">
                  vs prev
                </span>
              </span>
              <span className="text-muted-foreground text-[11px] font-mono">
                AOV: {metrics?.sales.formattedAov ?? "৳0.00"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 2: Total Orders */}
        <Card className="shadow-xs border-border/80">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Orders Placed
                </p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-foreground font-mono">
                  {isLoading ? "..." : (metrics?.orders.formattedValue ?? "0")}
                </p>
              </div>
              <span className="rounded-xl bg-blue-500/10 p-2.5 text-blue-600 dark:text-blue-400">
                <ShoppingCart className="size-5" />
              </span>
            </div>
            <div className="mt-3.5 flex items-center justify-between border-t pt-3 text-xs">
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 font-semibold",
                  (metrics?.orders.changePercentage ?? 0) >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400",
                )}
              >
                {(metrics?.orders.changePercentage ?? 0) >= 0 ? (
                  <ArrowUpRight className="size-3.5" />
                ) : (
                  <ArrowDownRight className="size-3.5" />
                )}
                {Math.abs(metrics?.orders.changePercentage ?? 0)}%
                <span className="font-normal text-muted-foreground ml-1">
                  vs prev
                </span>
              </span>
              <span className="text-muted-foreground text-[11px]">
                {metrics?.orders.activeOrdersCount ?? 0} active in fulfillment
              </span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 3: Customers */}
        <Card className="shadow-xs border-border/80">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Customer Growth
                </p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-foreground font-mono">
                  {isLoading
                    ? "..."
                    : (metrics?.customers.formattedValue ?? "0")}
                </p>
              </div>
              <span className="rounded-xl bg-violet-500/10 p-2.5 text-violet-600 dark:text-violet-400">
                <Users className="size-5" />
              </span>
            </div>
            <div className="mt-3.5 flex items-center justify-between border-t pt-3 text-xs">
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 font-semibold",
                  (metrics?.customers.changePercentage ?? 0) >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400",
                )}
              >
                {(metrics?.customers.changePercentage ?? 0) >= 0 ? (
                  <ArrowUpRight className="size-3.5" />
                ) : (
                  <ArrowDownRight className="size-3.5" />
                )}
                {Math.abs(metrics?.customers.changePercentage ?? 0)}%
                <span className="font-normal text-muted-foreground ml-1">
                  vs prev
                </span>
              </span>
              <span className="text-muted-foreground text-[11px]">
                {metrics?.customers.totalCustomers ?? 0} total registered
              </span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 4: Inventory Alert */}
        <Card className="shadow-xs border-border/80">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Low Stock Alert
                </p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400 font-mono">
                  {isLoading
                    ? "..."
                    : (metrics?.inventory.lowStockCount ?? 0) +
                      (metrics?.inventory.outOfStockCount ?? 0)}
                </p>
              </div>
              <span className="rounded-xl bg-amber-500/10 p-2.5 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="size-5" />
              </span>
            </div>
            <div className="mt-3.5 flex items-center justify-between border-t pt-3 text-xs">
              <span className="text-muted-foreground text-[11px]">
                {metrics?.inventory.outOfStockCount ?? 0} out of stock •{" "}
                {metrics?.inventory.lowStockCount ?? 0} low
              </span>
              <Link
                href="/admin/inventory"
                className="font-semibold text-primary hover:underline"
              >
                Inspect
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ── ROW 2: Sales Trend Chart & Fulfillment Workload ─────────────── */}
      <section className="grid gap-4 xl:grid-cols-[1.6fr_0.9fr]">
        {/* Sales Trend Chart */}
        <Card className="shadow-xs border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-bold">
                Performance Trend
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Revenue & order volume generated across{" "}
                {period === "today" ? "today" : `the last ${period}`}
              </p>
            </div>

            {/* Metric Switcher */}
            <div className="flex rounded-md border bg-muted/40 p-0.5 text-xs">
              <button
                onClick={() => setChartMetric("sales")}
                className={cn(
                  "rounded px-2.5 py-1 font-medium transition-all",
                  chartMetric === "sales"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Revenue (৳)
              </button>
              <button
                onClick={() => setChartMetric("orders")}
                className={cn(
                  "rounded px-2.5 py-1 font-medium transition-all",
                  chartMetric === "orders"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Orders
              </button>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-94 w-full">
              {salesTrend.length === 0 || isLoading ? (
                <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                  Loading telemetry trend...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={salesTrend}
                    margin={{ top: 12, right: 12, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="primaryFill"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="hsl(var(--primary))"
                          stopOpacity={0.25}
                        />
                        <stop
                          offset="95%"
                          stopColor="hsl(var(--primary))"
                          stopOpacity={0.0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-border/40"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11 }}
                      className="fill-muted-foreground"
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11 }}
                      tickCount={7}
                      domain={[0, "auto"]}
                      tickFormatter={(value) =>
                        chartMetric === "sales"
                          ? `৳${value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}`
                          : String(value)
                      }
                      width={50}
                      className="fill-muted-foreground"
                    />
                    <Tooltip
                      formatter={(value: any) => [
                        chartMetric === "sales"
                          ? formatTaka(value)
                          : `${value} orders`,
                        chartMetric === "sales" ? "Revenue" : "Orders",
                      ]}
                      labelFormatter={(label) => `Time: ${label}`}
                      contentStyle={{
                        borderRadius: 10,
                        border: "1px solid hsl(var(--border))",
                        background: "hsl(var(--card))",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        fontSize: 12,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey={chartMetric}
                      stroke="hsl(var(--primary))"
                      strokeWidth={2.5}
                      fill="url(#primaryFill)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Fulfillment Workload Pipeline */}
        <Card className="shadow-xs border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-bold">
                Fulfillment Pipeline
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Current order lifecycle status & workload
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              render={<Link href="/admin/orders" />}
              className="text-xs text-primary"
            >
              All Orders <ChevronRight className="size-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            {[
              {
                key: "PENDING",
                label: "Pending Confirmation",
                count: statusCounts.pending,
                color: "text-amber-600 bg-amber-500/10",
                border: "border-amber-500/20",
              },
              {
                key: "CONFIRMED",
                label: "Confirmed",
                count: statusCounts.confirmed,
                color: "text-blue-600 bg-blue-500/10",
                border: "border-blue-500/20",
              },
              {
                key: "PROCESSING",
                label: "Packaging & Processing",
                count: statusCounts.processing,
                color: "text-indigo-600 bg-indigo-500/10",
                border: "border-indigo-500/20",
              },
              {
                key: "SHIPPED",
                label: "Dispatched / Courier Transit",
                count: statusCounts.shipped,
                color: "text-violet-600 bg-violet-500/10",
                border: "border-violet-500/20",
              },
              {
                key: "DELIVERED",
                label: "Delivered Successfully",
                count: statusCounts.delivered,
                color: "text-emerald-600 bg-emerald-500/10",
                border: "border-emerald-500/20",
              },
              {
                key: "CANCELLED",
                label: "Cancelled / Failed",
                count: statusCounts.cancelled,
                color: "text-rose-600 bg-rose-500/10",
                border: "border-rose-500/20",
              },
            ].map((step) => {
              const totalOrders = Math.max(
                1,
                Object.values(statusCounts).reduce((a, b) => a + b, 0),
              );
              const pct = ((step.count / totalOrders) * 100).toFixed(0);

              return (
                <Link
                  key={step.key}
                  href={`/admin/orders?status=${step.key}`}
                  className="group flex items-center justify-between rounded-xl border p-2.5 transition hover:border-foreground/30 hover:bg-muted/40"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-lg font-bold text-xs",
                        step.color,
                      )}
                    >
                      {step.count}
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                        {step.label}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {pct}% of orders
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </section>

      {/* ── ROW 3: Recent Live Orders & Low Stock Action ──────────────────── */}
      <section className="grid gap-4 xl:grid-cols-[1.5fr_0.9fr]">
        {/* Recent Live Orders Table */}
        <Card className="shadow-xs border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold">
                Recent Live Orders
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Latest customer transactions placed through the storefront
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              render={<Link href="/admin/orders" />}
              className="text-xs"
            >
              View all orders
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {recentOrders.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No orders recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-left text-xs">
                  <thead className="border-y bg-muted/40 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3">Order Number</th>
                      <th className="px-5 py-3">Customer</th>
                      <th className="px-5 py-3">Payment</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Grand Total</th>
                      <th className="px-5 py-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {recentOrders.map((o) => {
                      const stConfig = statusColors[o.status] || {
                        bg: "bg-muted",
                        text: "text-muted-foreground",
                      };

                      return (
                        <tr
                          key={o.id}
                          className="hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-5 py-3.5">
                            <Link
                              href={`/admin/orders/${o.id}`}
                              className="font-mono font-bold text-primary hover:underline"
                            >
                              {o.orderNumber}
                            </Link>
                            <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                              {new Date(o.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </p>
                          </td>
                          <td className="px-5 py-3.5">
                            <p className="font-semibold text-foreground">
                              {o.customerName}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {o.customerPhone}
                            </p>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="font-medium text-foreground">
                              {o.paymentMethod === "CASH_ON_DELIVERY"
                                ? "Cash on Delivery"
                                : o.paymentMethod === "PARTIAL_COD"
                                  ? "Partial COD"
                                  : "Online Payment"}
                            </span>
                            <p
                              className={cn(
                                "text-[10px] font-bold mt-0.5",
                                o.paymentStatus === "PAID"
                                  ? "text-emerald-600"
                                  : o.paymentStatus === "PARTIALLY_PAID"
                                    ? "text-blue-600"
                                    : "text-amber-600",
                              )}
                            >
                              {o.paymentStatus}
                            </p>
                          </td>
                          <td className="px-5 py-3.5">
                            <Badge
                              className={cn(
                                "font-semibold text-[10px]",
                                stConfig.bg,
                                stConfig.text,
                              )}
                            >
                              {o.status}
                            </Badge>
                          </td>
                          <td className="px-5 py-3.5 text-right font-mono font-bold text-foreground">
                            {formatTaka(o.grandTotal)}
                          </td>
                          <td className="px-5 py-3.5 text-center">
                            <Button
                              variant="ghost"
                              size="xs"
                              render={<Link href={`/admin/orders/${o.id}`} />}
                              className="text-xs text-primary"
                            >
                              View
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Items Action Card */}
        <Card className="shadow-xs border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold">
                Stock Attention
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Products nearing exhaustion requiring restocking
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              render={<Link href="/admin/inventory" />}
              className="text-xs text-primary"
            >
              Manage <ChevronRight className="size-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3 pt-1">
            {lowStockItems.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                <CheckCircle2 className="mx-auto size-8 text-emerald-500 mb-2 opacity-80" />
                All product inventories are well stocked!
              </div>
            ) : (
              lowStockItems.map((item) => (
                <div
                  key={item.variantId}
                  className="flex items-center justify-between rounded-xl border p-2.5 transition hover:border-foreground/30 hover:bg-muted/30"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <ProductThumb
                      src={item.productImage}
                      alt={item.productName}
                      className="size-10"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {item.productName}
                      </p>
                      <p className="font-mono text-[10px] text-muted-foreground truncate">
                        {item.sku}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pl-2">
                    <Badge
                      className={cn(
                        "font-bold text-[10px]",
                        item.status === "OUT_OF_STOCK"
                          ? "bg-rose-500/10 text-rose-700 dark:text-rose-400"
                          : "bg-amber-500/10 text-amber-700 dark:text-amber-400",
                      )}
                    >
                      {item.availableQuantity <= 0
                        ? "Out of Stock"
                        : `${item.availableQuantity} left`}
                    </Badge>
                    <Link
                      href="/admin/inventory"
                      className="text-xs font-semibold text-primary hover:underline shrink-0"
                    >
                      Restock
                    </Link>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      {/* ── ROW 4: Top Sellers & Payment Distribution ────────────────────── */}
      <section className="grid gap-4 xl:grid-cols-2">
        {/* Top Selling Products */}
        <Card className="shadow-xs border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold">
                Top Selling Products
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Highest volume products ordered in selected period
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              render={<Link href="/admin/products" />}
              className="text-xs text-primary"
            >
              Catalog <ChevronRight className="size-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3 pt-1">
            {topProducts.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No product sales recorded in this timeframe.
              </div>
            ) : (
              topProducts.map((p, index) => (
                <div
                  key={p.productId}
                  className="flex items-center justify-between rounded-xl border p-2.5 hover:bg-muted/30 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-muted-foreground">
                      #{index + 1}
                    </span>
                    <ProductThumb
                      src={p.productImage}
                      alt={p.productName}
                      className="size-9"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {p.productName}
                      </p>
                      <p className="font-mono text-[10px] text-muted-foreground">
                        {p.sku}
                      </p>
                    </div>
                  </div>

                  <div className="text-right pl-3 shrink-0">
                    <span className="font-mono font-bold text-xs text-foreground">
                      {formatTaka(p.revenue)}
                    </span>
                    <p className="text-[10px] text-muted-foreground font-semibold">
                      {p.unitsSold} units sold
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Payment Methods Distribution */}
        <Card className="shadow-xs border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold">
                Payment Methods Breakdown
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Distribution of transactions by payment gateway & mode
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              render={<Link href="/admin/settings/payments" />}
              className="text-xs text-primary"
            >
              Settings <ChevronRight className="size-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 pt-1">
            {paymentDistribution.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No transactions recorded in this period.
              </div>
            ) : (
              paymentDistribution.map((pm) => (
                <div key={pm.method} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground flex items-center gap-2">
                      <CreditCard className="size-3.5 text-primary" />
                      {pm.label}
                    </span>
                    <div className="font-mono font-medium text-foreground">
                      {formatTaka(pm.totalAmount)}{" "}
                      <span className="text-muted-foreground font-normal">
                        ({pm.count} orders • {pm.percentage}%)
                      </span>
                    </div>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{
                        width: `${Math.min(100, Math.max(2, pm.percentage))}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      {/* ── ROW 5: Quick Management Actions ──────────────────────────────── */}
      <Card className="shadow-xs border-border/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold">
            Quick Operations
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Fast access to frequent store and catalog management tasks
          </p>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <Link
            href="/admin/products/new"
            className="flex flex-col items-center justify-center rounded-xl border p-4 text-center transition hover:border-primary hover:bg-primary/5 hover:text-primary group"
          >
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2 group-hover:scale-110 transition-transform">
              <Plus className="size-5" />
            </div>
            <span className="text-xs font-semibold">New Product</span>
            <span className="text-[10px] text-muted-foreground mt-0.5">
              Add to catalog
            </span>
          </Link>

          <Link
            href="/admin/orders"
            className="flex flex-col items-center justify-center rounded-xl border p-4 text-center transition hover:border-primary hover:bg-primary/5 hover:text-primary group"
          >
            <div className="flex size-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 mb-2 group-hover:scale-110 transition-transform">
              <ShoppingBag className="size-5" />
            </div>
            <span className="text-xs font-semibold">Orders</span>
            <span className="text-[10px] text-muted-foreground mt-0.5">
              Fulfillment & dispatch
            </span>
          </Link>

          <Link
            href="/admin/inventory"
            className="flex flex-col items-center justify-center rounded-xl border p-4 text-center transition hover:border-primary hover:bg-primary/5 hover:text-primary group"
          >
            <div className="flex size-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 mb-2 group-hover:scale-110 transition-transform">
              <Warehouse className="size-5" />
            </div>
            <span className="text-xs font-semibold">Inventory</span>
            <span className="text-[10px] text-muted-foreground mt-0.5">
              Stock & movements
            </span>
          </Link>

          <Link
            href="/admin/customers"
            className="flex flex-col items-center justify-center rounded-xl border p-4 text-center transition hover:border-primary hover:bg-primary/5 hover:text-primary group"
          >
            <div className="flex size-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 mb-2 group-hover:scale-110 transition-transform">
              <Users className="size-5" />
            </div>
            <span className="text-xs font-semibold">Customers</span>
            <span className="text-[10px] text-muted-foreground mt-0.5">
              User directory
            </span>
          </Link>

          <Link
            href="/admin/couriers"
            className="flex flex-col items-center justify-center rounded-xl border p-4 text-center transition hover:border-primary hover:bg-primary/5 hover:text-primary group"
          >
            <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 mb-2 group-hover:scale-110 transition-transform">
              <Truck className="size-5" />
            </div>
            <span className="text-xs font-semibold">Couriers</span>
            <span className="text-[10px] text-muted-foreground mt-0.5">
              Steadfast & Pathao
            </span>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
