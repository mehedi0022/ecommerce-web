"use client";
import Link from "next/link";
import {
  ArrowUpRight,
  Boxes,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Package,
  ShoppingCart,
  Truck,
  Users,
  Warehouse,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const status: Record<string, string> = {
  Delivered: "bg-emerald-500/10 text-emerald-700",
  Processing: "bg-blue-500/10 text-blue-700",
  Pending: "bg-amber-500/10 text-amber-700",
  Shipped: "bg-violet-500/10 text-violet-700",
};
const orders = [
  ["#ORD-10482", "Maya Chen", "$248.00", "Delivered"],
  ["#ORD-10481", "Noah Williams", "$89.00", "Processing"],
  ["#ORD-10480", "Olivia Smith", "$156.50", "Pending"],
  ["#ORD-10479", "Ethan Brown", "$420.00", "Shipped"],
];
const salesData = [{ day: "Sep 1", sales: 18000 }, { day: "Sep 8", sales: 24000 }, { day: "Sep 15", sales: 21000 }, { day: "Sep 22", sales: 32000 }, { day: "Sep 30", sales: 39850 }];
function Stat({
  label,
  value,
  change,
  Icon,
}: {
  label: string;
  value: string;
  change: string;
  Icon: typeof Package;
}) {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-5">
        <div className="flex justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 text-2xl font-semibold">{value}</p>
          </div>
          <span className="rounded-lg bg-primary/10 p-2.5 text-primary">
            <Icon className="size-5" />
          </span>
        </div>
        <p className="mt-4 flex items-center gap-1 text-xs text-emerald-600">
          <ArrowUpRight className="size-3.5" />
          {change}
          <span className="text-muted-foreground">vs previous period</span>
        </p>
      </CardContent>
    </Card>
  );
}
export function DashboardOverview() {
  return (
    <div className="mx-auto max-w-[1480px] space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-muted-foreground">Overview</p>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Overview of your store performance and operations.
          </p>
        </div>
        <div className="flex rounded-lg border bg-card p-1 text-sm shadow-sm">
          {["Today", "7 Days", "30 Days", "Custom"].map((item, i) => (
            <button
              key={item}
              className={`rounded-md px-3 py-1.5 ${i === 2 ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {item}
            </button>
          ))}
        </div>
      </header>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Total sales"
          value="$124,850"
          change="12.5%"
          Icon={CircleDollarSign}
        />
        <Stat
          label="Total orders"
          value="1,284"
          change="8.2%"
          Icon={ShoppingCart}
        />
        <Stat
          label="Total customers"
          value="8,642"
          change="14.6%"
          Icon={Users}
        />
        <Stat
          label="Low stock products"
          value="18"
          change="3 items need attention"
          Icon={Warehouse}
        />
      </section>
      <section className="grid gap-4 xl:grid-cols-[1.6fr_0.8fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Sales overview</CardTitle>
              <p className="text-xs text-muted-foreground">
                Revenue performance over the last 30 days
              </p>
            </div>
            <b className="font-mono text-sm">$124,850</b>
          </CardHeader>
          <CardContent>
            <div className="relative h-56 overflow-hidden rounded-lg bg-muted/20">
              <ResponsiveContainer width="100%" height="100%"><AreaChart data={salesData} margin={{ top: 12, right: 18, left: 0, bottom: 0 }}><defs><linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.24} /><stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" className="stroke-border/60" vertical={false} /><XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} className="fill-muted-foreground" /><YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10 }} tickFormatter={(value) => `$${Number(value) / 1000}k`} width={42} className="fill-muted-foreground" /><Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, "Sales"]} contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} /><Area type="monotone" dataKey="sales" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#salesFill)" /></AreaChart></ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order overview</CardTitle>
            <p className="text-xs text-muted-foreground">
              Current fulfillment workload
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              ["Pending", 38, Clock3, "text-amber-600"],
              ["Processing", 24, Package, "text-blue-600"],
              ["Shipped", 64, Truck, "text-violet-600"],
              ["Delivered", 142, Boxes, "text-emerald-600"],
            ].map(([label, count, Icon, color]) => {
              const IconComp = Icon as any;
              return (
                <div key={String(label)} className="flex justify-between text-sm">
                  <span className="flex items-center gap-3">
                    <IconComp className={`size-4 ${String(color)}`} />
                    {String(label)}
                  </span>
                  <b>{String(count)}</b>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>
      <section className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent orders</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              render={<Link href="/admin/orders" />}
            >
              View all
              <ChevronRight />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[580px] text-left text-sm">
                <thead className="border-y bg-muted/30 text-xs uppercase text-muted-foreground">
                  <tr>
                    {["Order", "Customer", "Total", "Status"].map((x) => (
                      <th key={x} className="px-5 py-3">
                        {x}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {orders.map(([id, name, total, state]) => (
                    <tr key={id} className="hover:bg-muted/30">
                      <td className="px-5 py-3 font-mono text-xs">{id}</td>
                      <td className="px-5 py-3 font-medium">{name}</td>
                      <td className="px-5 py-3 font-mono">{total}</td>
                      <td className="px-5 py-3">
                        <Badge className={status[state]}>{state}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Low stock</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              render={<Link href="/admin/inventory" />}
            >
              View all
              <ChevronRight />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              ["Relaxed Cotton Overshirt", "OS-9921-OLV", "4 left"],
              ["Aluminum Desk Lamp", "DL-6712-SLV", "9 left"],
            ].map(([name, sku, stock]) => (
              <div key={sku} className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                  <Package className="size-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{name}</p>
                  <p className="font-mono text-[11px] text-muted-foreground">
                    {sku}
                  </p>
                </div>
                <Badge className="bg-amber-500/10 text-amber-700">
                  {stock}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Link
            href="/admin/products/new"
            className="rounded-lg border p-3 text-sm font-medium hover:bg-muted"
          >
            <Package className="mb-2 size-4 text-primary" />
            Add product
          </Link>
          <Link
            href="/admin/orders"
            className="rounded-lg border p-3 text-sm font-medium hover:bg-muted"
          >
            <ShoppingCart className="mb-2 size-4 text-primary" />
            View orders
          </Link>
          <Link
            href="/admin/inventory"
            className="rounded-lg border p-3 text-sm font-medium hover:bg-muted"
          >
            <Warehouse className="mb-2 size-4 text-primary" />
            Inventory
          </Link>
          <Link
            href="/admin/navigation"
            className="rounded-lg border p-3 text-sm font-medium hover:bg-muted"
          >
            <Truck className="mb-2 size-4 text-primary" />
            Navigation
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
