"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import {
  CheckCircle2,
  Eye,
  MapPin,
  Package,
  Search,
  Truck,
  XCircle,
  Printer,
  Tag,
  ExternalLink,
  RefreshCw,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useListAdminOrdersQuery } from "@/modules/order/orderApi";
import { ShippingLabelModal } from "@/modules/order/components/shipping-label/ShippingLabelModal";
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
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<number>>(new Set());

  // Modal states
  const [shippingLabelOrder, setShippingLabelOrder] = useState<Order | null>(null);
  const [isBulkShippingLabelOpen, setIsBulkShippingLabelOpen] = useState(false);

  const { data, isLoading, isFetching, refetch } = useListAdminOrdersQuery({
    limit: 50,
    search: search.trim() || undefined,
    status: statusFilter !== "ALL" ? statusFilter : undefined,
  });

  const orders = data?.data ?? [];

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

  // Stats
  const totalShipments = orders.length;
  const inTransit = orders.filter((o) => o.status === "SHIPPED").length;
  const processing = orders.filter((o) => o.status === "PROCESSING").length;
  const delivered = orders.filter((o) => o.status === "DELIVERED").length;

  return (
    <div className="container mx-auto space-y-6">
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <nav className="mb-2 text-xs text-muted-foreground flex items-center gap-1.5">
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
          <p className="mt-1 text-xs text-muted-foreground">
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
      </header>

      {/* ── Stat Counters ────────────────────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <button
          type="button"
          onClick={() => setStatusFilter("ALL")}
          className={`rounded-xl border bg-card p-4 text-left shadow-2xs transition hover:border-primary/40 ${
            statusFilter === "ALL" ? "border-primary ring-1 ring-primary/20" : ""
          }`}
        >
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>All Orders / Parcels</span>
            <Package className="size-4" />
          </div>
          <b className="mt-2 block text-2xl font-black">{totalShipments}</b>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("PROCESSING")}
          className={`rounded-xl border bg-card p-4 text-left shadow-2xs transition hover:border-primary/40 ${
            statusFilter === "PROCESSING" ? "border-primary ring-1 ring-primary/20" : ""
          }`}
        >
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Ready for Courier Handover</span>
            <Clock className="size-4 text-blue-600" />
          </div>
          <b className="mt-2 block text-2xl font-black text-blue-600">{processing}</b>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("SHIPPED")}
          className={`rounded-xl border bg-card p-4 text-left shadow-2xs transition hover:border-primary/40 ${
            statusFilter === "SHIPPED" ? "border-primary ring-1 ring-primary/20" : ""
          }`}
        >
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>In Transit / Shipped</span>
            <Truck className="size-4 text-violet-600" />
          </div>
          <b className="mt-2 block text-2xl font-black text-violet-600">{inTransit}</b>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("DELIVERED")}
          className={`rounded-xl border bg-card p-4 text-left shadow-2xs transition hover:border-primary/40 ${
            statusFilter === "DELIVERED" ? "border-primary ring-1 ring-primary/20" : ""
          }`}
        >
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Delivered Parcels</span>
            <CheckCircle2 className="size-4 text-emerald-600" />
          </div>
          <b className="mt-2 block text-2xl font-black text-emerald-600">{delivered}</b>
        </button>
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
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order #, recipient name, phone, or tracking..."
              className="h-9 pl-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-lg border bg-background px-3 text-xs font-medium"
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
                <th className="p-3.5">Order Reference</th>
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
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    <RefreshCw className="mx-auto size-5 animate-spin mb-2" />
                    Loading parcel shipments...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
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

                      {/* Recipient & Destination */}
                      <td className="p-3.5 align-top max-w-[220px]">
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

        <div className="flex items-center justify-between border-t px-4 py-3 text-xs text-muted-foreground">
          <span>
            Showing <b className="text-foreground">{orders.length}</b> orders / shipments
          </span>
        </div>
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
