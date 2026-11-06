"use client";

import Link from "next/link";
import {
  ChevronRight,
  Heart,
  MapPin,
  Package,
  ShoppingBag,
  Star,
  Settings,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/redux/hooks";
import { useListCustomerOrdersQuery } from "@/modules/order/orderApi";
import { useGetSavedAddressesQuery } from "@/modules/checkout/checkoutApi";
import { useWishlist } from "@/modules/wishlist/useWishlist";
import { OrderCard } from "@/modules/order/components/store/OrderCard";
import { AccountLayoutShell } from "./AccountLayoutShell";

const quickLinks = [
  {
    href: "/account/orders",
    title: "Track an order",
    description: "Check your latest order status and delivery timeline",
    icon: Package,
  },
  {
    href: "/account/reviews",
    title: "My reviews",
    description: "Ratings and feedback you've shared on products",
    icon: Star,
  },
  {
    href: "/account/wishlist",
    title: "Your wishlist",
    description: "View products you saved to purchase later",
    icon: Heart,
  },
];

export function AccountOverview() {
  const user = useAppSelector((state) => state.auth.user);
  const { data: ordersData, isLoading: isOrdersLoading } =
    useListCustomerOrdersQuery();
  const { data: addressesData } = useGetSavedAddressesQuery();
  const { count: wishlistCount } = useWishlist();

  const orders = ordersData?.data ?? [];
  const savedAddressCount = addressesData?.data?.length ?? 0;
  const firstName = user?.fullName?.split(" ")[0] || user?.userName || "there";

  return (
    <AccountLayoutShell
      title={`Welcome back, ${firstName}`}
      description="Manage your orders, saved items, reviews and delivery addresses."
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Account" }]}
    >
      <div className="space-y-6">
        {/* Metric Cards */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3">
          <Card className="rounded-2xl border-border/80 shadow-xs hover:border-primary/40 transition-colors">
            <CardContent className="p-4 sm:p-5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ShoppingBag className="size-4.5" />
              </div>
              <p className="mt-3 text-2xl sm:text-3xl font-extrabold text-foreground">
                {orders.length}
              </p>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                Total Orders
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/80 shadow-xs hover:border-primary/40 transition-colors">
            <CardContent className="p-4 sm:p-5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
                <Heart className="size-4.5 fill-current" />
              </div>
              <p className="mt-3 text-2xl sm:text-3xl font-extrabold text-foreground">
                {wishlistCount}
              </p>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                Saved Wishlist Items
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/80 shadow-xs hover:border-primary/40 transition-colors col-span-2 sm:col-span-1">
            <CardContent className="p-4 sm:p-5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                <MapPin className="size-4.5" />
              </div>
              <p className="mt-3 text-2xl sm:text-3xl font-extrabold text-foreground">
                {savedAddressCount}
              </p>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                Saved Addresses
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <Card className="rounded-2xl border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 py-4 px-5">
            <div>
              <CardTitle className="text-base sm:text-lg font-bold">
                Quick Shortcuts
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Fast access to essential account features
              </p>
            </div>
            <Link
              href="/account/orders"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-xs font-semibold")}
            >
              All orders
            </Link>
          </CardHeader>
          <CardContent className="grid gap-3 p-4 sm:grid-cols-3">
            {quickLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group rounded-2xl border border-border/70 p-4 transition-all hover:border-primary/50 hover:bg-muted/40 hover:shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-4" />
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </div>
                  <p className="mt-3 font-bold text-sm text-foreground">
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </Link>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="rounded-2xl border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 py-4 px-5">
            <div>
              <CardTitle className="text-base sm:text-lg font-bold">
                Recent Orders
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your latest purchases and their shipping status
              </p>
            </div>
            {orders.length > 0 && (
              <Link
                href="/account/orders"
                className="text-xs font-bold text-primary hover:underline"
              >
                View all ({orders.length})
              </Link>
            )}
          </CardHeader>
          <CardContent className="p-4 sm:p-5">
            {isOrdersLoading ? (
              <div className="space-y-3">
                <div className="h-24 rounded-xl bg-muted/60 animate-pulse" />
                <div className="h-24 rounded-xl bg-muted/60 animate-pulse" />
              </div>
            ) : orders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/80 p-8 text-center bg-muted/20">
                <Package className="mx-auto size-9 text-muted-foreground/50" />
                <p className="mt-3 font-bold text-sm text-foreground">
                  No orders yet
                </p>
                <p className="mt-1 text-xs text-muted-foreground max-w-xs mx-auto">
                  Your past and current orders will appear here after checkout.
                </p>
                <Link
                  href="/products"
                  className={cn(buttonVariants({ size: "sm" }), "mt-4 rounded-xl font-bold shadow-xs")}
                >
                  Start shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-3.5">
                {orders.slice(0, 3).map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AccountLayoutShell>
  );
}
