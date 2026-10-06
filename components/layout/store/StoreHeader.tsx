"use client";

import Link from "next/link";
import {
  Heart,
  Search,
  ShoppingCart,
  User,
  ArrowRight,
  MapPin,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StoreContainer } from "./StoreContainer";
import { useGetCartQuery } from "@/modules/cart/cartApi";
import { useWishlist } from "@/modules/wishlist/useWishlist";

const navItems = [
  { href: "/products", label: "Shop" },
  { href: "/categories", label: "Categories" },
  { href: "/products?sort=featured", label: "Featured" },
  { href: "/products?sort=newest", label: "New arrivals" },
];

export function StoreHeader() {
  const { data: cartData } = useGetCartQuery();
  const { count: wishlistCount } = useWishlist();
  const cartCount = cartData?.data?.summary?.itemCount ?? 0;
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="bg-primary text-primary-foreground">
        <StoreContainer>
          <div className="flex min-h-9 items-center justify-between gap-4 text-xs sm:text-sm">
            <p className="flex items-center gap-2">
              <span className="hidden sm:inline">
                Free shipping on orders over
              </span>
              <span className="sm:hidden">Free shipping over</span>
              <strong>$50</strong>
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-1 font-medium hover:underline"
            >
              Shop now <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </StoreContainer>
      </div>

      <StoreContainer>
        <div className="grid grid-cols-3 min-h-20 items-center gap-4 py-4 lg:gap-8">
          <Link
            href="/"
            className="shrink-0 text-2xl font-black tracking-tight"
            aria-label="Store home"
          >
            Store<span className="text-primary">.</span>
          </Link>

          <form
            action="/search"
            className="order-3 flex w-full basis-full lg:order-none lg:mx-auto lg:max-w-xl lg:flex-1"
          >
            <label htmlFor="store-search" className="sr-only">
              Search products
            </label>
            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="store-search"
                name="q"
                type="search"
                placeholder="Search products..."
                className="h-10 w-full rounded-full border bg-muted/40 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </form>

          <div className="ml-auto flex shrink-0 items-center gap-1">
            <Link
              href="/account"
              aria-label="Account"
              className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
            >
              <User className="size-5" />
            </Link>
            <Link
              href="/wishlist"
              aria-label={
                wishlistCount > 0
                  ? `Wishlist with ${wishlistCount} items`
                  : "Wishlist"
              }
              className={cn("relative", buttonVariants({ variant: "ghost", size: "icon" }))}
            >
              <Heart className="size-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-xs">
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </span>
              )}
            </Link>
            <Link
              href="/cart"
              aria-label={`Cart with ${cartCount} items`}
              className={cn("relative", buttonVariants({ variant: "ghost", size: "icon" }))}
            >
              <ShoppingCart className="size-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground shadow-xs">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        <div className="hidden items-center justify-between border-t py-3 md:flex">
          <nav className="flex items-center gap-7" aria-label="Main navigation">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/track-order"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <MapPin className="size-4" />
            Track order
          </Link>
        </div>
      </StoreContainer>
    </header>
  );
}
