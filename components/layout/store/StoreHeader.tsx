import Link from "next/link";
import { Heart, Search, ShoppingCart, User } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StoreContainer } from "./StoreContainer";

export function StoreHeader() {
  return (
    <header className="border-b bg-background">
      <StoreContainer>
        <div className="flex h-16 items-center justify-between gap-6">
          <Link href="/" className="shrink-0 text-xl font-bold tracking-tight">
            Store
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/products"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Products
            </Link>

            <Link
              href="/categories"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Categories
            </Link>
          </nav>

          <div className="flex items-center gap-1">
            <div className="flex items-center gap-1">
              <Link
                href="/search"
                aria-label="Search"
                className={cn(
                  buttonVariants({
                    variant: "ghost",
                    size: "icon",
                  }),
                )}
              >
                <Search className="size-5" />
              </Link>

              <Link
                href="/wishlist"
                aria-label="Wishlist"
                className={cn(
                  buttonVariants({
                    variant: "ghost",
                    size: "icon",
                  }),
                )}
              >
                <Heart className="size-5" />
              </Link>

              <Link
                href="/account"
                aria-label="Account"
                className={cn(
                  buttonVariants({
                    variant: "ghost",
                    size: "icon",
                  }),
                )}
              >
                <User className="size-5" />
              </Link>

              <Link
                href="/cart"
                aria-label="Cart"
                className={cn(
                  buttonVariants({
                    variant: "ghost",
                    size: "icon",
                  }),
                )}
              >
                <ShoppingCart className="size-5" />
              </Link>
            </div>
          </div>
        </div>
      </StoreContainer>
    </header>
  );
}
