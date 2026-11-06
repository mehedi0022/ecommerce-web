"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Package,
  Heart,
  MapPin,
  RotateCcw,
  UserRound,
  LogOut,
  Star,
  ChevronRight,
} from "lucide-react";
import { StoreContainer } from "@/components/layout/store/StoreContainer";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/redux/hooks";
import { useLogoutMutation } from "@/modules/auth/authApi";

export const ACCOUNT_MENU_ITEMS = [
  { href: "/account", label: "Overview", icon: UserRound },
  { href: "/account/orders", label: "My Orders", icon: Package },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/reviews", label: "My Reviews", icon: Star },
  { href: "/account/returns", label: "Returns", icon: RotateCcw },
];

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface AccountLayoutShellProps {
  title?: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  children: React.ReactNode;
  /** When true (e.g. wishlist for guest users), hide sidebar and use full width */
  hideSidebar?: boolean;
}

export function AccountLayoutShell({
  title,
  description,
  breadcrumbs,
  actions,
  children,
  hideSidebar = false,
}: AccountLayoutShellProps) {
  const pathname = usePathname();
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

  const isItemActive = (href: string) => {
    if (href === "/account") {
      return pathname === "/account";
    }
    if (href === "/account/wishlist") {
      return pathname === "/account/wishlist" || pathname === "/wishlist";
    }
    return pathname.startsWith(href);
  };

  const displayName = user?.fullName || user?.userName || "Customer";
  const initials = (displayName[0] ?? "U").toUpperCase();
  const displayContact = user?.email || user?.phone || "";

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-muted/30 py-6 sm:py-10">
      <StoreContainer>
        {/* ── Breadcrumb Navigation ── */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav
            aria-label="Breadcrumb"
            className="mb-4 sm:mb-6 flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap"
          >
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <React.Fragment key={idx}>
                  {idx > 0 && <span className="text-muted-foreground/50">/</span>}
                  {crumb.href && !isLast ? (
                    <Link
                      href={crumb.href}
                      className="hover:text-foreground transition-colors font-medium"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="font-semibold text-foreground">
                      {crumb.label}
                    </span>
                  )}
                </React.Fragment>
              );
            })}
          </nav>
        )}

        {/* ── Page Header & Actions ── */}
        {(title || actions) && (
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {title && (
              <div className="flex items-start justify-between gap-3 w-full sm:w-auto">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                    {title}
                  </h1>
                  {description && (
                    <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {description}
                    </p>
                  )}
                </div>
                {!hideSidebar && (
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="lg:hidden shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-destructive bg-destructive/10 hover:bg-destructive/20 border border-destructive/20 transition-all shadow-2xs disabled:opacity-50 mt-1 cursor-pointer"
                  >
                    <LogOut className="size-3.5" />
                    <span>{isLoggingOut ? "Signing out..." : "Sign out"}</span>
                  </button>
                )}
              </div>
            )}
            {actions && (
              <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
                {actions}
              </div>
            )}
          </div>
        )}

        {/* ── Mobile Horizontal Pill Navigation (Only for logged-in user in account context) ── */}
        {!hideSidebar && (
          <div className="lg:hidden mb-6 -mx-4 px-4 overflow-x-auto scrollbar-none flex items-center gap-2 pb-1">
            {ACCOUNT_MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all border shadow-2xs select-none",
                    active
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-background/80 text-muted-foreground border-border/70 hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="size-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 select-none disabled:opacity-50 cursor-pointer"
            >
              <LogOut className="size-3.5" />
              <span>{isLoggingOut ? "Signing out..." : "Sign out"}</span>
            </button>
          </div>
        )}

        {/* ── Main Layout Body ── */}
        {hideSidebar ? (
          <div>{children}</div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[240px_1fr] items-start">
            {/* Desktop Account Sidebar */}
            <aside className="hidden lg:block lg:sticky lg:top-24">
              <Card className="overflow-hidden border border-border/80 shadow-xs rounded-2xl bg-card">
                {/* User Profile Header */}
                <div className="border-b border-border/60 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 sm:p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-base shadow-md shadow-primary/20 shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm text-foreground truncate">
                        {displayName}
                      </p>
                      {displayContact && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {displayContact}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Nav Links */}
                <nav className="p-2 space-y-1" aria-label="Account Navigation">
                  {ACCOUNT_MENU_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const active = isItemActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition-all group",
                          active
                            ? "bg-primary text-primary-foreground shadow-xs font-bold"
                            : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Icon
                            className={cn(
                              "size-4 shrink-0 transition-transform group-hover:scale-110",
                              active
                                ? "text-primary-foreground"
                                : "text-muted-foreground group-hover:text-foreground"
                            )}
                          />
                          <span>{item.label}</span>
                        </div>
                        {active && <ChevronRight className="size-3.5 opacity-80" />}
                      </Link>
                    );
                  })}

                  <div className="pt-2 mt-1 border-t border-border/50">
                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                    >
                      <LogOut className="size-4 shrink-0" />
                      <span>{isLoggingOut ? "Signing out..." : "Sign out"}</span>
                    </button>
                  </div>
                </nav>
              </Card>
            </aside>

            {/* Content Area */}
            <section className="min-w-0">
              {children}

              {/* Mobile Profile & Logout Card at Bottom */}
              <div className="mt-8 pt-6 border-t border-border/60 lg:hidden">
                <div className="flex items-center justify-between p-4 rounded-2xl border border-destructive/20 bg-destructive/5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-destructive/15 text-destructive font-black text-sm shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-foreground truncate">
                        {displayName}
                      </p>
                      {displayContact && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {displayContact}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90 transition shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    <LogOut className="size-3.5" />
                    <span>{isLoggingOut ? "..." : "Sign out"}</span>
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}
      </StoreContainer>
    </main>
  );
}
