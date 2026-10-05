import Link from "next/link";
import { ShoppingBag, ArrowRight, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CartEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/50 py-16 px-6 text-center shadow-xs">
      {/* Icon */}
      <div className="relative mb-5 flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary">
        <ShoppingBag className="size-10" />
        <span className="absolute -top-1 -right-1 flex size-6 items-center justify-center rounded-full bg-background border shadow-xs">
          <Sparkles className="size-3.5 text-amber-500" />
        </span>
      </div>

      <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Your Cart is Empty
      </h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground sm:text-base">
        Looks like you haven&apos;t added any items to your cart yet. Explore
        our wide range of products and find something you love.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
        <Link
          href="/products"
          className={cn(
            buttonVariants({ size: "lg" }),
            "gap-2 font-bold px-8 shadow-xs"
          )}
        >
          Explore Products
          <ArrowRight className="size-4" />
        </Link>
        <Link
          href="/categories"
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "font-semibold"
          )}
        >
          Browse Categories
        </Link>
      </div>
    </div>
  );
}

