"use client";

import { Suspense, useState, useEffect } from "react";
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
import { mediaUrl } from "@/modules/catalog/catalog.utils";
import { useLazyTrackOrderQuery } from "@/modules/order/orderApi";
import { OrderTimeline } from "@/modules/order/components/store/OrderTimeline";
import type { OrderTrackData } from "@/modules/order/order.types";

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const orderFromQuery = searchParams.get("orderNumber") || "";
  const phoneFromQuery = searchParams.get("phone") || "";

  const [orderNumber, setOrderNumber] = useState(orderFromQuery);
  const [phoneNumber, setPhoneNumber] = useState(phoneFromQuery);
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

    const cleanPhone = phoneNumber.trim();
    if (!cleanPhone) {
      toast.error("Please enter the recipient phone number to verify and track your order");
      return;
    }

    setHasSearched(true);
    try {
      const res = await triggerTrack({
        orderNumber: cleanNumber,
        phone: cleanPhone,
      }).unwrap();
      setOrderResult(res.data);
    } catch (err: any) {
      setOrderResult(null);
      toast.error(
        err?.data?.message || err?.message || "No order found matching the provided details."
      );
    }
  };

  // Auto trigger if both orderNumber and phone were provided in query params
  useEffect(() => {
    if (orderFromQuery && phoneFromQuery) {
      triggerTrack({
        orderNumber: orderFromQuery.trim(),
        phone: phoneFromQuery.trim(),
      })
        .unwrap()
        .then((res) => {
          setOrderResult(res.data);
          setHasSearched(true);
        })
        .catch(() => {
          setHasSearched(true);
        });
    }
  }, [orderFromQuery, phoneFromQuery, triggerTrack]);

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
                    placeholder="Recipient phone (e.g. 017XXXXXXXX)"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    className="h-12 pl-10 text-sm rounded-xl"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={isLoading || !orderNumber.trim() || !phoneNumber.trim()}
                  className="h-12 px-7 text-sm font-bold gap-2 rounded-xl shadow-xs"
                >
                  <Search className="size-4" />
                  {isLoading ? "Searching..." : "Track Order"}
                </Button>
              </div>

              <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                <HelpCircle className="size-3.5 text-muted-foreground shrink-0" />
                <span>
                  For customer security, enter your Order Number and the matching recipient phone number used during checkout.
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
              <div className="mt-8">
                <OrderTimeline
                  status={orderResult.status}
                  placedAt={orderResult.placedAt}
                  confirmedAt={orderResult.confirmedAt}
                  shippedAt={orderResult.shippedAt}
                  deliveredAt={orderResult.deliveredAt}
                  cancelledAt={orderResult.cancelledAt}
                  shipment={orderResult.shipment}
                />
              </div>
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
                    className="py-3.5 flex items-center justify-between gap-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted border overflow-hidden relative">
                        {item.imageUrl ? (
                          <img
                            src={mediaUrl(item.imageUrl)}
                            alt={item.productName}
                            className="size-full object-cover"
                          />
                        ) : (
                          <Package className="size-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0">
                        {item.productSlug ? (
                          <Link
                            href={`/products/${item.productSlug}`}
                            className="font-semibold text-foreground hover:text-primary transition-colors truncate block"
                          >
                            {item.productName}
                          </Link>
                        ) : (
                          <p className="font-semibold text-foreground truncate">
                            {item.productName}
                          </p>
                        )}
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

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="container py-12 text-center text-sm text-muted-foreground">Loading tracking portal...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}
