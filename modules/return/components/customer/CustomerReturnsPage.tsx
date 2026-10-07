"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  Heart,
  MapPin,
  RotateCcw,
  UserRound,
  LogOut,
  Star,
} from "lucide-react";
import { StoreContainer } from "@/components/layout/store/StoreContainer";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/redux/hooks";
import { useLogoutMutation } from "@/modules/auth/authApi";
import { CustomerReturnsList } from "./CustomerReturnsList";

const menuItems = [
  { href: "/account", label: "Overview", icon: UserRound },
  { href: "/account/orders", label: "My orders", icon: Package },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/reviews", label: "My reviews", icon: Star },
  { href: "/account/returns", label: "Returns", icon: RotateCcw },
];

export function CustomerReturnsPage() {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

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
        {/* ── Breadcrumbs ─────────────────────────────────────────────────── */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex items-center gap-2 text-xs text-muted-foreground"
        >
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span>/</span>
          <Link href="/account" className="hover:text-foreground">
            Account
          </Link>
          <span>/</span>
          <span className="font-medium text-foreground">Returns & Exchanges</span>
        </nav>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              My Returns & Exchanges
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Track status and progress of your return requests and refund payouts.
            </p>
          </div>

          <Link
            href="/account/orders"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "gap-1.5 text-xs font-semibold self-start sm:self-auto"
            )}
          >
            <Package className="size-3.5" />
            View Past Orders
          </Link>
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
                  const isActive = item.href === "/account/returns";
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
            <CustomerReturnsList hideHeader={true} />
          </section>
        </div>
      </StoreContainer>
    </main>
  );
}
