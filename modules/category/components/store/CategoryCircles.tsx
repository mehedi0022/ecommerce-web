"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Layers,
  ArrowRight,
  Tag,
  Flame,
  Shirt,
  Laptop,
  Watch,
  Headphones,
} from "lucide-react";
import { StoreContainer } from "@/components/layout/store/StoreContainer";
import { Skeleton } from "@/components/ui/skeleton";
import { mediaUrl } from "@/modules/catalog/catalog.utils";
import { useGetPublicCategoryTreeQuery } from "../../categoryApi";
import type { Category } from "../../types";

const fallbackIcons = [
  ShoppingBag,
  Sparkles,
  Layers,
  Tag,
  Flame,
  Shirt,
  Laptop,
  Watch,
  Headphones,
];

const fallbackGradients = [
  "from-blue-500/15 via-indigo-500/10 to-purple-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-200/60 dark:border-indigo-800/60",
  "from-emerald-500/15 via-teal-500/10 to-cyan-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/60",
  "from-amber-500/15 via-orange-500/10 to-rose-500/15 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/60",
  "from-rose-500/15 via-pink-500/10 to-purple-500/15 text-rose-600 dark:text-rose-400 border-rose-200/60 dark:border-rose-800/60",
  "from-violet-500/15 via-purple-500/10 to-fuchsia-500/15 text-violet-600 dark:text-violet-400 border-violet-200/60 dark:border-violet-800/60",
  "from-sky-500/15 via-blue-500/10 to-cyan-500/15 text-sky-600 dark:text-sky-400 border-sky-200/60 dark:border-sky-800/60",
];

function CategoryCircleItem({
  category,
  idx,
}: {
  category: Category;
  idx: number;
}) {
  const [hasError, setHasError] = useState(false);
  const IconComponent = fallbackIcons[idx % fallbackIcons.length];
  const gradientClass = fallbackGradients[idx % fallbackGradients.length];
  const imageUrl = category.image && !hasError ? mediaUrl(category.image) : null;

  return (
    <Link
      href={`/category/${category.slug}`}
      className="group flex flex-col items-center gap-2.5 shrink-0 snap-start focus:outline-none"
    >
      {/* Circular Avatar Container */}
      <div className="relative size-20 sm:size-24 md:size-26 rounded-full p-1 border-2 border-border/80 bg-background shadow-xs group-hover:border-primary group-hover:scale-105 group-hover:shadow-md transition-all duration-300">
        <div className="relative size-full rounded-full overflow-hidden bg-muted flex items-center justify-center">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={category.name}
              fill
              unoptimized
              onError={() => setHasError(true)}
              sizes="(max-width: 640px) 80px, 96px"
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div
              className={`size-full bg-gradient-to-br ${gradientClass} flex items-center justify-center border`}
            >
              <IconComponent className="size-7 sm:size-8 transition-transform group-hover:scale-110 duration-300" />
            </div>
          )}
        </div>
      </div>

      {/* Category Name Label */}
      <span className="text-xs sm:text-sm font-semibold text-center text-foreground group-hover:text-primary transition-colors max-w-[90px] sm:max-w-[110px] line-clamp-1">
        {category.name}
      </span>

      {/* Subcategory Count Badge */}
      {category.children && category.children.length > 0 ? (
        <span className="text-[10px] font-medium text-muted-foreground group-hover:text-primary transition-colors -mt-1.5 line-clamp-1">
          {category.children.length} {category.children.length === 1 ? "subcategory" : "subcategories"}
        </span>
      ) : null}
    </Link>
  );
}

export function CategoryCircles() {
  const { data, isLoading } = useGetPublicCategoryTreeQuery();
  const categories = data?.data || [];

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [categories]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const offset = direction === "left" ? -300 : 300;
    scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    setTimeout(checkScroll, 320);
  };

  if (!isLoading && categories.length === 0) {
    return null;
  }

  return (
    <section className="border-b bg-muted/15 py-10 sm:py-14">
      <StoreContainer>
        {/* Section Header */}
        <div className="mb-6 sm:mb-8 flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
              <Sparkles className="size-3.5" />
              <span>Explore Collections</span>
            </div>
            <h2 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Shop by Category
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Scroll Navigation Arrows */}
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                aria-label="Previous categories"
                className="flex size-8 items-center justify-center rounded-full border border-border/80 bg-background text-foreground transition-all hover:bg-muted active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                aria-label="Next categories"
                className="flex size-8 items-center justify-center rounded-full border border-border/80 bg-background text-foreground transition-all hover:bg-muted active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>

            <Link
              href="/products"
              className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-primary hover:underline group ml-2"
            >
              <span>View all</span>
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {/* Categories Horizontal Carousel */}
        {isLoading ? (
          <div className="flex gap-4 sm:gap-6 overflow-hidden">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2.5 shrink-0">
                <Skeleton className="size-20 sm:size-24 rounded-full" />
                <Skeleton className="h-3.5 w-16" />
              </div>
            ))}
          </div>
        ) : (
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex gap-4 sm:gap-6 lg:gap-8 overflow-x-auto pb-2 scrollbar-none scroll-smooth snap-x select-none"
          >
            {categories.map((category: Category, idx: number) => (
              <CategoryCircleItem
                key={category.id}
                category={category}
                idx={idx}
              />
            ))}
          </div>
        )}
      </StoreContainer>
    </section>
  );
}
