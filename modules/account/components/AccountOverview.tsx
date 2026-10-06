"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Heart,
  LogOut,
  MapPin,
  Package,
  RotateCcw,
  Settings,
  ShoppingBag,
  UserRound,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StoreContainer } from "@/components/layout/store/StoreContainer";
import { useAppSelector } from "@/redux/hooks";
import { useLogoutMutation } from "@/modules/auth/authApi";
import { useListCustomerOrdersQuery } from "@/modules/order/orderApi";
import { useGetSavedAddressesQuery } from "@/modules/checkout/checkoutApi";
import { OrderCard } from "@/modules/order/components/store/OrderCard";

const menuItems = [
  { href: "/account", label: "Overview", icon: UserRound },
  { href: "/account/orders", label: "My orders", icon: Package },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/returns", label: "Returns", icon: RotateCcw },
];

const quickLinks = [
  {
    href: "/account/orders",
    title: "Track an order",
    description: "Check your latest order status",
    icon: Package,
  },
  {
    href: "/account/addresses",
    title: "Manage addresses",
    description: "Keep your delivery details up to date",
    icon: MapPin,
  },
  {
    href: "/account/wishlist",
    title: "Your wishlist",
    description: "View products you saved for later",
    icon: Heart,
  },
];

export function AccountOverview() {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
  const { data: ordersData, isLoading: isOrdersLoading } =
    useListCustomerOrdersQuery();
  const { data: addressesData } = useGetSavedAddressesQuery();

  const orders = ordersData?.data ?? [];
  const savedAddressCount = addressesData?.data?.length ?? 0;
  const firstName = user?.fullName?.split(" ")[0] || user?.userName || "there";

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } finally {
      router.replace("/login");
    }
  };

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-muted/30 py-8 sm:py-12">
      <StoreContainer>
        <div className="mb-8">
          <p className="text-sm font-medium text-primary">My account</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
            Welcome back, {firstName}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage your orders, saved items and account details.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[230px_1fr]">
          <aside>
            <Card className="overflow-hidden">
              <div className="border-b bg-primary p-5 text-primary-foreground">
                <div className="flex size-12 items-center justify-center rounded-full bg-primary-foreground/15 text-lg font-bold">
                  {(firstName[0] ?? "U").toUpperCase()}
                </div>
                <p className="mt-3 font-semibold">
                  {user?.fullName || user?.userName}
                </p>
                <p className="mt-1 truncate text-xs text-primary-foreground/70">
                  {user?.email}
                </p>
              </div>
              <nav className="p-2" aria-label="Account navigation">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition hover:bg-muted ${item.href === "/account" ? "bg-muted" : "text-muted-foreground"}`}
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
                  className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-destructive transition hover:bg-destructive/10"
                >
                  <LogOut className="size-4" />
                  {isLoggingOut ? "Signing out..." : "Sign out"}
                </button>
              </nav>
            </Card>
          </aside>

          <section className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <Card>
                <CardContent className="p-5">
                  <ShoppingBag className="size-5 text-primary" />
                  <p className="mt-4 text-2xl font-bold">{orders.length}</p>
                  <p className="text-sm text-muted-foreground">Total orders</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <Heart className="size-5 text-primary" />
                  <p className="mt-4 text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Saved items</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <MapPin className="size-5 text-primary" />
                  <p className="mt-4 text-2xl font-bold">{savedAddressCount}</p>
                  <p className="text-sm text-muted-foreground">
                    Saved addresses
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between border-b">
                <div>
                  <CardTitle>Quick actions</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Everything you need, in one place.
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Account settings"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon" }),
                  )}
                >
                  <Settings className="size-4" />
                </button>
              </CardHeader>
              <CardContent className="grid gap-3 p-4 sm:grid-cols-3">
                {quickLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="group rounded-xl border p-4 transition hover:border-primary/40 hover:bg-muted/50"
                    >
                      <div className="flex items-center justify-between">
                        <Icon className="size-5 text-primary" />
                        <ChevronRight className="size-4 text-muted-foreground transition group-hover:translate-x-1" />
                      </div>
                      <p className="mt-5 font-semibold">{item.title}</p>
                      <p className="mt-1 text-sm leading-5 text-muted-foreground">
                        {item.description}
                      </p>
                    </Link>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between border-b">
                <CardTitle>Recent orders</CardTitle>
                {orders.length > 0 && (
                  <Link
                    href="/account/orders"
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    View all ({orders.length})
                  </Link>
                )}
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {orders.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-8 text-center">
                    <Package className="mx-auto size-8 text-muted-foreground/50" />
                    <p className="mt-3 font-medium">No orders yet</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Your recent orders will appear here after checkout.
                    </p>
                    <Link
                      href="/products"
                      className={cn(buttonVariants(), "mt-4")}
                    >
                      Start shopping
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.slice(0, 3).map((order) => (
                      <OrderCard key={order.id} order={order} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      </StoreContainer>
    </main>
  );
}
