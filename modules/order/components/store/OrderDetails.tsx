"use client";

import { format } from "date-fns";
import {
  Package,
  MapPin,
  Clock,
  Truck,
  CreditCard,
  FileText,
  Tag,
  CheckCircle2,
  Calendar,
  XCircle,
  ExternalLink,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import type { Order } from "../../order.types";

interface OrderDetailsProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderDetails({ order, open, onOpenChange }: OrderDetailsProps) {
  if (!order) return null;

  const shippingAddr =
    order.addresses?.find((a) => a.type === "SHIPPING") ??
    order.addresses?.[0];

  const formattedPlacedDate = order.placedAt
    ? format(new Date(order.placedAt), "dd MMMM yyyy, hh:mm a")
    : format(new Date(order.createdAt), "dd MMMM yyyy");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <span className="text-xs text-muted-foreground font-medium">
                Order Reference
              </span>
              <DialogTitle className="text-xl font-bold font-mono tracking-tight mt-0.5">
                #{order.orderNumber}
              </DialogTitle>
            </div>
            <Badge variant="outline" className="text-xs font-semibold px-3 py-1">
              {order.status}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
            <Calendar className="size-3.5" /> Placed on {formattedPlacedDate}
          </p>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* ── Items Breakdown ────────────────────────────────────────────── */}
          <div>
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
              Items Ordered ({order.items?.length || 0})
            </h4>
            <div className="rounded-xl border divide-y bg-muted/20">
              {order.items?.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-card border text-muted-foreground font-bold">
                      <Package className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate">
                        {item.productName}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Qty: {item.quantity} × ৳{Number(item.unitPrice).toFixed(2)}
                      </p>
                      {item.attributes && item.attributes.length > 0 && (
                        <p className="text-[10px] text-muted-foreground">
                          {item.attributes
                            .map((a) => `${a.attributeName}: ${a.attributeValue}`)
                            .join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="font-bold text-foreground shrink-0">
                    ৳{Number(item.lineTotal).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Shipping & Delivery Address ─────────────────────────────────── */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border p-4 bg-card space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <MapPin className="size-4 text-primary" />
                <span>Delivery Address</span>
              </div>
              {shippingAddr ? (
                <div className="text-xs space-y-1 text-muted-foreground">
                  <p className="font-semibold text-foreground">{shippingAddr.fullName}</p>
                  <p>{shippingAddr.phone}</p>
                  <p className="text-foreground">{shippingAddr.addressLine1}</p>
                  {shippingAddr.addressLine2 && <p>{shippingAddr.addressLine2}</p>}
                  <p>
                    {shippingAddr.upazila ? `${shippingAddr.upazila}, ` : ""}
                    {shippingAddr.district}, Bangladesh
                  </p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Standard delivery address</p>
              )}
            </div>

            <div className="rounded-xl border p-4 bg-card space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <Truck className="size-4 text-primary" />
                <span>Shipping & Payment</span>
              </div>
              <div className="text-xs space-y-1 text-muted-foreground">
                <p>
                  <span className="font-medium text-foreground">Method:</span>{" "}
                  {order.shippingMethodName || "Standard Delivery"}
                </p>
                <p>
                  <span className="font-medium text-foreground">Zone:</span>{" "}
                  {order.shippingZoneName || "Bangladesh"}
                </p>
                <p>
                  <span className="font-medium text-foreground">Payment:</span>{" "}
                  {order.paymentMethod === "CASH_ON_DELIVERY" ? "Cash on Delivery" : "Online"} (
                  <span className="font-semibold">{order.paymentStatus}</span>)
                </p>
                {order.customerNote && (
                  <p className="pt-1 text-[11px] italic">
                    Note: &ldquo;{order.customerNote}&rdquo;
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── Financial Summary ───────────────────────────────────────────── */}
          <div className="rounded-xl border p-4 bg-muted/30 space-y-2.5 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="font-medium text-foreground">
                ৳{Number(order.subtotal).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Delivery Fee</span>
              <span className="font-medium text-foreground">
                {Number(order.shippingCharge) === 0
                  ? "FREE"
                  : `৳${Number(order.shippingCharge).toFixed(2)}`}
              </span>
            </div>
            {Number(order.discountAmount) > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="flex items-center gap-1">
                  <Tag className="size-3" /> Discount ({order.couponCode || "Coupon"})
                </span>
                <span>-৳{Number(order.discountAmount).toFixed(2)}</span>
              </div>
            )}
            <Separator className="my-2" />
            <div className="flex justify-between text-sm font-bold text-foreground">
              <span>Grand Total</span>
              <span className="text-base text-primary font-black">
                ৳{Number(order.grandTotal).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
