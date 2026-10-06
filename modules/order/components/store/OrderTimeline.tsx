"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  XCircle,
  MapPin,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface OrderTimelineProps {
  status:
    | "PENDING"
    | "CONFIRMED"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED"
    | string;
  placedAt?: string | null;
  confirmedAt?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  cancelledAt?: string | null;
  shipment?: {
    status?: string | null;
    courierName?: string | null;
    trackingNumber?: string | null;
    trackingUrl?: string | null;
    shippedAt?: string | null;
    deliveredAt?: string | null;
  } | null;
  className?: string;
}

const STEPS = [
  {
    key: "PENDING",
    label: "Order Placed",
    desc: "Order submitted & pending review",
    icon: Clock,
  },
  {
    key: "CONFIRMED",
    label: "Confirmed",
    desc: "Verified by our sales team",
    icon: CheckCircle2,
  },
  {
    key: "PROCESSING",
    label: "Processing",
    desc: "Packed & quality-checked",
    icon: Package,
  },
  {
    key: "SHIPPED",
    label: "Shipped",
    desc: "Handed over to delivery courier",
    icon: Truck,
  },
  {
    key: "DELIVERED",
    label: "Delivered",
    desc: "Safely received by customer",
    icon: MapPin,
  },
];

export function OrderTimeline({
  status,
  placedAt,
  confirmedAt,
  shippedAt,
  deliveredAt,
  cancelledAt,
  shipment,
  className,
}: OrderTimelineProps) {
  const [copiedCode, setCopiedCode] = useState(false);

  const orderHierarchy = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];
  const currentIdx = orderHierarchy.indexOf(status);
  const isCancelled = status === "CANCELLED";

  const getStepDate = (key: string) => {
    switch (key) {
      case "PENDING":
        return placedAt ? format(new Date(placedAt), "dd MMM, hh:mm a") : null;
      case "CONFIRMED":
        return confirmedAt ? format(new Date(confirmedAt), "dd MMM, hh:mm a") : null;
      case "PROCESSING":
        return confirmedAt && currentIdx >= 2
          ? format(new Date(confirmedAt), "dd MMM, hh:mm a")
          : null;
      case "SHIPPED":
        return shippedAt || shipment?.shippedAt
          ? format(new Date((shippedAt || shipment?.shippedAt)!), "dd MMM, hh:mm a")
          : null;
      case "DELIVERED":
        return deliveredAt || shipment?.deliveredAt
          ? format(new Date((deliveredAt || shipment?.deliveredAt)!), "dd MMM, hh:mm a")
          : null;
      default:
        return null;
    }
  };

  const handleCopyTracking = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    toast.success("Tracking number copied to clipboard!");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* ── Cancelled Notice if applicable ── */}
      {isCancelled && (
        <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-4 text-xs dark:bg-rose-950/20 dark:border-rose-900/50">
          <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold">
            <XCircle className="size-4" />
            <span>Order Cancelled</span>
          </div>
          <p className="mt-1 text-muted-foreground">
            This order was cancelled
            {cancelledAt ? ` on ${format(new Date(cancelledAt), "dd MMMM yyyy, hh:mm a")}` : ""}.
            Any reserved inventory has been released.
          </p>
        </div>
      )}

      {/* ── Timeline Steps ── */}
      {!isCancelled && (
        <div className="relative pt-2 pb-1">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5 relative">
            {STEPS.map((step, idx) => {
              const isCompleted = currentIdx > idx;
              const isActive = currentIdx === idx;
              const isUpcoming = currentIdx < idx;
              const stepDate = getStepDate(step.key);

              return (
                <div
                  key={step.key}
                  className={cn(
                    "flex flex-col items-center text-center relative",
                    idx < STEPS.length - 1 &&
                      "sm:after:content-[''] sm:after:absolute sm:after:top-4 sm:after:left-[50%] sm:after:w-full sm:after:h-0.5 sm:after:z-0",
                    idx < STEPS.length - 1 &&
                      (isCompleted
                        ? "sm:after:bg-primary"
                        : "sm:after:bg-muted-foreground/20")
                  )}
                >
                  {/* Step Circle */}
                  <div
                    className={cn(
                      "relative z-10 flex size-9 items-center justify-center rounded-full border-2 text-xs font-bold transition-all shadow-xs",
                      isCompleted &&
                        "bg-primary border-primary text-primary-foreground",
                      isActive &&
                        "bg-background border-primary text-primary ring-4 ring-primary/20 animate-pulse",
                      isUpcoming &&
                        "bg-muted/60 border-muted-foreground/25 text-muted-foreground"
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="size-5" />
                    ) : (
                      <span>{idx + 1}</span>
                    )}
                  </div>

                  {/* Step Label */}
                  <span
                    className={cn(
                      "mt-2.5 text-xs font-bold",
                      isActive
                        ? "text-primary"
                        : isCompleted
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </span>

                  {/* Timestamp if available */}
                  {stepDate ? (
                    <span className="text-[10px] font-semibold text-primary/80 mt-0.5">
                      {stepDate}
                    </span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground mt-0.5 max-w-[110px] line-clamp-2">
                      {step.desc}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Courier Shipment Box ── */}
      {shipment && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 transition-all">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start sm:items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
                <Truck className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-foreground">
                    {shipment.courierName || "Express Courier"}
                  </span>
                  {shipment.status && (
                    <Badge variant="outline" className="border-primary/30 text-[10px] font-semibold">
                      {shipment.status.replace(/_/g, " ")}
                    </Badge>
                  )}
                </div>

                {shipment.trackingNumber ? (
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                    <span>Tracking:</span>
                    <span className="font-mono font-bold text-foreground bg-background/80 px-2 py-0.5 rounded border border-border/60">
                      {shipment.trackingNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyTracking(shipment.trackingNumber!)}
                      className="p-1 hover:text-foreground text-muted-foreground transition-colors"
                      title="Copy Tracking ID"
                    >
                      {copiedCode ? (
                        <Check className="size-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Consignment ID will appear once dispatched from hub.
                  </p>
                )}
              </div>
            </div>

            {/* External Tracking Link */}
            {shipment.trackingUrl && (
              <a
                href={shipment.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: "default", size: "sm" }),
                  "h-8 gap-1.5 text-xs font-semibold shrink-0 self-start sm:self-auto"
                )}
              >
                Track on Courier
                <ExternalLink className="size-3.5" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
