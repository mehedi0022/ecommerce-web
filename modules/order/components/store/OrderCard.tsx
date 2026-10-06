"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Package,
  Calendar,
  CreditCard,
  Truck,
  ChevronRight,
  Eye,
  Printer,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Tag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { mediaUrl } from "@/modules/catalog/catalog.utils";
import { OrderInvoiceModal } from "../invoice/OrderInvoiceModal";
import type { Order } from "../../order.types";

const statusConfig: Record<
  Order["status"],
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof Clock; className: string }
> = {
  PENDING: {
    label: "Pending Review",
    variant: "secondary",
    icon: Clock,
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  CONFIRMED: {
    label: "Confirmed",
    variant: "default",
    icon: CheckCircle2,
    className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  PROCESSING: {
    label: "Processing",
    variant: "default",
    icon: Package,
    className: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  },
  SHIPPED: {
    label: "Shipped",
    variant: "default",
    icon: Truck,
    className: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  },
  DELIVERED: {
    label: "Delivered",
    variant: "default",
    icon: CheckCircle2,
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  CANCELLED: {
    label: "Cancelled",
    variant: "destructive",
    icon: XCircle,
    className: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  },
};

interface OrderCardProps {
  order: Order;
  onViewDetails?: (order: Order) => void;
}

export function OrderCard({ order, onViewDetails }: OrderCardProps) {
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const statusInfo = statusConfig[order.status] ?? {
    label: order.status,
    variant: "outline",
    icon: AlertCircle,
    className: "bg-muted text-muted-foreground",
  };
  const StatusIcon = statusInfo.icon;

  const formattedDate = order.placedAt
    ? format(new Date(order.placedAt), "dd MMM yyyy, hh:mm a")
    : format(new Date(order.createdAt), "dd MMM yyyy");

  const totalQuantity = (order.items || []).reduce((n, i) => n + i.quantity, 0);

  return (
    <div className="group rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs transition-all hover:border-primary/40 hover:shadow-sm">
      {/* ── Top Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-sm font-bold text-foreground tracking-tight">
              #{order.orderNumber}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border",
                statusInfo.className
              )}
            >
              <StatusIcon className="size-3" />
              {statusInfo.label}
            </span>
            {order.paymentStatus === "PAID" ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-[11px] font-medium">
                Paid
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted text-muted-foreground border px-2 py-0.5 text-[11px] font-medium">
                Unpaid (COD)
              </span>
            )}
          </div>
          <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="size-3.5" />
            <span>Placed on {formattedDate}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:self-center">
          <Link
            href={`/track-order?orderNumber=${order.orderNumber}`}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "h-8 text-xs font-semibold gap-1.5 border-primary/20 text-primary hover:bg-primary/5"
            )}
          >
            <Truck className="size-3.5" />
            Track
          </Link>
          <button
            type="button"
            onClick={() => setShowInvoiceModal(true)}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "h-8 text-xs font-medium gap-1.5 cursor-pointer"
            )}
          >
            <Printer className="size-3.5" />
            Invoice
          </button>
          {onViewDetails && (
            <button
              type="button"
              onClick={() => onViewDetails(order)}
              className={cn(
                buttonVariants({ variant: "default", size: "sm" }),
                "h-8 text-xs font-semibold gap-1"
              )}
            >
              Details
              <ChevronRight className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Item Previews ──────────────────────────────────────────────── */}
      <div className="mt-4 space-y-3">
        {order.items?.map((item) => {
          const itemImg =
            item.product?.images?.find((img) => img.isPrimary)?.imageUrl ||
            item.product?.images?.[0]?.imageUrl;

          return (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 text-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted border overflow-hidden relative">
                  {itemImg ? (
                    <img
                      src={mediaUrl(itemImg)}
                      alt={item.productName}
                      className="size-full object-cover"
                    />
                  ) : (
                    <Package className="size-4 text-muted-foreground" />
                  )}
                </div>
              <div className="min-w-0">
                <p className="font-semibold text-foreground truncate">
                  {item.productName}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span>Qty: {item.quantity}</span>
                  {item.attributes && item.attributes.length > 0 && (
                    <>
                      <span>•</span>
                      <span>
                        {item.attributes
                          .map((a) => `${a.attributeName}: ${a.attributeValue}`)
                          .join(", ")}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="font-bold text-foreground">
                ৳{Number(item.lineTotal).toFixed(2)}
              </span>
            </div>
          </div>
        );
      })}
      </div>

      {/* ── Footer Summary ─────────────────────────────────────────────── */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t pt-3 text-xs">
        <div className="flex items-center gap-3 text-muted-foreground">
          <span>
            {totalQuantity} {totalQuantity === 1 ? "item" : "items"}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Truck className="size-3.5" />
            {order.shippingMethodName || "Standard Delivery"}
          </span>
          {order.shipment?.courierName && (
            <>
              <span>•</span>
              <span className="font-semibold text-primary flex items-center gap-1">
                {order.shipment.courierName}
                {order.shipment.trackingNumber && ` (${order.shipment.trackingNumber})`}
              </span>
            </>
          )}
          {order.couponCode && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <Tag className="size-3" />
                {order.couponCode}
              </span>
            </>
          )}
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-muted-foreground">Total:</span>
          <span className="text-base font-black text-foreground">
            ৳{Number(order.grandTotal).toFixed(2)}
          </span>
        </div>
      </div>

      <OrderInvoiceModal
        order={order}
        open={showInvoiceModal}
        onOpenChange={setShowInvoiceModal}
      />
    </div>
  );
}
