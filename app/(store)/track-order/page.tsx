"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  AlertCircle,
  HelpCircle,
  ShoppingBag,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Phone,
} from "lucide-react";
import { StoreContainer } from "@/components/layout/store/StoreContainer";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useLazyTrackOrderQuery } from "@/modules/order/orderApi";
import type { OrderTrackData } from "@/modules/order/order.types";

const TRACKING_STEPS = [
  { key: "PENDING", label: "Order Placed", desc: "Order details received" },
  { key: "CONFIRMED", label: "Confirmed", desc: "Order verified & accepted" },
  { key: "PROCESSING", label: "Processing", desc: "Item being prepared" },
  { key: "SHIPPED", label: "Shipped", desc: "Handed over to courier" },
  { key: "DELIVERED", label: "Delivered", desc: "Safely reached customer" },
];

export default function TrackOrderPage() {
  const searchParams = useSearchParams();
  const orderFromQuery = searchParams.get("orderNumber") || "";

  const [orderNumber, setOrderNumber] = useState(orderFromQuery);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [orderResult, setOrderResult] = useState<OrderTrackData | null>(null);

  const [triggerTrack, { isLoading, isError, error }] =
    useLazyTrackOrderQuery();

  const handleTrack = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanNumber = orderNumber.trim();
    if (!cleanNumber) {
      toast.error("Please enter your Order Number");
      return;
    }

    setHasSearched(true);
    try {
      const res = await triggerTrack({
        orderNumber: cleanNumber,
        phone: phoneNumber.trim() || undefined,
      }).unwrap();
      setOrderResult(res.data);
    } catch (err: any) {
      setOrderResult(null);
      toast.error(
        err?.data?.message || err?.message || "Order not found. Please verify the order number."
      );
    }
  };

  // Auto trigger if orderNumber was in query params
  useEffect(() => {
    if (orderFromQuery) {
      triggerTrack({ orderNumber: orderFromQuery.trim() })
        .unwrap()
        .then((res) => {
          setOrderResult(res.data);
          setHasSearched(true);
        })
        .catch(() => {
          setHasSearched(true);
        });
    }
  }, [orderFromQuery, triggerTrack]);

  // Determine current step index
  const getStepStatus = (stepKey: string, currentStatus: string) => {
    const orderHierarchy = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];
    if (currentStatus === "CANCELLED") {
      return stepKey === "PENDING" ? "completed" : "cancelled";
    }
    const currentIdx = orderHierarchy.indexOf(currentStatus);
    const stepIdx = orderHierarchy.indexOf(stepKey);

    if (currentIdx === -1) return "upcoming";
    if (stepIdx < currentIdx) return "completed";
    if (stepIdx === currentIdx) return "active";
    return "upcoming";
  };

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-muted/30 py-8 sm:py-16">
      <StoreContainer className="max-w-4xl">
        {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex items-center gap-2 text-xs text-muted-foreground"
        >
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span>/</span>
          <span className="font-medium text-foreground">Track Order</span>
        </nav>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4 shadow-xs">
            <Truck className="size-7" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            Track Your Order
          </h1>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Check the live delivery status of your order anytime without needing an account. Just enter your Order Reference Number below.
          </p>
        </div>

        {/* ── Search Input Box ────────────────────────────────────────────── */}
        <Card className="rounded-2xl border-border bg-card shadow-sm mb-10 overflow-hidden">
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleTrack} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-[1fr_220px_auto]">
                <div className="relative">
                  <Package className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Order Number (e.g. ORD-20261006-XXXXXX-XXXX)"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    className="h-12 pl-10 text-sm font-mono font-medium rounded-xl"
                  />
                </div>

                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder="Phone number (optional)"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="h-12 pl-10 text-sm rounded-xl"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={isLoading || !orderNumber.trim()}
                  className="h-12 px-7 text-sm font-bold gap-2 rounded-xl shadow-xs"
                >
                  <Search className="size-4" />
                  {isLoading ? "Searching..." : "Track Order"}
                </Button>
              </div>

              <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                <HelpCircle className="size-3.5 text-muted-foreground shrink-0" />
                <span>
                  You can find your order number in the SMS confirmation or on your order receipt screen.
                </span>
              </p>
            </form>
          </CardContent>
        </Card>

        {/* ── Dynamic Content: Result or Empty State ───────────────────────── */}
        {isLoading ? (
          <div className="rounded-2xl border bg-card p-10 text-center space-y-4">
            <div className="mx-auto size-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm font-medium text-muted-foreground">
              Retrieving order and tracking status...
            </p>
          </div>
        ) : orderResult ? (
          /* ══════════════════════════════════════════════════════════════════
              ORDER FOUND: TRACKING TIMELINE & DETAILS
          ══════════════════════════════════════════════════════════════════ */
          <div className="space-y-6 animate-in fade-in-50 duration-300">
            {/* Top Overview Banner */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Order Tracking
                  </span>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <h2 className="text-xl font-black font-mono tracking-tight text-foreground">
                      #{orderResult.orderNumber}
                    </h2>
                    <Badge
                      variant={
                        orderResult.status === "DELIVERED"
                          ? "default"
                          : orderResult.status === "CANCELLED"
                          ? "destructive"
                          : "secondary"
                      }
                      className="text-xs font-bold"
                    >
                      {orderResult.status}
                    </Badge>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xs text-muted-foreground">Placed by</span>
                  <p className="text-sm font-bold text-foreground">
                    {orderResult.customerName}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {orderResult.placedAt
                      ? format(new Date(orderResult.placedAt), "dd MMMM yyyy, hh:mm a")
                      : ""}
                  </p>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="mt-8 pt-2">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 relative">
                  {TRACKING_STEPS.map((step, idx) => {
                    const status = getStepStatus(step.key, orderResult.status);
                    const isCompleted = status === "completed";
                    const isActive = status === "active";
                    const isCancelled = status === "cancelled";

                    return (
                      <div
                        key={step.key}
                        className={cn(
                          "flex flex-col items-center text-center relative",
                          idx < TRACKING_STEPS.length - 1 &&
                            "sm:after:content-[''] sm:after:absolute sm:after:top-4 sm:after:left-[50%] sm:after:w-full sm:after:h-0.5 sm:after:z-0",
                          idx < TRACKING_STEPS.length - 1 &&
                            (isCompleted
                              ? "sm:after:bg-primary"
                              : "sm:after:bg-muted")
                        )}
                      >
                        <div
                          className={cn(
                            "relative z-10 flex size-9 items-center justify-center rounded-full border-2 text-xs font-bold transition-all shadow-xs",
                            isCompleted && "bg-primary border-primary text-primary-foreground",
                            isActive && "bg-background border-primary text-primary ring-4 ring-primary/20 animate-pulse",
                            isCancelled && "bg-destructive/10 border-destructive text-destructive",
                            status === "upcoming" && "bg-muted border-muted-foreground/30 text-muted-foreground"
                          )}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="size-5" />
                          ) : (
                            <span>{idx + 1}</span>
                          )}
                        </div>

                        <span
                          className={cn(
                            "mt-3 text-xs font-bold",
                            isActive || isCompleted
                              ? "text-foreground"
                              : "text-muted-foreground"
                          )}
                        >
                          {step.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground mt-0.5 max-w-[120px]">
                          {step.desc}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Courier Tracking Link (if shipped) */}
              {orderResult.shipment && (
                <div className="mt-6 rounded-xl bg-primary/5 border border-primary/20 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <Truck className="size-5 text-primary shrink-0" />
                    <div>
                      <p className="font-bold text-foreground">
                        Courier: {orderResult.shipment.courierName || "Express Courier"}
                      </p>
                      {orderResult.shipment.trackingNumber && (
                        <p className="text-muted-foreground font-mono">
                          Tracking ID: {orderResult.shipment.trackingNumber}
                        </p>
                      )}
                    </div>
                  </div>

                  {orderResult.shipment.trackingUrl && (
                    <a
                      href={orderResult.shipment.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        buttonVariants({ variant: "default", size: "sm" }),
                        "gap-1.5 text-xs font-semibold self-start sm:self-auto"
                      )}
                    >
                      Track on Courier Site
                      <ExternalLink className="size-3.5" />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Delivery & Items Summary */}
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Delivery Meta */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <MapPin className="size-4 text-primary" />
                  <span>Delivery Information</span>
                </div>
                <div className="text-xs space-y-1.5 text-muted-foreground">
                  <p>
                    <span className="font-semibold text-foreground">Destination:</span>{" "}
                    {orderResult.deliveryDistrict}, Bangladesh
                  </p>
                  <p>
                    <span className="font-semibold text-foreground">Zone:</span>{" "}
                    {orderResult.shippingZoneName || "Bangladesh"}
                  </p>
                  <p>
                    <span className="font-semibold text-foreground">Delivery Method:</span>{" "}
                    {orderResult.shippingMethodName || "Standard Delivery"}
                  </p>
                </div>
              </div>

              {/* Amount Summary */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <ShieldCheck className="size-4 text-primary" />
                  <span>Order Total</span>
                </div>
                <div className="text-xs space-y-1 text-muted-foreground">
                  <p>
                    <span className="font-semibold text-foreground">Items:</span>{" "}
                    {orderResult.itemCount} items
                  </p>
                  <div className="pt-2 flex items-baseline justify-between border-t mt-2">
                    <span className="font-semibold text-foreground">Total Payable (COD):</span>
                    <span className="text-xl font-black text-primary">
                      ৳{Number(orderResult.grandTotal).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items List */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
                Ordered Items ({orderResult.items?.length || 0})
              </h3>
              <div className="divide-y text-xs">
                {orderResult.items?.map((item) => (
                  <div
                    key={item.id}
                    className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0"
                  >
                    <div>
                      <p className="font-semibold text-foreground">{item.productName}</p>
                      <p className="text-[11px] text-muted-foreground">
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
                    <span className="font-bold text-foreground">
                      ৳{Number(item.lineTotal).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : hasSearched ? (
          /* ══════════════════════════════════════════════════════════════════
              NOT FOUND EMPTY STATE
          ══════════════════════════════════════════════════════════════════ */
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 mb-4">
              <AlertCircle className="size-7" />
            </div>
            <h3 className="text-lg font-bold text-foreground">
              Order Not Found
            </h3>
            <p className="mt-1.5 text-xs text-muted-foreground max-w-sm mx-auto">
              We couldn&apos;t find any order matching &ldquo;<span className="font-mono font-medium">{orderNumber}</span>&rdquo;. Please double check your order number or phone number and try again.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setOrderNumber("");
                setPhoneNumber("");
                setHasSearched(false);
              }}
              className="mt-5 text-xs font-semibold"
            >
              Clear and Search Again
            </Button>
          </div>
        ) : (
          /* ══════════════════════════════════════════════════════════════════
              INITIAL EMPTY STATE (BEFORE SEARCH)
          ══════════════════════════════════════════════════════════════════ */
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground mb-4">
              <Package className="size-7" />
            </div>
            <h3 className="text-lg font-bold text-foreground">
              No Tracking Search Yet
            </h3>
            <p className="mt-1.5 text-xs text-muted-foreground max-w-sm mx-auto">
              Enter your Order Reference Number in the input field above to view real-time delivery status, timeline, and item receipts.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/products"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-xs font-semibold gap-1.5")}
              >
                <ShoppingBag className="size-3.5" />
                Browse Catalog
              </Link>
              <Link
                href="/account/orders"
                className={cn(buttonVariants({ size: "sm" }), "text-xs font-semibold gap-1.5")}
              >
                Sign In to View All Orders
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        )}
      </StoreContainer>
    </main>
  );
}
