"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Package,
  ArrowLeft,
  Calendar,
  CreditCard,
  Truck,
  Printer,
  RotateCcw,
  ExternalLink,
  MapPin,
  Tag,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  UserRound,
  Heart,
  Star,
  LogOut,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";
import { StoreContainer } from "@/components/layout/store/StoreContainer";
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { mediaUrl } from "@/modules/catalog/catalog.utils";
import { useAppSelector } from "@/redux/hooks";
import { useLogoutMutation } from "@/modules/auth/authApi";
import { useGetOrderByNumberQuery } from "../../orderApi";
import { OrderTimeline } from "./OrderTimeline";
import { OrderInvoiceModal } from "../invoice/OrderInvoiceModal";
import { CustomerReturnRequestModal } from "@/modules/return/components/customer/CustomerReturnRequestModal";
import { ReviewModal } from "@/modules/review/components/ReviewModal";
import type { OrderItem } from "../../order.types";

const menuItems = [
  { href: "/account", label: "Overview", icon: UserRound },
  { href: "/account/orders", label: "My orders", icon: Package },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/reviews", label: "My reviews", icon: Star },
  { href: "/account/returns", label: "Returns", icon: RotateCcw },
];

const statusConfig: Record<
  string,
  { label: string; icon: typeof Clock; className: string }
