"use client";

import Link from "next/link";
import { useState } from "react";
import {
  CheckCircle2,
  Eye,
  Package,
  Search,
  Truck,
  XCircle,
  Printer,
  Tag,
  ExternalLink,
  RefreshCw,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useListAdminOrdersQuery } from "@/modules/order/orderApi";
import { ShippingLabelModal } from "@/modules/order/components/shipping-label/ShippingLabelModal";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { mediaUrl } from "@/modules/catalog/catalog.utils";
import type { Order } from "@/modules/order/order.types";

const statusStyle: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  CONFIRMED: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20",
  PROCESSING: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  SHIPPED: "bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20",
  DELIVERED: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  CANCELLED: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
};

export default function ShipmentsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<number>>(new Set());

  // Modal states
  const [shippingLabelOrder, setShippingLabelOrder] = useState<Order | null>(null);
  const [isBulkShippingLabelOpen, setIsBulkShippingLabelOpen] = useState(false);

  const { data, isLoading, isFetching, refetch } = useListAdminOrdersQuery({
    page,
    limit,
    search: search.trim() || undefined,
    status: statusFilter !== "ALL" ? statusFilter : undefined,
  });

  const orders = data?.data ?? [];
  const meta = data?.meta;

  const handleToggleSelectAll = () => {
    if (selectedOrderIds.size === orders.length && orders.length > 0) {
      setSelectedOrderIds(new Set());
    } else {
      setSelectedOrderIds(new Set(orders.map((o) => o.id)));
    }
  };

  const handleToggleOrder = (id: number) => {
    setSelectedOrderIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Stats calculation
  const totalShipments = meta?.total ?? orders.length;
  const inTransit = orders.filter((o) => o.status === "SHIPPED").length;
  const processing = orders.filter((o) => o.status === "PROCESSING").length;
  const delivered = orders.filter((o) => o.status === "DELIVERED").length;

  return (
    <div className="space-y-6">
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <nav className="mb-1 text-xs text-muted-foreground flex items-center gap-1.5">
            <Link href="/admin" className="hover:text-foreground">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">Shipments & Dispatch</span>
          </nav>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Truck className="size-6 text-primary" />
            Shipments & Courier Dispatch
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Manage parcel fulfillments, track courier status, and print thermal parcel shipping labels.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
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

          {selectedOrderIds.size > 0 && (
            <Button
              size="sm"
              onClick={() => setIsBulkShippingLabelOpen(true)}
              className="gap-1.5 text-xs h-9 bg-black hover:bg-neutral-800 text-white font-semibold shadow-sm"
            >
              <Tag className="size-3.5" />
              Print Selected Labels ({selectedOrderIds.size})
            </Button>
          )}
        </div>
      </div>

      {/* ── Metric KPI Cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card
          onClick={() => {
            setStatusFilter("ALL");
            setPage(1);
          }}
          className={`shadow-none cursor-pointer transition hover:border-primary/40 ${
            statusFilter === "ALL" ? "border-primary ring-1 ring-primary/20" : ""
          }`}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Package className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">All Shipments</p>
              <p className="text-xl font-bold">{totalShipments}</p>
            </div>
          </CardContent>
        </Card>

        <Card
          onClick={() => {
            setStatusFilter("PROCESSING");
            setPage(1);
          }}
          className={`shadow-none cursor-pointer transition hover:border-blue-500/40 ${
            statusFilter === "PROCESSING" ? "border-blue-500 ring-1 ring-blue-500/20" : ""
          }`}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600">
              <Clock className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Ready to Dispatch</p>
              <p className="text-xl font-bold text-blue-600">{processing}</p>
            </div>
          </CardContent>
        </Card>

        <Card
          onClick={() => {
            setStatusFilter("SHIPPED");
            setPage(1);
          }}
          className={`shadow-none cursor-pointer transition hover:border-violet-500/40 ${
            statusFilter === "SHIPPED" ? "border-violet-500 ring-1 ring-violet-500/20" : ""
          }`}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-600">
              <Truck className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">In Transit</p>
              <p className="text-xl font-bold text-violet-600">{inTransit}</p>
            </div>
          </CardContent>
        </Card>

        <Card
          onClick={() => {
            setStatusFilter("DELIVERED");
            setPage(1);
          }}
          className={`shadow-none cursor-pointer transition hover:border-emerald-500/40 ${
            statusFilter === "DELIVERED" ? "border-emerald-500 ring-1 ring-emerald-500/20" : ""
          }`}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Delivered</p>
              <p className="text-xl font-bold text-emerald-600">{delivered}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Bulk Action Banner (when rows selected) ───────────────────────── */}
      {selectedOrderIds.size > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-primary/10 border border-primary/25 p-3.5 rounded-xl text-xs">
          <div className="flex items-center gap-2">
            <Tag className="size-4 text-primary" />
            <span className="font-bold text-foreground">
              {selectedOrderIds.size} parcel {selectedOrderIds.size === 1 ? "label" : "labels"} selected for thermal printing
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => setIsBulkShippingLabelOpen(true)}
              className="gap-1.5 h-8 text-xs bg-black text-white hover:bg-neutral-800 font-semibold cursor-pointer shadow-xs"
            >
              <Printer className="size-3.5" />
              Print {selectedOrderIds.size} Thermal Shipping {selectedOrderIds.size === 1 ? "Label" : "Labels"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedOrderIds(new Set())}
              className="h-8 text-xs cursor-pointer"
            >
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {/* ── Main Shipments Table ─────────────────────────────────────────── */}
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
              placeholder="Search by order #, recipient name, phone, or tracking..."
              className="h-9 pl-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="h-9 rounded-lg border border-input bg-background px-3 text-xs font-medium cursor-pointer"
            >
              <option value="ALL">All Order Statuses</option>
              <option value="PROCESSING">Processing / Ready to Ship</option>
              <option value="SHIPPED">Shipped / In Transit</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b bg-muted/40 font-medium text-muted-foreground">
              <tr>
                <th className="p-3.5 pl-4 w-9">
                  <input
                    type="checkbox"
                    checked={orders.length > 0 && selectedOrderIds.size === orders.length}
                    onChange={handleToggleSelectAll}
                    aria-label="Select all shipments"
                    className="rounded border-input text-primary focus:ring-primary size-4 cursor-pointer"
                  />
                </th>
                <th className="p-3.5">Order</th>
                <th className="p-3.5">Products / Items</th>
                <th className="p-3.5">Recipient & Destination</th>
                <th className="p-3.5">Courier & Tracking</th>
                <th className="p-3.5">Payment / COD</th>
                <th className="p-3.5">Order Status</th>
                <th className="p-3.5 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted-foreground">
                    <RefreshCw className="mx-auto size-5 animate-spin mb-2" />
                    Loading parcel shipments...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center">
                    <XCircle className="mx-auto size-8 text-muted-foreground/60 mb-2" />
                    <p className="font-semibold text-sm">No shipments found</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      No parcel records match your active search or filter.
                    </p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const shippingAddr =
                    order.addresses?.find((a) => a.type === "SHIPPING") ??
                    order.addresses?.[0];

                  const courierName =
                    order.shipment?.courierName ||
                    order.shippingMethodName ||
                    "Standard Courier";

                  const trackingNumber =
                    order.shipment?.trackingNumber ||
                    order.shipment?.consignmentId;

                  const isPrepaid =
                    order.paymentStatus === "PAID" ||
                    Number(order.dueAmount ?? 0) <= 0;

                  return (
                    <tr
                      key={order.id}
                      className={`transition-colors hover:bg-muted/30 ${
                        selectedOrderIds.has(order.id) ? "bg-primary/5" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3.5 pl-4 align-top w-9">
                        <input
                          type="checkbox"
                          checked={selectedOrderIds.has(order.id)}
                          onChange={() => handleToggleOrder(order.id)}
                          aria-label={`Select order ${order.orderNumber}`}
                          className="rounded border-input text-primary focus:ring-primary size-4 cursor-pointer mt-0.5"
                        />
                      </td>

                      {/* Order Reference */}
                      <td className="p-3.5 align-top">
                        <Link
                          href={`/admin/orders/${order.orderNumber}`}
                          className="font-mono font-bold text-primary hover:underline text-xs"
                        >
                          #{order.orderNumber}
                        </Link>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {new Date(order.placedAt || order.createdAt).toLocaleDateString(
                            "en-GB",
                            { day: "numeric", month: "short", year: "numeric" }
                          )}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {order.items?.length || 0} product lines
                        </p>
                      </td>

                      {/* Products / Items */}
                      <td className="p-3.5 align-top max-w-[240px]">
                        {order.items && order.items.length > 0 ? (
                          <div className="flex items-start gap-2.5">
                            {(() => {
                              const firstItem = order.items[0];
                              const img =
                                firstItem.product?.images?.find(
                                  (i: any) => i.isPrimary
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

                      {/* Recipient & Destination */}
                      <td className="p-3.5 align-top max-w-[200px]">
                        <p className="font-semibold text-foreground truncate">
                          {shippingAddr?.fullName || order.customerName}
                        </p>
                        <p className="font-mono text-[11px] text-muted-foreground">
                          {shippingAddr?.phone || order.customerPhone}
                        </p>
                        <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                          {shippingAddr?.district
                            ? `${shippingAddr.district}, ${shippingAddr.upazila || ""}`
                            : "Address on file"}
                        </p>
                      </td>

                      {/* Courier & Tracking */}
                      <td className="p-3.5 align-top">
                        <div className="flex items-center gap-1.5">
                          <Truck className="size-3.5 text-primary" />
                          <span className="font-semibold text-foreground">
                            {courierName}
                          </span>
                        </div>
                        {trackingNumber ? (
                          <div className="mt-1">
                            {order.shipment?.trackingUrl ? (
                              <a
                                href={order.shipment.trackingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-mono text-[11px] text-primary hover:underline inline-flex items-center gap-1"
                              >
                                {trackingNumber}
                                <ExternalLink className="size-2.5" />
                              </a>
                            ) : (
                              <span className="font-mono text-[11px] text-muted-foreground">
                                {trackingNumber}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-foreground italic mt-0.5 block">
                            Pending assignment
                          </span>
                        )}
                      </td>

                      {/* Payment / COD */}
                      <td className="p-3.5 align-top">
                        {isPrepaid ? (
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 text-[10px]">
                            Prepaid (৳0 COD)
                          </Badge>
                        ) : (
                          <div className="space-y-0.5">
                            <Badge variant="outline" className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 text-[10px]">
                              COD: ৳{Number(order.dueAmount || order.grandTotal).toLocaleString()}
                            </Badge>
                          </div>
                        )}
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Total: ৳{Number(order.grandTotal).toFixed(2)}
                        </p>
                      </td>

                      {/* Order Status */}
                      <td className="p-3.5 align-top">
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${statusStyle[order.status] || "bg-muted text-muted-foreground"}`}
                        >
                          {order.status}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 pr-4 align-top text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShippingLabelOrder(order)}
                            className="h-7 text-[11px] gap-1 border-primary/30 text-primary hover:bg-primary/5 font-semibold cursor-pointer"
                            title="Print Thermal Shipping Label"
                          >
                            <Tag className="size-3" />
                            Shipping Label
                          </Button>

                          <Link href={`/admin/orders/${order.orderNumber}`}>
                            <Button
                              size="icon-sm"
                              variant="ghost"
                              className="h-7 w-7"
                              title="View Order Details"
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

        {/* Admin Pagination */}
        <AdminPagination
          page={page}
          limit={limit}
          total={meta?.total ?? orders.length}
          totalPages={meta?.totalPages ?? 1}
          onPageChange={setPage}
          onLimitChange={setLimit}
          disabled={isLoading || isFetching}
        />
      </section>

      {/* ── Single Shipping Label Modal ────────────────────────────────────── */}
      {shippingLabelOrder && (
        <ShippingLabelModal
          order={shippingLabelOrder}
          open={Boolean(shippingLabelOrder)}
          onOpenChange={(open) => !open && setShippingLabelOrder(null)}
        />
      )}

      {/* ── Bulk Shipping Label Modal ──────────────────────────────────────── */}
      {isBulkShippingLabelOpen && (
        <ShippingLabelModal
          orders={orders.filter((o) => selectedOrderIds.has(o.id))}
          open={isBulkShippingLabelOpen}
          onOpenChange={setIsBulkShippingLabelOpen}
        />
      )}
    </div>
  );
}
