"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Users,
  Search,
  Eye,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  UserCheck,
  UserX,
  Phone,
  Mail,
  ShieldCheck,
  MoreHorizontal,
  DollarSign,
  ArrowUpDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { AdminPagination } from "@/components/admin/AdminPagination";
import {
  useGetCustomersQuery,
  useChangeCustomerStatusMutation,
} from "@/modules/customer/customerApi";
import type { CustomerItem } from "@/modules/customer/customer.types";

export default function CustomersPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ACTIVE" | "INACTIVE" | "ALL">("ALL");
  const [sortBy, setSortBy] = useState<"createdAt" | "totalSpent" | "totalOrders" | "fullName">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const { data, isLoading, isFetching, refetch } = useGetCustomersQuery({
    page,
    limit,
    search: search.trim() || undefined,
    status: statusFilter !== "ALL" ? statusFilter : undefined,
    sortBy,
    sortOrder,
  });

  const [changeStatus, { isLoading: isChangingStatus }] = useChangeCustomerStatusMutation();

  const customers = data?.data?.items || [];
  const summary = data?.data?.summary || {
    totalCustomers: 0,
    activeCustomers: 0,
    inactiveCustomers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
  };
  const pagination = data?.data?.pagination || {
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 1,
  };

  const handleToggleStatus = async (customer: CustomerItem) => {
    const nextStatus = !customer.isActive;
    try {
      await changeStatus({ id: customer.id, isActive: nextStatus }).unwrap();
      toast.success(
        `Customer ${customer.fullName} has been ${nextStatus ? "activated" : "deactivated"}.`
      );
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to update customer status");
    }
  };

  const columns: DataTableColumn<CustomerItem>[] = [
    {
      key: "name",
      header: "Customer",
      render: (c) => {
        const initials = (c.fullName || c.userName || "C")
          .split(" ")
          .map((n) => n[0])
          .filter(Boolean)
          .slice(0, 2)
          .join("")
          .toUpperCase();

        return (
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary border border-primary/20">
              {initials || "C"}
            </div>
            <div className="min-w-0">
              <Link
                href={`/admin/customers/${c.id}`}
                className="font-semibold text-foreground text-xs hover:text-primary hover:underline truncate block"
              >
                {c.fullName}
              </Link>
              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                <span className="truncate">{c.email}</span>
                {c.userName && (
                  <span className="font-mono text-[10px] text-muted-foreground/80">
                    (@{c.userName})
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: "phone",
      header: "Phone",
      render: (c) => (
        <span className="font-mono text-xs text-muted-foreground">
          {c.phone || "—"}
        </span>
      ),
    },
    {
      key: "totalOrders",
      header: "Orders",
      render: (c) => (
        <div className="flex items-center gap-1.5">
          <ShoppingBag className="size-3 text-muted-foreground" />
          <span className="font-semibold text-foreground text-xs">
            {c.totalOrders}
          </span>
        </div>
      ),
    },
    {
      key: "totalSpent",
      header: "Lifetime Spend",
      render: (c) => (
        <span className="font-mono font-bold text-xs text-foreground">
          ৳{Number(c.totalSpent).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (c) => (
        <Badge
          variant="outline"
          className={`text-[10px] font-semibold ${
            c.isActive
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
              : "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20"
          }`}
        >
          {c.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Joined Date",
      render: (c) => (
        <span className="text-xs text-muted-foreground">
          {new Date(c.createdAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-36 text-right",
      render: (c) => (
        <div className="flex items-center justify-end gap-1">
          <Link href={`/admin/customers/${c.id}`}>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs px-2 gap-1"
              title="View Customer Profile"
            >
              <Eye className="size-3.5" /> View
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToggleStatus(c)}
            disabled={isChangingStatus}
            className={`h-7 text-xs px-2 ${
              c.isActive
                ? "text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
            }`}
            title={c.isActive ? "Deactivate Account" : "Activate Account"}
          >
            {c.isActive ? (
              <UserX className="size-3.5" />
            ) : (
              <UserCheck className="size-3.5" />
            )}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Page Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <nav className="mb-1 text-xs text-muted-foreground flex items-center gap-1.5">
            <Link href="/admin" className="hover:text-foreground">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">Customers</span>
          </nav>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="size-6 text-primary" />
            Customer Management
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            View customer accounts, lifetime purchasing activity, order history, and account statuses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-1.5 text-xs h-9"
          >
            <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* ── Metric KPI Cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
        <Card className="shadow-none">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Users className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Customers</p>
              <p className="text-xl font-bold">{summary.totalCustomers}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
              <UserCheck className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Active Accounts</p>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {summary.activeCustomers}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600">
              <UserX className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Inactive Accounts</p>
              <p className="text-xl font-bold text-rose-600 dark:text-rose-400">
                {summary.inactiveCustomers}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600">
              <ShoppingBag className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Orders</p>
              <p className="text-xl font-bold text-blue-600">
                {summary.totalOrders}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none col-span-2 sm:col-span-1">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
              <TrendingUp className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Customer Revenue</p>
              <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                ৳{Number(summary.totalRevenue).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Table & Search Section ───────────────────────────────────── */}
      <section className="overflow-hidden rounded-xl border bg-card shadow-2xs">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, email, phone, or username..."
              className="h-9 pl-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setPage(1);
              }}
              className="h-9 rounded-lg border border-input bg-background px-3 text-xs font-medium cursor-pointer"
            >
              <option value="ALL">All Statuses ({summary.totalCustomers})</option>
              <option value="ACTIVE">Active ({summary.activeCustomers})</option>
              <option value="INACTIVE">Inactive ({summary.inactiveCustomers})</option>
            </select>

            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split("-") as [any, any];
                setSortBy(sb);
                setSortOrder(so);
                setPage(1);
              }}
              className="h-9 rounded-lg border border-input bg-background px-3 text-xs font-medium cursor-pointer"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="totalSpent-desc">Highest Lifetime Spend</option>
              <option value="totalOrders-desc">Most Orders</option>
              <option value="fullName-asc">Name (A-Z)</option>
            </select>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={customers}
          getRowKey={(c) => c.id}
          isLoading={isLoading}
          emptyIcon={<Users className="size-8 opacity-40" />}
          emptyMessage="No customer accounts match your search or filters."
        />

        <AdminPagination
          page={page}
          limit={limit}
          total={pagination.total}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
          onLimitChange={setLimit}
          disabled={isLoading || isFetching}
        />
      </section>
    </div>
  );
}
