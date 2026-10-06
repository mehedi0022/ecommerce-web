"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ShoppingBag,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Copy,
  Check,
  ChevronRight,
  User,
  Phone,
  ArrowUpDown,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useListAdminOrdersQuery } from "../../orderApi";
import type { Order } from "../../order.types";
import { AdminOrderStatusDialog } from "./AdminOrderStatusDialog";
import { AdminOrderShipmentDialog } from "./AdminOrderShipmentDialog";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { mediaUrl } from "@/modules/catalog/catalog.utils";

const statusStyle: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  CONFIRMED: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20",
  PROCESSING: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  SHIPPED: "bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20",
  DELIVERED: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  CANCELLED: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
};

const paymentStyle: Record<string, string> = {
  UNPAID: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  PAID: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  REFUNDED: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
  FAILED: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
};

export function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [paymentFilter, setPaymentFilter] = useState<string>("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Debounce search query to prevent unnecessary API queries
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Modal States
  const [statusModalOrder, setStatusModalOrder] = useState<Order | null>(null);
  const [shipmentModalOrder, setShipmentModalOrder] = useState<Order | null>(null);

  const queryParams = {
    page,
    limit,
    search: debouncedSearch.trim() || undefined,
    status: statusFilter !== "ALL" ? statusFilter : undefined,
    paymentStatus: paymentFilter !== "ALL" ? paymentFilter : undefined,
  };

  const { data, isLoading, isFetching, refetch } =
    useListAdminOrdersQuery(queryParams);

  const orders = data?.data ?? [];
  const meta = data?.meta;

  const handleCopy = (orderNumber: string) => {
    navigator.clipboard.writeText(orderNumber);
    setCopiedId(orderNumber);
    toast.success("Order number copied!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Stats calculation
  const totalOrders = meta?.total ?? orders.length;
  const pendingOrders = orders.filter((o) => o.status === "PENDING").length;
  const processingOrders = orders.filter((o) => o.status === "PROCESSING").length;
  const shippedOrders = orders.filter((o) => o.status === "SHIPPED").length;
  const deliveredOrders = orders.filter((o) => o.status === "DELIVERED").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Orders & Fulfillment
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage customer orders, track payments, assign couriers and update delivery status.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="gap-1.5 h-9"
        >
          <RefreshCw
            className={`size-3.5 ${isFetching ? "animate-spin" : ""}`}
          />
          Refresh Orders
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <Card className="shadow-none">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <ShoppingBag className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Orders</p>
              <p className="text-xl font-bold">{totalOrders}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
              <Clock className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Pending</p>
              <p className="text-xl font-bold">{pendingOrders}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600">
              <Package className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Processing</p>
              <p className="text-xl font-bold">{processingOrders}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-600">
              <Truck className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Shipped</p>
              <p className="text-xl font-bold">{shippedOrders}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none col-span-2 sm:col-span-1">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Delivered</p>
              <p className="text-xl font-bold">{deliveredOrders}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-3">
        <div className="flex flex-1 flex-wrap items-center gap-2 min-w-[280px]">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by Order #, Customer, Phone, Email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 h-9"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="size-3.5 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="h-9 rounded-md border border-input bg-background px-3 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="ALL">All Order Statuses</option>
              <option value="PENDING">Pending Only</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <select
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value);
              setPage(1);
            }}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="ALL">All Payments</option>
            <option value="UNPAID">Unpaid (Cash on Delivery)</option>
            <option value="PAID">Paid</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b bg-muted/40 font-medium text-muted-foreground">
              <tr>
                <th className="p-3.5 pl-4">Order # & Date</th>
                <th className="p-3.5">Customer Details</th>
                <th className="p-3.5">Products</th>
                <th className="p-3.5">Total Amount</th>
                <th className="p-3.5">Payment</th>
                <th className="p-3.5">Order Status</th>
                <th className="p-3.5">Courier Shipment</th>
                <th className="p-3.5 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted-foreground">
                    <RefreshCw className="mx-auto size-5 animate-spin mb-2" />
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center">
                    <XCircle className="mx-auto size-8 text-muted-foreground/60 mb-2" />
                    <p className="font-semibold text-sm">No orders found</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      No customer orders match your active filter criteria.
                    </p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  return (
                    <tr
                      key={order.id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      {/* Order Number & Placed Date */}
                      <td className="p-3.5 pl-4 align-top">
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/admin/orders/${order.orderNumber}`}
                            className="font-mono font-bold text-primary hover:underline"
                          >
                            #{order.orderNumber}
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleCopy(order.orderNumber)}
                            className="text-muted-foreground hover:text-foreground p-0.5"
                            title="Copy Order #"
                          >
                            {copiedId === order.orderNumber ? (
                              <Check className="size-3 text-emerald-600" />
                            ) : (
                              <Copy className="size-3" />
                            )}
                          </button>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {new Date(order.placedAt || order.createdAt).toLocaleDateString(
                            "en-GB",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </td>

                      {/* Customer Info */}
                      <td className="p-3.5 align-top">
                        <div className="font-medium text-foreground">
                          {order.customerName}
                        </div>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Phone className="size-3 shrink-0" />
                          {order.customerPhone}
                        </p>
                        {order.userId ? (
                          <span className="inline-block text-[10px] text-primary/80 mt-0.5">
                            Registered Member
                          </span>
                        ) : (
                          <span className="inline-block text-[10px] text-muted-foreground mt-0.5">
                            Guest Checkout
                          </span>
                        )}
                      </td>

                      {/* Products */}
                      <td className="p-3.5 align-top max-w-[240px]">
                        {order.items && order.items.length > 0 ? (
                          <div className="flex items-start gap-2.5">
                            {(() => {
                              const firstItem = order.items[0];
                              const img =
                                firstItem.product?.images?.find(
                                  (i) => i.isPrimary
                                )?.imageUrl ||
                                firstItem.product?.images?.[0]?.imageUrl;

                              return (
                                <div className="size-10 shrink-0 rounded-md border bg-muted/30 overflow-hidden flex items-center justify-center relative">
                                  {img ? (
                                    <img
                                      src={mediaUrl(img)}
                                      alt={firstItem.productName}
                                      className="size-full object-cover"
                                    />
                                  ) : (
                                    <Package className="size-4 text-muted-foreground/60" />
                                  )}
                                </div>
                              );
                            })()}
                            <div className="min-w-0 flex-1">
                              <p
                                className="font-medium text-foreground text-xs truncate"
                                title={order.items[0].productName}
                              >
                                {order.items[0].productName}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-muted-foreground">
                                <span>Qty: {order.items[0].quantity}</span>
                                {order.items.length > 1 && (
                                  <span className="inline-flex items-center rounded-full bg-muted px-1.5 py-0 text-[10px] font-medium text-muted-foreground border">
                                    +{order.items.length - 1} more
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic text-[11px]">
                            No items
                          </span>
                        )}
                      </td>

                      {/* Total Amount */}
                      <td className="p-3.5 align-top whitespace-nowrap">
                        <span className="font-bold text-sm font-mono text-foreground">
                          ৳{Number(order.grandTotal).toLocaleString()}
                        </span>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {order.items?.length || 0}{" "}
                          {(order.items?.length || 0) === 1 ? "item" : "items"}
                        </p>
                      </td>

                      {/* Payment */}
                      <td className="p-3.5 align-top">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-semibold ${
                            paymentStyle[order.paymentStatus] || ""
                          }`}
                        >
                          {order.paymentStatus}
                        </Badge>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {order.paymentMethod === "CASH_ON_DELIVERY"
                            ? "Cash on Delivery"
                            : "Online Payment"}
                        </p>
                      </td>

                      {/* Order Status */}
                      <td className="p-3.5 align-top">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-bold ${
                            statusStyle[order.status] || ""
                          }`}
                        >
                          {order.status}
                        </Badge>
                      </td>

                      {/* Courier Shipment */}
                      <td className="p-3.5 align-top">
                        {order.shipment ? (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-semibold text-foreground">
                                {order.shipment.courierName || "Courier Assigned"}
                              </span>
                              {order.shipment.status && (
                                <Badge
                                  variant="outline"
                                  className="text-[9px] px-1.5 py-0 font-mono text-muted-foreground border-border bg-muted/50"
                                >
                                  {order.shipment.status}
                                </Badge>
                              )}
                            </div>
                            {order.shipment.trackingNumber ? (
                              order.shipment.trackingUrl ? (
                                <a
                                  href={order.shipment.trackingUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-mono text-[11px] text-primary hover:underline inline-flex items-center gap-1"
                                >
                                  {order.shipment.trackingNumber}
                                  <ExternalLink className="size-2.5" />
                                </a>
                              ) : (
                                <p className="font-mono text-[11px] text-muted-foreground">
                                  {order.shipment.trackingNumber}
                                </p>
                              )
                            ) : (
                              <p className="text-[10px] text-muted-foreground italic">
                                No tracking ID
                              </p>
                            )}
                          </div>
                        ) : ["PROCESSING", "SHIPPED"].includes(order.status) ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-[11px] gap-1 text-primary border-primary/30 hover:bg-primary/5"
                            onClick={() => setShipmentModalOrder(order)}
                          >
                            <Truck className="size-3" />
                            Assign Courier
                          </Button>
                        ) : (
                          <span className="text-muted-foreground italic text-[11px]">
                            Not assigned
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 pr-4 align-top text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {order.status !== "DELIVERED" &&
                            order.status !== "CANCELLED" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs px-2.5"
                                onClick={() => setStatusModalOrder(order)}
                              >
                                Update Status
                              </Button>
                            )}

                          <Link href={`/admin/orders/${order.orderNumber}`}>
                            <Button
                              size="icon-sm"
                              variant="ghost"
                              className="h-7 w-7"
                              title="View Full Order Details"
                            >
                              <Eye className="size-3.5" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {meta && (
          <AdminPagination
            page={page}
            limit={limit}
            total={meta.total}
            totalPages={meta.totalPages}
            onPageChange={setPage}
            onLimitChange={setLimit}
            pageSizeOptions={[10, 15, 25, 50, 100]}
            disabled={isFetching}
          />
        )}
      </div>

      {/* Status Transition Dialog */}
      {statusModalOrder && (
        <AdminOrderStatusDialog
          open={!!statusModalOrder}
          onOpenChange={(open) => !open && setStatusModalOrder(null)}
          orderNumber={statusModalOrder.orderNumber}
          currentStatus={statusModalOrder.status}
        />
      )}

      {/* Courier Shipment Dialog */}
      {shipmentModalOrder && (
        <AdminOrderShipmentDialog
          open={!!shipmentModalOrder}
          onOpenChange={(open) => !open && setShipmentModalOrder(null)}
          orderNumber={shipmentModalOrder.orderNumber}
        />
      )}
    </div>
  );
}
