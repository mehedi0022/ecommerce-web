"use client";

import Link from "next/link";
import { Heart, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Product } from "../../types";

const visualStyles = [
  "from-amber-100 via-orange-50 to-stone-100",
  "from-slate-200 via-blue-50 to-indigo-100",
  "from-rose-100 via-pink-50 to-orange-50",
  "from-emerald-100 via-teal-50 to-stone-100",
];

export function ProductCard({ product }: { product: Product }) {
  const variant = product.variants?.find((item) => item.isActive) ?? product.variants?.[0];
  const image = product.images?.find((item) => item.isPrimary) ?? product.images?.[0];
  const visualClass = visualStyles[Math.abs(product.id) % visualStyles.length];

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <Card className="h-full overflow-hidden border-transparent bg-muted/30 transition duration-300 hover:-translate-y-1 hover:border-border hover:bg-background hover:shadow-lg">
        <div className={`relative flex aspect-[4/4.5] items-center justify-center overflow-hidden bg-gradient-to-br ${visualClass}`}>
          {image ? (
            // Product image URLs come from the backend catalog.
            <img src={image.imageUrl} alt={image.altText ?? product.name} className="size-full object-cover transition duration-500 group-hover:scale-105" />
          ) : (
            <div className="text-center transition duration-500 group-hover:scale-105">
              <div className="mx-auto mb-3 size-20 rounded-full bg-white/60 shadow-sm" />
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-foreground/50">{product.name.split(" ")[0]}</span>
            </div>
          )}
          <button type="button" aria-label={`Add ${product.name} to wishlist`} onClick={(event) => event.preventDefault()} className="absolute right-3 top-3 rounded-full bg-white/80 p-2 text-foreground shadow-sm backdrop-blur transition hover:bg-white">
            <Heart className="size-4" />
          </button>
        </div>
        <CardContent className="p-4">
          <div className="mb-2 flex items-center gap-1 text-xs text-amber-500">
            <Star className="size-3.5 fill-current" /> <span className="text-muted-foreground">4.8</span>
          </div>
          <h2 className="font-semibold tracking-tight">{product.name}</h2>
          <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{product.shortDescription || "Explore this product"}</p>
          {variant ? <p className="mt-3 font-semibold">${Number(variant.price).toFixed(2)}</p> : null}
        </CardContent>
      </Card>
    </Link>
  );
}
