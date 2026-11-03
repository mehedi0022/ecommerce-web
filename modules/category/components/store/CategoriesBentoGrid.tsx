"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Sparkles,
  Layers,
  ArrowRight,
  ShoppingBag,
  X,
  Tag,
  Flame,
  Shirt,
  Laptop,
  Watch,
  Headphones,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { mediaUrl } from "@/modules/catalog/catalog.utils";
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

const bentoGradients = [
  "from-slate-900 via-indigo-950/80 to-purple-950/90",
  "from-neutral-900 via-emerald-950/80 to-teal-950/90",
  "from-neutral-950 via-amber-950/70 to-stone-900",
  "from-neutral-900 via-rose-950/80 to-pink-950/90",
  "from-neutral-900 via-sky-950/80 to-blue-950/90",
  "from-neutral-950 via-violet-950/80 to-purple-950/90",
];

function BentoCard({
  category,
  idx,
  isFeaturedHero,
}: {
  category: Category;
  idx: number;
  isFeaturedHero: boolean;
}) {
  const [hasError, setHasError] = useState(false);
  const imageUrl = category.image && !hasError ? mediaUrl(category.image) : null;
  const subcategories = category.children || [];
  const Icon = fallbackIcons[idx % fallbackIcons.length];
  const gradient = bentoGradients[idx % bentoGradients.length];

  return (
    <div
      className={`group relative overflow-hidden rounded-3xl border border-border/80 bg-card p-6 sm:p-7 flex flex-col justify-between transition-all duration-500 hover:border-primary/50 hover:shadow-xl ${
        isFeaturedHero
          ? "md:col-span-2 min-h-[340px] sm:min-h-[380px]"
          : "min-h-[300px] sm:min-h-[340px]"
      }`}
    >
      {/* Background Image / Ambient Gradient */}
      {imageUrl ? (
        <div className="absolute inset-0 z-0">
          <Image
            src={imageUrl}
            alt={category.name}
            fill
            unoptimized
            onError={() => setHasError(true)}
            sizes={
              isFeaturedHero
                ? "(max-width: 1024px) 100vw, 66vw"
                : "(max-width: 768px) 100vw, 33vw"
            }
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-neutral-950/30" />
        </div>
      ) : (
        <div
          className={`absolute inset-0 z-0 bg-gradient-to-br ${gradient} opacity-95 group-hover:opacity-100 transition-opacity`}
        >
          <div className="absolute -right-12 -bottom-12 size-60 rounded-full bg-white/5 blur-2xl group-hover:scale-125 transition-transform duration-700 pointer-events-none" />
          <div className="absolute top-6 right-6 text-white/10 group-hover:text-white/20 transition-colors">
            <Icon className="size-28 sm:size-36" />
          </div>
        </div>
      )}

      {/* Top Row: Department Badge & Subcategory Count */}
      <div className="relative z-10 flex items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-md px-3 py-1 text-xs font-bold uppercase tracking-wider text-white border border-white/20 shadow-xs">
          <Sparkles className="size-3 text-amber-300" />
          <span>Department</span>
        </div>

        {subcategories.length > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-black/40 backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold text-white/90 border border-white/10">
            {subcategories.length} Subcategories
          </span>
        )}
      </div>

      {/* Middle / Bottom Content */}
      <div className="relative z-10 mt-12 sm:mt-16 space-y-3">
        <div>
          <Link
            href={`/category/${category.slug}`}
            className="group/title inline-block focus:outline-none"
          >
            <h2
              className={`font-black tracking-tight text-white transition-colors group-hover/title:text-primary ${
                isFeaturedHero
                  ? "text-2xl sm:text-4xl"
                  : "text-xl sm:text-2xl"
              }`}
            >
              {category.name}
            </h2>
          </Link>
          <p className="mt-1 text-xs sm:text-sm text-neutral-300 line-clamp-2 leading-relaxed max-w-lg">
            {category.description ||
              `Explore authentic ${category.name} collections with fast doorstep delivery.`}
          </p>
        </div>

        {/* Subcategories Pills (Interactive direct links) */}
        {subcategories.length > 0 && (
          <div className="pt-2 flex flex-wrap gap-1.5">
            {subcategories
              .slice(0, isFeaturedHero ? 8 : 4)
              .map((sub) => (
                <Link
                  key={sub.id}
                  href={`/category/${sub.slug}`}
                  className="rounded-lg bg-white/10 hover:bg-white/25 backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold text-white border border-white/15 transition-all active:scale-95 shadow-2xs"
                >
                  {sub.name}
                </Link>
              ))}
            {subcategories.length > (isFeaturedHero ? 8 : 4) && (
              <Link
                href={`/category/${category.slug}`}
                className="rounded-lg bg-white/5 hover:bg-white/15 backdrop-blur-md px-2 py-1 text-[11px] font-semibold text-neutral-300 border border-white/10 transition-colors"
              >
                +{subcategories.length - (isFeaturedHero ? 8 : 4)} more
              </Link>
            )}
          </div>
        )}

        {/* Bottom Action CTA */}
        <div className="pt-3 flex items-center justify-between border-t border-white/15">
          <span className="text-xs font-semibold text-white/70 flex items-center gap-1.5">
            <ShoppingBag className="size-3.5 text-amber-300" />
            Browse Catalog
          </span>
          <Link
            href={`/category/${category.slug}`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-white text-neutral-950 px-3.5 py-1.5 text-xs font-bold hover:bg-white/90 active:scale-95 transition-all shadow-sm group-hover:gap-2"
          >
            <span>Explore</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export function CategoriesBentoGrid({
  categories,
}: {
  categories: Category[];
}) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter categories and their subcategories based on user search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;

    const q = searchQuery.toLowerCase().trim();
    return categories.filter((cat) => {
      const matchParent =
        cat.name.toLowerCase().includes(q) ||
        (cat.description && cat.description.toLowerCase().includes(q));
      const matchChild = (cat.children || []).some((sub) =>
        sub.name.toLowerCase().includes(q)
      );
      return matchParent || matchChild;
    });
  }, [categories, searchQuery]);

  const totalSubcategories = useMemo(() => {
    return categories.reduce(
      (sum, cat) => sum + (cat.children?.length || 0),
      0
    );
  }, [categories]);

  return (
    <div className="space-y-8">
      {/* ── Search & Filter Controls Bar ──────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-border/80 bg-card shadow-xs">
        {/* Instant Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Search departments or subcategories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9 h-10 text-xs sm:text-sm rounded-xl bg-background border-border/80 focus-visible:ring-1 focus-visible:ring-primary"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Quick Stats Badges */}
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 rounded-xl border border-border/60 bg-muted/40 px-3 py-1.5 text-foreground">
            <Layers className="size-3.5 text-primary" />
            {categories.length} Departments
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-xl border border-border/60 bg-muted/40 px-3 py-1.5 text-foreground">
            <Tag className="size-3.5 text-emerald-600" />
            {totalSubcategories} Subcategories
          </span>
        </div>
      </div>

      {/* ── Bento Grid Layout ─────────────────────────────────────────── */}
      {filteredCategories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredCategories.map((category, idx) => {
            const isFeaturedHero = idx === 0 && !searchQuery && filteredCategories.length >= 3;
            return (
              <BentoCard
                key={category.id}
                category={category}
                idx={idx}
                isFeaturedHero={isFeaturedHero}
              />
            );
          })}
        </div>
      ) : (
        /* ── Empty Filter State ── */
        <div className="rounded-3xl border border-dashed border-border/80 bg-card p-12 text-center max-w-md mx-auto space-y-4 shadow-xs">
          <div className="size-16 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto text-muted-foreground">
            <Search className="size-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-foreground">
              No categories match &quot;{searchQuery}&quot;
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We couldn&apos;t find any department or subcategory matching your search.
              Try typing a different keyword or reset the search.
            </p>
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <span>Clear Search</span>
              <X className="size-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
