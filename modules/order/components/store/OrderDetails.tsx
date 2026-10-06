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
  Printer,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mediaUrl } from "@/modules/catalog/catalog.utils";
import Link from "next/link";
import { ReviewModal } from "@/modules/review/components/ReviewModal";
import { OrderTimeline } from "./OrderTimeline";
import { OrderInvoiceModal } from "../invoice/OrderInvoiceModal";
import type { Order, OrderItem } from "../../order.types";
import { useState } from "react";

interface OrderDetailsProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderDetails({ order, open, onOpenChange }: OrderDetailsProps) {
  const [reviewingItem, setReviewingItem] = useState<OrderItem | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

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
          {/* ── Order Status & Live Courier Tracking Timeline ────────────────── */}
          <div className="rounded-xl border bg-card p-4 sm:p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b pb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Truck className="size-3.5 text-primary" /> Delivery & Courier Timeline
              </span>
              <Link
                href={`/track-order?orderNumber=${order.orderNumber}`}
                target="_blank"
                className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
              >
                Public Tracking <ExternalLink className="size-3" />
              </Link>
            </div>
            <OrderTimeline
              status={order.status}
              placedAt={order.placedAt || order.createdAt}
              confirmedAt={order.confirmedAt}
              shippedAt={order.shippedAt}
              deliveredAt={order.deliveredAt}
              cancelledAt={order.cancelledAt}
              shipment={order.shipment}
            />
          </div>

          {/* ── Items Breakdown ────────────────────────────────────────────── */}
          <div>
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
              Items Ordered ({order.items?.length || 0})
            </h4>
            <div className="rounded-xl border divide-y bg-muted/20">
              {order.items?.map((item) => {
                const itemImg =
                  item.product?.images?.find((img) => img.isPrimary)?.imageUrl ||
                  item.product?.images?.[0]?.imageUrl;

                return (
                  <div
                    key={item.id}
                    className="p-3.5 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-card border overflow-hidden relative">
                        {itemImg ? (
                          <img
                            src={mediaUrl(itemImg)}
                            alt={item.productName}
                            className="size-full object-cover"
                          />
                        ) : (
                          <Package className="size-5 text-muted-foreground" />
                        )}
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
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="font-bold text-foreground">
                      ৳{Number(item.lineTotal).toFixed(2)}
                    </span>
                    {order.status === "DELIVERED" && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setReviewingItem(item)}
                        className="h-7 text-[11px] px-2.5 font-medium border-primary/30 text-primary hover:bg-primary/10"
                      >
                        Write Review
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
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

          {/* Action Row */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <span className="text-xs text-muted-foreground">
              Need a physical bill or delivery record?
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInvoiceModal(true)}
              className="gap-1.5 text-xs font-semibold cursor-pointer"
            >
              <Printer className="size-3.5" />
              Tax Invoice & Slip
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Invoice Modal */}
      <OrderInvoiceModal
        order={order}
        open={showInvoiceModal}
        onOpenChange={setShowInvoiceModal}
      />

      {/* Review Modal */}
      {reviewingItem && (
        <ReviewModal
          open={Boolean(reviewingItem)}
          onOpenChange={(open) => !open && setReviewingItem(null)}
          orderItemId={reviewingItem.id}
          productName={reviewingItem.productName}
          onSuccess={() => setReviewingItem(null)}
        />
      )}
    </Dialog>
  );
}
