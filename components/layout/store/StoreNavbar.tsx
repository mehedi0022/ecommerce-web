"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  LayoutGrid,
  ShoppingBag,
  ShoppingCart,
  User,
} from "lucide-react";
import { useGetCartQuery } from "@/modules/cart/cartApi";
import { cn } from "@/lib/utils";

export function StoreNavbar() {
  const pathname = usePathname();
  const { data: cartData } = useGetCartQuery();

  const cartCount = cartData?.data?.summary?.itemCount ?? 0;

  // Hide generic mobile bottom navbar on single product details page so sticky order bar can take full focus
  const isProductDetailPage =
    pathname.startsWith("/products/") && pathname !== "/products";

  if (isProductDetailPage) {
    return null;
  }

  const navItems = [
    {
      id: "home",
      label: "Home",
      href: "/",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      id: "categories",
      label: "Categories",
      href: "/categories",
      icon: LayoutGrid,
      isActive:
        pathname.startsWith("/categories") || pathname.startsWith("/category"),
    },
    {
      id: "shop",
      label: "Shop",
      href: "/products",
      icon: ShoppingBag,
      isActive:
        pathname === "/products" ||
        pathname.startsWith("/products") ||
        pathname.startsWith("/product/"),
      isCenter: true,
    },
    {
      id: "cart",
      label: "Cart",
      href: "/cart",
      icon: ShoppingCart,
      isActive: pathname.startsWith("/cart"),
      badge: cartCount,
      badgeColor: "bg-primary text-primary-foreground",
    },
    {
      id: "account",
      label: "Account",
      href: "/account",
      icon: User,
      isActive: pathname.startsWith("/account"),
    },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-background/85 backdrop-blur-xl border-t border-border/50 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.35)] pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 px-3 transition-all duration-300"
    >
      <div className="grid grid-cols-5 items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.isActive;
          const hasBadge = Boolean(item.badge && item.badge > 0);

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "group relative flex flex-col items-center justify-center py-1 transition-all duration-200 select-none active:scale-90",
                item.isCenter ? "col-span-1" : ""
              )}
            >
              {/* Active Tab Background Glow Effect */}
              {isActive && !item.isCenter && (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-2 -top-1 bottom-0.5 rounded-2xl bg-primary/[0.08] dark:bg-primary/[0.15] -z-10 animate-in fade-in zoom-in-95 duration-200"
                />
              )}

              {/* Icon Container with Badge */}
              <div
                className={cn(
                  "relative flex items-center justify-center transition-all duration-300",
                  item.isCenter
                    ? cn(
                        "size-11 rounded-full transition-all duration-300 ring-4 ring-background shadow-md",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-primary/35 -translate-y-2 scale-105"
                          : "bg-primary/10 text-primary hover:bg-primary/20 -translate-y-1.5"
                      )
                    : cn(
                        "size-7 transition-all duration-300",
                        isActive
                          ? "-translate-y-0.5 text-primary scale-110"
                          : "text-muted-foreground group-hover:text-foreground"
                      )
                )}
              >
                <Icon
                  className={cn(
                    "transition-transform duration-300",
                    item.isCenter ? "size-5" : "size-[21px]",
                    isActive && !item.isCenter && "stroke-[2.4px]"
                  )}
                />

                {/* Notification Badge (Cart) */}
                {hasBadge && (
                  <span
                    className={cn(
                      "absolute -top-1 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full text-[10px] font-extrabold px-1 shadow-xs ring-2 ring-background animate-in zoom-in-75 duration-200",
                      item.badgeColor
                    )}
                  >
                    {item.badge! > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={cn(
                  "text-[10px] tracking-tight transition-all duration-200 mt-0.5",
                  isActive
                    ? "font-bold text-primary"
                    : "font-medium text-muted-foreground group-hover:text-foreground",
                  item.isCenter && "-mt-0.5 font-semibold"
                )}
              >
                {item.label}
              </span>

              {/* Active Dot Pill Indicator */}
              {isActive && !item.isCenter && (
                <span
                  aria-hidden="true"
                  className="size-1 rounded-full bg-primary mt-0.5 shadow-[0_0_6px_rgba(var(--primary),0.8)] animate-in fade-in zoom-in-50 duration-200"
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export { StoreNavbar as StoreMobileNavbar };
