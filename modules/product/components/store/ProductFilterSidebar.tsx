"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  RotateCcw,
  Star,
  ChevronRight,
  SlidersHorizontal,
  Layers,
  Tag,
  DollarSign,
  PackageCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import type { Category } from "@/modules/category/types";
import type { Brand } from "@/modules/brand/types";

export interface ProductFilterSidebarProps {
  categories: Category[];
  brands: Brand[];
  className?: string;
  onFilterChange?: () => void;
}

const MAX_PRICE = 10000;

const PRICE_PRESETS = [
  { label: "Under ৳500", min: 0, max: 500 },
  { label: "৳500 – ৳1,000", min: 500, max: 1000 },
  { label: "৳1,000 – ৳3,000", min: 1000, max: 3000 },
  { label: "৳3,000 – ৳5,000", min: 3000, max: 5000 },
  { label: "৳5,000+", min: 5000, max: MAX_PRICE },
];

const RATING_OPTIONS = [
  { rating: 4, label: "4.0 & above" },
  { rating: 3, label: "3.0 & above" },
  { rating: 2, label: "2.0 & above" },
  { rating: 1, label: "1.0 & above" },
];

export function ProductFilterSidebar({
  categories,
  brands,
  className,
  onFilterChange,
}: ProductFilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Active query parameters
  const currentCategory = searchParams.get("category") || "";
  const currentBrand = searchParams.get("brand") || "";
  const currentMinPrice = searchParams.get("minPrice") || "";
  const currentMaxPrice = searchParams.get("maxPrice") || "";
  const currentRating = searchParams.get("rating") || "";
  const currentInStock = searchParams.get("inStock") === "true";
  const currentFeatured = searchParams.get("isFeatured") === "true";

  // Category collapsed/expanded state (initially empty so subcategories are collapsed)
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(
    new Set()
  );

  // Local state for interactive slider [min, max]
  const initialMin = currentMinPrice ? Number(currentMinPrice) : 0;
  const initialMax = currentMaxPrice ? Number(currentMaxPrice) : MAX_PRICE;
  const [sliderValue, setSliderValue] = useState<[number, number]>([
    initialMin,
    initialMax,
  ]);

  // Local state for custom price inputs
  const [minPriceInput, setMinPriceInput] = useState(currentMinPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(currentMaxPrice);

  // Sync slider & inputs when URL params change externally (e.g. Back button or Reset)
  useEffect(() => {
    const min = currentMinPrice ? Number(currentMinPrice) : 0;
    const max = currentMaxPrice ? Number(currentMaxPrice) : MAX_PRICE;
    setSliderValue([min, max]);
    setMinPriceInput(currentMinPrice);
    setMaxPriceInput(currentMaxPrice);
  }, [currentMinPrice, currentMaxPrice]);

  // Helper to push URL updates
  const updateQuery = (updates: Record<string, string | null | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());

    // Reset to page 1 whenever any filter changes
    params.delete("page");

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
      onFilterChange?.();
    });
  };

  // Toggle Category expanded/collapsed node
  const toggleExpandCategory = (catId: number) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) {
        next.delete(catId);
      } else {
        next.add(catId);
      }
      return next;
    });
  };

  // Active category slugs array (comma separated)
  const activeCategorySlugs = currentCategory
    ? currentCategory.split(",").filter(Boolean)
    : [];

  // Toggle category checkbox selection
  const handleToggleCategory = (catSlug: string) => {
    const exists = activeCategorySlugs.includes(catSlug);
    const updated = exists
      ? activeCategorySlugs.filter((s) => s !== catSlug)
      : [...activeCategorySlugs, catSlug];

    updateQuery({
      category: updated.length ? updated.join(",") : null,
    });
  };

  // Clear all categories
  const handleClearCategories = () => {
    updateQuery({ category: null });
  };

  // Clear all filters
  const handleClearAll = () => {
    setMinPriceInput("");
    setMaxPriceInput("");
    setSliderValue([0, MAX_PRICE]);
    const params = new URLSearchParams();
    // preserve search term if exists
    const search = searchParams.get("search");
    if (search) params.set("search", search);

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
      onFilterChange?.();
    });
  };

  // Handle slider release/commit
  const handleSliderCommit = (val: number[]) => {
    const minVal = val[0] ?? 0;
    const maxVal = val[1] ?? MAX_PRICE;

    const minParam = minVal > 0 ? String(minVal) : null;
    const maxParam = maxVal < MAX_PRICE ? String(maxVal) : null;

    updateQuery({
      minPrice: minParam,
      maxPrice: maxParam,
    });
  };

  // Apply custom price range from inputs
  const handleApplyPrice = (e: React.FormEvent) => {
    e.preventDefault();
    const minVal = minPriceInput ? Number(minPriceInput) : 0;
    const maxVal = maxPriceInput ? Number(maxPriceInput) : MAX_PRICE;
    setSliderValue([minVal, maxVal]);

    updateQuery({
      minPrice: minPriceInput ? minPriceInput : null,
      maxPrice: maxPriceInput ? maxPriceInput : null,
    });
  };

  const handleSelectPricePreset = (min: number, max?: number) => {
    const resolvedMax = max !== undefined ? max : MAX_PRICE;
    setSliderValue([min, resolvedMax]);
    setMinPriceInput(String(min));
    setMaxPriceInput(max !== undefined && max < MAX_PRICE ? String(max) : "");

    updateQuery({
      minPrice: min > 0 ? String(min) : null,
      maxPrice: max !== undefined && max < MAX_PRICE ? String(max) : null,
    });
  };

  // Toggle brand selection (supports multi-select comma separated)
  const handleToggleBrand = (brandSlug: string) => {
    const activeBrands = currentBrand
      ? currentBrand.split(",").filter(Boolean)
      : [];
    const exists = activeBrands.includes(brandSlug);

    const updated = exists
      ? activeBrands.filter((b) => b !== brandSlug)
      : [...activeBrands, brandSlug];

    updateQuery({
      brand: updated.length ? updated.join(",") : null,
    });
  };

  const hasActiveFilters = Boolean(
    currentCategory ||
      currentBrand ||
      currentMinPrice ||
      currentMaxPrice ||
      currentRating ||
      currentInStock ||
      currentFeatured
  );

  return (
    <aside
      className={cn(
        "space-y-6 text-sm",
        isPending && "opacity-70 pointer-events-none transition-opacity",
        className
      )}
    >
      {/* ── Filter Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-2 font-bold text-foreground">
          <SlidersHorizontal className="size-4 text-primary" />
          <span>Filters</span>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearAll}
            className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
          >
            <RotateCcw className="size-3" />
            Reset
          </button>
        )}
      </div>

      {/* ── Categories Section (Collapsible Tree with Checkboxes) ────── */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Layers className="size-3.5" />
            <span>Categories</span>
          </h4>
          {activeCategorySlugs.length > 0 && (
            <button
              type="button"
              onClick={handleClearCategories}
              className="text-[11px] font-semibold text-muted-foreground hover:text-destructive cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
          {categories.map((cat) => {
            const hasChildren = Boolean(cat.children && cat.children.length > 0);
            const isExpanded = expandedCategories.has(cat.id);
            const isChecked = activeCategorySlugs.includes(cat.slug);

            return (
              <div key={cat.id} className="space-y-0.5">
                <div
                  className={cn(
                    "flex items-center justify-between rounded-lg px-2 py-1.5 transition-colors group",
                    isChecked ? "bg-primary/5" : "hover:bg-muted/50"
                  )}
                >
                  <label className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer select-none">
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={() => handleToggleCategory(cat.slug)}
                      className="size-3.5 shrink-0"
                    />
                    <span
                      className={cn(
                        "truncate text-xs font-medium transition-colors",
                        isChecked
                          ? "text-primary font-bold"
                          : "text-foreground group-hover:text-primary"
                      )}
                    >
                      {cat.name}
                    </span>
                  </label>

                  {/* Collapsible toggle chevron button if category has subcategories */}
                  {hasChildren && (
                    <button
                      type="button"
                      onClick={() => toggleExpandCategory(cat.id)}
                      className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer shrink-0 ml-1"
                      title={isExpanded ? "Collapse" : "Expand subcategories"}
                      aria-label={
                        isExpanded
                          ? `Collapse ${cat.name}`
                          : `Expand ${cat.name}`
                      }
                    >
                      <ChevronRight
                        className={cn(
                          "size-3.5 transition-transform duration-200",
                          isExpanded && "rotate-90"
                        )}
                      />
                    </button>
                  )}
                </div>

                {/* Subcategories (Initially Collapsed, Expanded on click) */}
                {hasChildren && isExpanded && (
                  <div className="ml-4 pl-2.5 border-l-2 border-border/60 space-y-0.5 pt-0.5 animate-in fade-in-50 duration-200">
                    {cat.children!.map((sub) => {
                      const isSubChecked = activeCategorySlugs.includes(sub.slug);

                      return (
                        <label
                          key={sub.id}
                          className={cn(
                            "flex items-center gap-2 rounded-md px-2 py-1 text-xs cursor-pointer select-none transition-colors",
                            isSubChecked
                              ? "bg-primary/10 text-primary font-semibold"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                          )}
                        >
                          <Checkbox
                            checked={isSubChecked}
                            onCheckedChange={() =>
                              handleToggleCategory(sub.slug)
                            }
                            className="size-3 shrink-0"
                          />
                          <span className="truncate">{sub.name}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Price Range Filter (Slider + Presets + Manual Inputs) ────── */}
      <div className="space-y-3.5 pt-3 border-t">
        <div className="flex items-center justify-between">
          <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <DollarSign className="size-3.5" />
            <span>Price Range</span>
          </h4>
          <span className="text-xs font-mono font-semibold text-primary">
            ৳{sliderValue[0].toLocaleString()} –{" "}
            {sliderValue[1] >= MAX_PRICE
              ? `৳${MAX_PRICE.toLocaleString()}+`
              : `৳${sliderValue[1].toLocaleString()}`}
          </span>
        </div>

        {/* Interactive Dual-Thumb Range Slider */}
        <div className="px-1.5 pt-1 pb-1">
          <Slider
            min={0}
            max={MAX_PRICE}
            step={50}
            value={sliderValue}
            onValueChange={(val) => {
              const min = val[0] ?? 0;
              const max = val[1] ?? MAX_PRICE;
              setSliderValue([min, max]);
              setMinPriceInput(min > 0 ? String(min) : "");
              setMaxPriceInput(max < MAX_PRICE ? String(max) : "");
            }}
            onValueCommitted={handleSliderCommit}
          />
          <div className="flex justify-between text-[10px] text-muted-foreground font-mono mt-1 select-none">
            <span>৳0</span>
            <span>৳{(MAX_PRICE / 2).toLocaleString()}</span>
            <span>৳{MAX_PRICE.toLocaleString()}+</span>
          </div>
        </div>

        {/* Preset chips */}
        <div className="flex flex-wrap gap-1.5">
          {PRICE_PRESETS.map((preset, idx) => {
            const isActive =
              currentMinPrice === (preset.min > 0 ? String(preset.min) : "") &&
              (preset.max === MAX_PRICE
                ? !currentMaxPrice
                : currentMaxPrice === String(preset.max));

            return (
              <button
                key={idx}
                type="button"
                onClick={() =>
                  handleSelectPricePreset(preset.min, preset.max)
                }
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-medium border transition-colors cursor-pointer",
                  isActive
                    ? "bg-primary text-primary-foreground border-primary font-semibold shadow-xs"
                    : "bg-muted/40 text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                )}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Custom Min / Max inputs */}
        <form onSubmit={handleApplyPrice} className="space-y-2 pt-1">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-muted-foreground block mb-0.5">
                Min ৳
              </span>
              <Input
                type="number"
                min="0"
                max={MAX_PRICE}
                value={minPriceInput}
                onChange={(e) => setMinPriceInput(e.target.value)}
                placeholder="0"
                className="h-8 text-xs font-mono"
              />
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block mb-0.5">
                Max ৳
              </span>
              <Input
                type="number"
                min="0"
                max={MAX_PRICE}
                value={maxPriceInput}
                onChange={(e) => setMaxPriceInput(e.target.value)}
                placeholder={String(MAX_PRICE)}
                className="h-8 text-xs font-mono"
              />
            </div>
          </div>
          <Button
            type="submit"
            variant="outline"
            size="sm"
            className="w-full h-7 text-xs font-semibold cursor-pointer"
          >
            Apply Price
          </Button>
        </form>
      </div>

      {/* ── Brands Section ─────────────────────────────────────────── */}
      {brands.length > 0 && (
        <div className="space-y-2.5 pt-3 border-t">
          <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Tag className="size-3.5" />
            <span>Brands</span>
          </h4>

          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {brands.map((brand) => {
              const activeBrands = currentBrand
                ? currentBrand.split(",").filter(Boolean)
                : [];
              const isChecked = activeBrands.includes(brand.slug);

              return (
                <label
                  key={brand.id}
                  className="flex items-center gap-2.5 rounded-lg px-2 py-1 text-xs text-foreground hover:bg-muted/50 cursor-pointer select-none transition-colors"
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={() => handleToggleBrand(brand.slug)}
                    className="size-3.5"
                  />
                  <span className="truncate font-medium">{brand.name}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Customer Ratings Filter ──────────────────────────────────── */}
      <div className="space-y-2.5 pt-3 border-t">
        <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <Star className="size-3.5" />
          <span>Customer Rating</span>
        </h4>

        <div className="space-y-1">
          {RATING_OPTIONS.map((opt) => {
            const isSelected = currentRating === String(opt.rating);

            return (
              <button
                key={opt.rating}
                type="button"
                onClick={() =>
                  updateQuery({
                    rating: isSelected ? null : String(opt.rating),
                  })
                }
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors cursor-pointer text-left",
                  isSelected
                    ? "bg-primary/10 text-primary font-bold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "size-3",
                          i < opt.rating
                            ? "fill-amber-400 text-amber-500"
                            : "text-muted-foreground/30"
                        )}
                      />
                    ))}
                  </div>
                  <span className="font-medium text-foreground">
                    {opt.label}
                  </span>
                </div>
                {isSelected && (
                  <span className="text-[10px] text-primary font-bold">
                    Active
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Additional Filter Toggles (In Stock & Featured) ─────────── */}
      <div className="space-y-2 pt-3 border-t">
        <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <PackageCheck className="size-3.5" />
          <span>Availability</span>
        </h4>

        <label className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-foreground hover:bg-muted/50 cursor-pointer select-none transition-colors">
          <span className="font-medium">In Stock Only</span>
          <Checkbox
            checked={currentInStock}
            onCheckedChange={(checked) =>
              updateQuery({ inStock: checked ? "true" : null })
            }
            className="size-4"
          />
        </label>

        <label className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-foreground hover:bg-muted/50 cursor-pointer select-none transition-colors">
          <span className="flex items-center gap-1 font-medium">
            <Sparkles className="size-3.5 text-amber-500" />
            Featured Deals
          </span>
          <Checkbox
            checked={currentFeatured}
            onCheckedChange={(checked) =>
              updateQuery({ isFeatured: checked ? "true" : null })
            }
            className="size-4"
          />
        </label>
      </div>
    </aside>
  );
}
