"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  Clock,
  Printer,
  ArrowRight,
  Copy,
  Check,
  CreditCard,
  Banknote,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import { StoreContainer } from "@/components/layout/store/StoreContainer";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  useGetOrderByNumberQuery,
  useGetGuestOrderByNumberQuery,
} from "@/modules/order/orderApi";
import { useMeQuery } from "@/modules/auth/authApi";

export default function OrderSuccessPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const resolvedParams = use(params);
  const orderNumber = resolvedParams.orderNumber;
  const searchParams = useSearchParams();
  const [copied, setCopied] = useState(false);

  // Check if token is in search params or session storage (for guest order)
  const tokenFromUrl = searchParams.get("token") || "";
  const [guestToken, setGuestToken] = useState<string>(tokenFromUrl);

  useEffect(() => {
    if (!guestToken && typeof window !== "undefined") {
      const stored = sessionStorage.getItem(`order_token_${orderNumber}`);
      if (stored) setGuestToken(stored);
    }
  }, [orderNumber, guestToken]);

  const { data: userData } = useMeQuery();
  const isAuth = Boolean(userData?.data);

  // Authenticated query
  const {
    data: authOrderData,
    isLoading: isAuthLoading,
  } = useGetOrderByNumberQuery(orderNumber, {
    skip: !isAuth || !orderNumber,
  });

  // Guest query
  const {
    data: guestOrderData,
    isLoading: isGuestLoading,
  } = useGetGuestOrderByNumberQuery(
    { orderNumber, accessToken: guestToken },
    {
      skip: isAuth || !guestToken || !orderNumber,
    }
  );

  const isLoading = isAuth ? isAuthLoading : isGuestLoading;
  const order = authOrderData?.data || guestOrderData?.data;

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    toast.success("Order number copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const shippingAddress =
    order?.addresses.find((a) => a.type === "SHIPPING") ??
    order?.addresses[0];

  return (
    <StoreContainer className="py-10 md:py-16 max-w-4xl">
      {/* ── Success Banner ──────────────────────────────────────────────── */}
      <div className="flex flex-col items-center text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-8 ring-emerald-500/5 mb-4 animate-in zoom-in-75">
          <CheckCircle2 className="size-10" />
        </div>

        <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
          Order Confirmed!
        </h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground sm:text-base">
          Thank you for shopping with us! We have received your order and will
          begin processing it right away.
        </p>

        {/* Order Number pill */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm shadow-xs">
          <span className="text-muted-foreground">Order Number:</span>
          <span className="font-mono font-bold text-foreground">
            {orderNumber}
          </span>
          <button
            type="button"
            onClick={handleCopyOrderNumber}
            className="ml-1 inline-flex items-center gap-1 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            title="Copy order number"
          >
            {copied ? (
              <Check className="size-3.5 text-emerald-600" />
            ) : (
              <Copy className="size-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* ── Progress Timeline ───────────────────────────────────────────── */}
      <div className="mt-10 rounded-2xl border border-border bg-card p-6 shadow-xs">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="flex flex-col items-center text-center">
            <div className="flex size-8 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-bold shadow-xs">
              <Check className="size-4" />
            </div>
            <span className="mt-2 text-xs font-bold text-foreground">
              Order Placed
            </span>
            <span className="text-[10px] text-muted-foreground">Confirmed</span>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="flex size-8 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold animate-pulse">
              <Clock className="size-4" />
            </div>
            <span className="mt-2 text-xs font-bold text-foreground">
              Processing
            </span>
            <span className="text-[10px] text-muted-foreground">In Review</span>
          </div>

          <div className="flex flex-col items-center text-center opacity-50">
            <div className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-bold">
              <Truck className="size-4" />
            </div>
            <span className="mt-2 text-xs font-medium text-muted-foreground">
              Shipped
            </span>
            <span className="text-[10px] text-muted-foreground">Pending</span>
          </div>

          <div className="flex flex-col items-center text-center opacity-50">
            <div className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-bold">
              <Package className="size-4" />
            </div>
            <span className="mt-2 text-xs font-medium text-muted-foreground">
              Delivered
            </span>
            <span className="text-[10px] text-muted-foreground">Upcoming</span>
          </div>
        </div>
      </div>

      {/* ── Details Grid ────────────────────────────────────────────────── */}
      <div className="mt-8 grid gap-8 md:grid-cols-2">
        {/* Left: Shipping & Payment info */}
        <div className="space-y-6">
          {/* Shipping Address */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2 font-semibold text-foreground text-sm">
              <MapPin className="size-4 text-primary" />
              <span>Delivery Details</span>
            </div>

            {shippingAddress ? (
              <div className="text-xs space-y-1 text-muted-foreground">
                <p className="font-semibold text-foreground text-sm">
                  {shippingAddress.fullName}
                </p>
                <p>{shippingAddress.phone}</p>
                <p className="text-foreground pt-1">
                  {shippingAddress.addressLine1}
                  {shippingAddress.addressLine2
                    ? `, ${shippingAddress.addressLine2}`
                    : ""}
                </p>
                <p>
                  {shippingAddress.district}, Bangladesh{" "}
                  {shippingAddress.postalCode
                    ? `(${shippingAddress.postalCode})`
                    : ""}
                </p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Standard delivery address
              </p>
            )}

            <div className="pt-3 border-t text-xs flex items-center justify-between">
              <span className="text-muted-foreground">Delivery Method:</span>
              <span className="font-semibold text-foreground">
                {order?.shippingMethodName || "Standard Delivery (2-3 days)"}
              </span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2 font-semibold text-foreground text-sm">
              <Banknote className="size-4 text-emerald-600" />
              <span>Payment Information</span>
            </div>

            <div className="text-xs space-y-1">
              <p className="font-semibold text-foreground">
                Cash on Delivery (COD)
              </p>
              <p className="text-muted-foreground">
                Please prepare the exact cash amount of{" "}
                <strong className="text-foreground">
                  ৳{Number(order?.grandTotal || "0").toFixed(2)}
                </strong>{" "}
                when the delivery agent arrives.
              </p>
            </div>

            <div className="pt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <ShieldCheck className="size-3.5 text-emerald-600" />
              <span>Verified delivery with inspection upon arrival</span>
            </div>
          </div>
        </div>

        {/* Right: Order Summary receipt */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b">
            <h3 className="font-bold text-foreground text-sm">
              Receipt & Summary
            </h3>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground print:hidden"
            >
              <Printer className="size-3.5" /> Print
            </button>
          </div>

          {/* Items */}
          <div className="space-y-3">
            {order?.items?.map((item) => (
              <div key={item.id} className="flex items-start justify-between text-xs">
                <div>
                  <p className="font-medium text-foreground">{item.productName}</p>
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
                <span className="font-semibold text-foreground">
                  ৳{Number(item.lineTotal).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <Separator className="my-2" />

          {/* Financial Breakdown */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="font-medium text-foreground">
                ৳{Number(order?.subtotal || "0").toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span>
              <span className="font-medium text-foreground">
                {Number(order?.shippingCharge || "0") === 0
                  ? "FREE"
                  : `৳${Number(order?.shippingCharge || "0").toFixed(2)}`}
              </span>
            </div>

            {Number(order?.discountAmount || "0") > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                <span>Discount</span>
                <span>-৳{Number(order?.discountAmount).toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-muted-foreground">
              <span>Tax</span>
              <span>৳0.00</span>
            </div>

            <Separator className="my-2" />

            <div className="flex justify-between text-sm font-bold text-foreground pt-1">
              <span>Grand Total</span>
              <span className="text-base text-primary">
                ৳{Number(order?.grandTotal || "0").toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Actions Footer ──────────────────────────────────────────────── */}
      <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 print:hidden">
        <Link
          href={`/account/orders`}
          className={cn(buttonVariants({ size: "lg" }), "gap-2 font-bold px-8 shadow-xs w-full sm:w-auto")}
        >
          View My Orders
          <ArrowRight className="size-4" />
        </Link>

        <Link
          href="/products"
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "font-semibold w-full sm:w-auto"
          )}
        >
          Continue Shopping
        </Link>
      </div>
    </StoreContainer>
  );
}