> = {
  PENDING: {
    label: "Pending Review",
    icon: Clock,
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  CONFIRMED: {
    label: "Confirmed",
    icon: CheckCircle2,
    className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  PROCESSING: {
    label: "Processing",
    icon: Package,
    className: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  },
  SHIPPED: {
    label: "Shipped",
    icon: Truck,
    className: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  },
  DELIVERED: {
    label: "Delivered",
    icon: CheckCircle2,
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: XCircle,
    className: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  },
};

const CONSUMING_STATUSES = ["REQUESTED", "APPROVED", "IN_TRANSIT", "RECEIVED", "COMPLETED"];

interface CustomerOrderDetailsPageProps {
  orderNumber: string;
}

export function CustomerOrderDetailsPage({ orderNumber }: CustomerOrderDetailsPageProps) {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  const { data, isLoading, isFetching, isError, refetch } =
    useGetOrderByNumberQuery(orderNumber);

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [reviewingItem, setReviewingItem] = useState<OrderItem | null>(null);

  const order = data?.data;

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } finally {
      router.replace("/login");
    }
  };

  const statusInfo = order ? (statusConfig[order.status] ?? {
    label: order.status,
    icon: AlertCircle,
    className: "bg-muted text-muted-foreground border-border",
  }) : null;
  const StatusIcon = statusInfo?.icon;

  const shippingAddr = order
    ? order.addresses?.find((a) => a.type === "SHIPPING") ?? order.addresses?.[0]
    : null;

  const formattedPlacedDate = order?.placedAt
    ? format(new Date(order.placedAt), "dd MMMM yyyy, hh:mm a")
    : order?.createdAt
    ? format(new Date(order.createdAt), "dd MMMM yyyy")
    : "";

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-muted/30 py-8 sm:py-12">
      <StoreContainer>
        {/* ── Breadcrumbs ─────────────────────────────────────────────────── */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex items-center gap-2 text-xs text-muted-foreground flex-wrap"
        >
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span>/</span>
          <Link href="/account" className="hover:text-foreground">
            Account
          </Link>
          <span>/</span>
          <Link href="/account/orders" className="hover:text-foreground">
            Orders
          </Link>
          <span>/</span>
          <span className="font-medium font-mono text-foreground">
            #{orderNumber}
          </span>
        </nav>

        {/* ── Top Header with Back Button ──────────────────────────────────── */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/account/orders"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "gap-1.5 text-xs font-semibold h-9"
              )}
            >
              <ArrowLeft className="size-4" />
              Back to Orders
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground font-mono">
                Order #{orderNumber}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "gap-1.5 text-xs font-semibold h-9"
              )}
            >
              <RefreshCw className={cn("size-3.5", isFetching && "animate-spin")} />
              Refresh
            </button>
            {order && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowInvoiceModal(true)}
                  className="gap-1.5 text-xs font-semibold h-9"
                >
                  <Printer className="size-3.5" />
                  Tax Invoice
                </Button>
                {order.status === "DELIVERED" && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setShowReturnModal(true)}
                    className="gap-1.5 text-xs font-semibold h-9 bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    <RotateCcw className="size-3.5" />
                    Return / Exchange
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── Layout Grid ─────────────────────────────────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          {/* Account Sidebar Navigation */}
          <aside className="hidden lg:block">
            <Card className="overflow-hidden">
              <div className="border-b bg-primary p-4 text-primary-foreground">
                <p className="font-semibold text-sm truncate">
                  {user?.fullName || user?.userName}
                </p>
                <p className="mt-0.5 truncate text-xs text-primary-foreground/70">
                  {user?.email}
                </p>
              </div>
              <nav className="p-2 space-y-0.5" aria-label="Account navigation">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.href === "/account/orders";
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Icon className="size-4" />
                      {item.label}
                    </Link>
                  );
                })}
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-destructive transition hover:bg-destructive/10"
                >
                  <LogOut className="size-4" />
                  {isLoggingOut ? "Signing out..." : "Sign out"}
                </button>
              </nav>
            </Card>
          </aside>

          {/* Main Content */}
          <section className="space-y-6">
            {isLoading ? (
              <div className="space-y-4">
                <div className="rounded-2xl border bg-card p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </div>
                  <Skeleton className="h-24 w-full" />
                </div>
                <div className="rounded-2xl border bg-card p-6 space-y-4">
                  <Skeleton className="h-32 w-full" />
                </div>
              </div>
            ) : isError || !order ? (
              <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
                <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                  <AlertCircle className="size-7" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-foreground">
                  Order Not Found
                </h3>
                <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
                  We could not find the details for order #{orderNumber}. It may belong to another account or does not exist.
                </p>
                <Link
                  href="/account/orders"
                  className={cn(buttonVariants({ size: "default" }), "mt-5 gap-2")}
                >
                  <ArrowLeft className="size-4" />
                  Back to Orders
                </Link>
              </div>
            ) : (
              <>
                {/* ── Status Banner Card ────────────────────────────────────── */}
                <Card className="overflow-hidden">
                  <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b bg-card">
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-mono text-base font-bold text-foreground tracking-tight">
                          #{order.orderNumber}
                        </span>
                        {statusInfo && StatusIcon && (
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border",
                              statusInfo.className
                            )}
                          >
                            <StatusIcon className="size-3" />
                            {statusInfo.label}
                          </span>
                        )}
                        {order.paymentStatus === "PAID" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-xs font-semibold">
                            Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-muted text-muted-foreground border px-2 py-0.5 text-xs font-semibold">
                            Unpaid (COD)
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5">
                        <Calendar className="size-3.5" /> Placed on {formattedPlacedDate}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/track-order?orderNumber=${order.orderNumber}`}
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" }),
                          "h-8 text-xs font-semibold gap-1.5 border-primary/20 text-primary hover:bg-primary/5"
                        )}
                      >
                        <Truck className="size-3.5" />
                        Live Tracking
                      </Link>
                    </div>
                  </div>

                  {/* ── Order Status & Courier Timeline ──────────────────────── */}
                  <div className="p-5 sm:p-6 bg-card space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Truck className="size-4 text-primary" /> Delivery & Courier Timeline
                    </h3>
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
                </Card>

                {/* ── Ordered Items Card ────────────────────────────────────── */}
                <Card>
                  <div className="p-5 sm:p-6 border-b">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <Package className="size-4 text-primary" />
                        Items Ordered ({order.items?.length || 0})
                      </h3>
                      {order.status === "DELIVERED" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowReturnModal(true)}
                          className="h-7 text-xs font-medium text-amber-700 dark:text-amber-400 gap-1 hover:bg-amber-500/10"
                        >
                          <RotateCcw className="size-3" />
                          Return Items
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="divide-y">
                    {order.items?.map((item) => {
                      const itemImg =
                        item.product?.images?.find((img) => img.isPrimary)?.imageUrl ||
                        item.product?.images?.[0]?.imageUrl;

                      const itemReturns = (item.returnItems || []).filter(
                        (ri) => ri.return && CONSUMING_STATUSES.includes(ri.return.status)
                      );
                      const requestedQty = itemReturns.reduce(
                        (sum, ri) => sum + ri.quantity,
                        0
                      );

                      return (
                        <div
                          key={item.id}
                          className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                        >
                          <div className="flex items-start gap-3.5 min-w-0">
                            <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-muted border overflow-hidden relative">
                              {itemImg ? (
                                <img
                                  src={mediaUrl(itemImg)}
                                  alt={item.productName}
                                  className="size-full object-cover"
                                />
                              ) : (
                                <Package className="size-6 text-muted-foreground" />
                              )}
                            </div>
                            <div className="min-w-0 space-y-1">
                              <p className="font-bold text-sm text-foreground">
                                {item.productName}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>Qty: {item.quantity}</span>
                                <span>&bull;</span>
                                <span>৳{Number(item.unitPrice).toFixed(2)} each</span>
                              </div>
                              {item.attributes && item.attributes.length > 0 && (
                                <p className="text-[11px] text-muted-foreground">
                                  {item.attributes
                                    .map((a) => `${a.attributeName}: ${a.attributeValue}`)
                                    .join(", ")}
                                </p>
                              )}

                              {/* Return Status Badge if any */}
                              {requestedQty > 0 && (
                                <div className="pt-1 flex items-center gap-2 flex-wrap">
                                  <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                                    <RotateCcw className="size-2.5" />
                                    Return Requested: {requestedQty} of {item.quantity} units
                                  </span>
                                  {itemReturns[0]?.return?.returnNumber && (
                                    <Link
                                      href="/account/returns"
                                      className="text-[10px] text-primary hover:underline font-mono"
                                    >
                                      ({itemReturns[0].return.returnNumber})
                                    </Link>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-0 pt-2 sm:pt-0">
                            <span className="text-sm font-black text-foreground">
                              ৳{Number(item.lineTotal).toFixed(2)}
                            </span>
                            {order.status === "DELIVERED" && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setReviewingItem(item)}
                                className="h-7 text-xs px-2.5 font-medium border-primary/30 text-primary hover:bg-primary/10"
                              >
                                <Star className="size-3 mr-1" />
                                Write Review
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>

                {/* ── Shipping Address & Payment Summary ───────────────────── */}
                <div className="grid gap-6 sm:grid-cols-2">
                  <Card className="p-5 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                      <MapPin className="size-4 text-primary" />
                      <span>Delivery Address</span>
                    </div>
                    {shippingAddr ? (
                      <div className="text-xs space-y-1.5 text-muted-foreground">
                        <p className="font-bold text-foreground text-sm">
                          {shippingAddr.fullName}
                        </p>
                        <p className="font-medium text-foreground">{shippingAddr.phone}</p>
                        <p className="text-foreground">{shippingAddr.addressLine1}</p>
                        {shippingAddr.addressLine2 && <p>{shippingAddr.addressLine2}</p>}
                        <p>
                          {shippingAddr.upazila ? `${shippingAddr.upazila}, ` : ""}
                          {shippingAddr.district}, Bangladesh
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Standard delivery address
                      </p>
                    )}
                  </Card>

                  <Card className="p-5 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                      <Truck className="size-4 text-primary" />
                      <span>Shipping & Payment Info</span>
                    </div>
                    <div className="text-xs space-y-2 text-muted-foreground">
                      <div>
                        <span className="font-medium text-foreground">Shipping Method:</span>{" "}
                        {order.shippingMethodName || "Standard Delivery"}
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Shipping Zone:</span>{" "}
                        {order.shippingZoneName || "Bangladesh"}
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Payment Method:</span>{" "}
                        {order.paymentMethod === "CASH_ON_DELIVERY"
                          ? "Cash on Delivery"
                          : order.paymentMethod === "PARTIAL_COD"
                          ? "Partial Cash on Delivery"
                          : order.paymentMethod === "ONLINE"
                          ? "Online Payment"
                          : order.paymentMethod}{" "}
                        (
                        <span className="font-semibold text-foreground">
                          {order.paymentStatus}
                        </span>
                        )
                      </div>
                      {order.customerNote && (
                        <div className="pt-1 text-[11px] italic bg-muted/30 p-2 rounded-lg border">
                          <strong>Note:</strong> &ldquo;{order.customerNote}&rdquo;
                        </div>
                      )}
                    </div>
                  </Card>
                </div>

                {/* ── Financial Summary Card ──────────────────────────────── */}
                <Card className="p-5 sm:p-6 bg-card space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Order Payment Summary
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span className="font-medium text-foreground">
                        ৳{Number(order.subtotal).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Delivery Charge</span>
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
                    {Number(order.advanceAmount || 0) > 0 && (
                      <div className="flex justify-between text-blue-600 dark:text-blue-400 font-medium">
                        <span>Advance Paid</span>
                        <span>-৳{Number(order.advanceAmount).toFixed(2)}</span>
                      </div>
                    )}
                    {Number(order.dueAmount || 0) > 0 && (
                      <div className="flex justify-between text-amber-600 dark:text-amber-400 font-medium">
                        <span>Due on Delivery</span>
                        <span>৳{Number(order.dueAmount).toFixed(2)}</span>
                      </div>
                    )}
                    <Separator className="my-2" />
                    <div className="flex justify-between text-base font-bold text-foreground">
                      <span>Grand Total</span>
                      <span className="text-lg text-primary font-black">
                        ৳{Number(order.grandTotal).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </Card>
              </>
            )}
          </section>
        </div>
      </StoreContainer>

      {/* Invoice Modal */}
      {order && (
        <OrderInvoiceModal
          order={order}
          open={showInvoiceModal}
          onOpenChange={setShowInvoiceModal}
        />
      )}

      {/* Return Request Modal */}
      {order && showReturnModal && (
        <CustomerReturnRequestModal
          open={showReturnModal}
          onOpenChange={setShowReturnModal}
          orderNumber={order.orderNumber}
          orderItems={order.items || []}
          onSuccess={() => {
            setShowReturnModal(false);
            refetch();
          }}
        />
      )}

      {/* Product Review Modal */}
      {reviewingItem && (
        <ReviewModal
          open={Boolean(reviewingItem)}
          onOpenChange={(open) => !open && setReviewingItem(null)}
          orderItemId={reviewingItem.id}
          productName={reviewingItem.productName}
          onSuccess={() => setReviewingItem(null)}
        />
      )}
    </main>
  );
}
