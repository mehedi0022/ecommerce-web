"use client";

import { use } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Mail,
  Phone,
  User,
  MapPin,
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  Copy,
  Calendar,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  UserX,
  CreditCard,
  Package,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetCustomerByIdQuery,
  useChangeCustomerStatusMutation,
} from "@/modules/customer/customerApi";

interface Props {
  params: Promise<{ id: string }>;
}

const statusBadge: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  CONFIRMED: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20",
  PROCESSING: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  SHIPPED: "bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20",
  DELIVERED: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  CANCELLED: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
};

const paymentBadge: Record<string, string> = {
  PAID: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  UNPAID: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  REFUNDED: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
  FAILED: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
};

export default function CustomerDetailPage({ params }: Props) {
  const resolvedParams = use(params);
  const customerId = Number(resolvedParams.id);

  const { data, isLoading, refetch } = useGetCustomerByIdQuery(customerId, {
    skip: !customerId,
  });

  const [changeStatus, { isLoading: isChangingStatus }] = useChangeCustomerStatusMutation();

  const customerData = data?.data;
  const customer = customerData?.customer;
  const metrics = customerData?.metrics || {
    totalOrders: 0,
    totalSpent: 0,
    averageOrderValue: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    pendingOrders: 0,
  };
  const recentOrders = customerData?.recentOrders || [];
  const addresses = customerData?.addresses || [];

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const handleToggleStatus = async () => {
    if (!customer) return;
    const nextStatus = !customer.isActive;
    try {
      await changeStatus({ id: customer.id, isActive: nextStatus }).unwrap();
      toast.success(
        `Customer account has been ${nextStatus ? "activated" : "deactivated"}.`
      );
      void refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to update status");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="space-y-6">
        <Link href="/admin/customers">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <ArrowLeft className="size-3.5" /> Back to Customers
          </Button>
        </Link>
        <div className="rounded-xl border bg-card p-12 text-center">
          <AlertCircle className="mx-auto size-10 text-muted-foreground/60 mb-2" />
          <h2 className="text-lg font-bold text-foreground">Customer Not Found</h2>
          <p className="text-xs text-muted-foreground mt-1">
            The customer account you are looking for does not exist or has been deleted.
          </p>
        </div>
      </div>
    );
  }

  const initials = (customer.fullName || customer.userName || "C")
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="space-y-6">
      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/customers">
            <Button variant="outline" size="icon" className="size-9">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary border border-primary/20">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold tracking-tight text-foreground">
                  {customer.fullName}
                </h1>
                <Badge
                  variant="outline"
                  className={`text-[10px] font-semibold ${
                    customer.isActive
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20"
                  }`}
                >
                  {customer.isActive ? "Active Account" : "Suspended"}
                </Badge>
                <Badge variant="secondary" className="text-[10px]">
                  {customer.role.name}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                <span>Customer ID: #{customer.id}</span>
                <span>&bull;</span>
                <span>
                  Member since{" "}
                  {new Date(customer.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          <Link href={`/admin/orders?search=${encodeURIComponent(customer.email)}`}>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-9">
              <ShoppingBag className="size-3.5" /> View Orders
            </Button>
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleStatus}
            disabled={isChangingStatus}
            className={`gap-1.5 text-xs h-9 ${
              customer.isActive
                ? "text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
            }`}
          >
            {customer.isActive ? (
              <>
                <UserX className="size-3.5" /> Suspend Customer
              </>
            ) : (
              <>
                <UserCheck className="size-3.5" /> Activate Customer
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ── KPI Metrics Cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="shadow-none">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <ShoppingBag className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Orders</p>
              <p className="text-xl font-bold text-foreground">{metrics.totalOrders}</p>
              <p className="text-[11px] text-muted-foreground">
                {metrics.deliveredOrders} delivered &bull; {metrics.cancelledOrders} cancelled
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
              <TrendingUp className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Lifetime Value (LTV)</p>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                ৳{Number(metrics.totalSpent).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-muted-foreground">Net order purchases</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600">
              <CreditCard className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Average Order Value</p>
              <p className="text-xl font-bold text-blue-600">
                ৳{Number(metrics.averageOrderValue).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-muted-foreground">Per completed checkout</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
              <Clock className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Active / Pending</p>
              <p className="text-xl font-bold text-amber-600">
                {metrics.pendingOrders}
              </p>
              <p className="text-[11px] text-muted-foreground">In fulfillment pipeline</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Main Content Grid ─────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column (Orders) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-none">
            <CardHeader className="border-b pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <ShoppingBag className="size-4 text-primary" />
                    Recent Orders ({recentOrders.length})
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Orders placed by this customer across all channels
                  </CardDescription>
                </div>

                {recentOrders.length > 0 && (
                  <Link href={`/admin/orders?search=${encodeURIComponent(customer.email)}`}>
                    <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                      All Orders <ExternalLink className="size-3" />
                    </Button>
                  </Link>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {recentOrders.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground">
                  <ShoppingBag className="mx-auto size-8 text-muted-foreground/40 mb-2" />
                  <p className="font-semibold text-foreground text-sm">No orders recorded</p>
                  <p className="text-muted-foreground mt-0.5">
                    This customer has not placed any orders yet.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b bg-muted/30 font-medium text-muted-foreground">
                      <tr>
                        <th className="p-3 pl-4">Order</th>
                        <th className="p-3">Date</th>
                        <th className="p-3">Items</th>
                        <th className="p-3">Total Amount</th>
                        <th className="p-3">Payment</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 pr-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {recentOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                          <td className="p-3 pl-4 font-mono font-bold text-primary">
                            <Link
                              href={`/admin/orders/${order.orderNumber}`}
                              className="hover:underline"
                            >
                              #{order.orderNumber}
                            </Link>
                          </td>
                          <td className="p-3 text-muted-foreground">
                            {new Date(order.placedAt).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                          <td className="p-3 text-foreground">
                            <span>{order.itemsCount} product(s)</span>
                          </td>
                          <td className="p-3 font-mono font-bold text-foreground">
                            ৳{order.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-3">
                            <Badge
                              variant="outline"
                              className={`text-[10px] ${
                                paymentBadge[order.paymentStatus] || "bg-muted text-muted-foreground"
                              }`}
                            >
                              {order.paymentStatus}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Badge
                              variant="outline"
                              className={`text-[10px] ${
                                statusBadge[order.status] || "bg-muted text-muted-foreground"
                              }`}
                            >
                              {order.status}
                            </Badge>
                          </td>
                          <td className="p-3 pr-4 text-right">
                            <Link href={`/admin/orders/${order.orderNumber}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs px-2"
                              >
                                View
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (Profile & Addresses) */}
        <div className="space-y-6">
          {/* Customer Profile Info Card */}
          <Card className="shadow-none">
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <User className="size-4 text-primary" />
                Account Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3.5 text-xs">
              <div>
                <span className="text-muted-foreground block text-[11px]">Full Name</span>
                <span className="font-semibold text-foreground text-sm">
                  {customer.fullName}
                </span>
              </div>

              <div>
                <span className="text-muted-foreground block text-[11px]">Email Address</span>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="font-medium text-foreground">{customer.email}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(customer.email, "Email")}
                    className="text-muted-foreground hover:text-foreground"
                    title="Copy Email"
                  >
                    <Copy className="size-3.5" />
                  </button>
                </div>
              </div>

              {customer.phone && (
                <div>
                  <span className="text-muted-foreground block text-[11px]">Phone Number</span>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="font-mono font-medium text-foreground">{customer.phone}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(customer.phone!, "Phone")}
                      className="text-muted-foreground hover:text-foreground"
                      title="Copy Phone"
                    >
                      <Copy className="size-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {customer.userName && (
                <div>
                  <span className="text-muted-foreground block text-[11px]">Username</span>
                  <span className="font-mono font-medium text-foreground">
                    @{customer.userName}
                  </span>
                </div>
              )}

              <div className="pt-2 border-t flex justify-between items-center">
                <span className="text-muted-foreground">Email Verification:</span>
                <Badge
                  variant="outline"
                  className={
                    customer.emailVerifiedAt
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 text-[10px]"
                      : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 text-[10px]"
                  }
                >
                  {customer.emailVerifiedAt ? "Verified" : "Unverified"}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Account Status:</span>
                <Badge
                  variant="outline"
                  className={
                    customer.isActive
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 text-[10px]"
                      : "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20 text-[10px]"
                  }
                >
                  {customer.isActive ? "Active" : "Suspended"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Addresses Card */}
          <Card className="shadow-none">
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <MapPin className="size-4 text-primary" />
                Shipping Addresses ({addresses.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {addresses.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  <MapPin className="mx-auto size-6 text-muted-foreground/40 mb-1" />
                  <p>No saved addresses found.</p>
                </div>
              ) : (
                addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="p-3 rounded-lg border bg-muted/20 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">
                        {addr.label || "Address"}
                      </span>
                      <div className="flex items-center gap-1">
                        {addr.isDefaultShipping && (
                          <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                            Default Shipping
                          </Badge>
                        )}
                        {addr.isDefaultBilling && (
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                            Billing
                          </Badge>
                        )}
                      </div>
                    </div>

                    <p className="font-medium text-foreground">{addr.fullName}</p>
                    <p className="font-mono text-muted-foreground text-[11px]">
                      {addr.phone}
                    </p>
                    <p className="text-muted-foreground text-[11px]">
                      {addr.addressLine1}
                      {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                      <br />
                      {[addr.upazila, addr.district, addr.division, addr.postalCode]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
