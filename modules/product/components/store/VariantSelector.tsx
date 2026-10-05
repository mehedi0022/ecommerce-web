"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { ProductVariant, ProductAttributeValue } from "../../types";

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedVariantId: number | null;
  onSelect: (variant: ProductVariant) => void;
}

// ─── Colour chip detection ───────────────────────────────────────────────────

const COLOR_ATTR_NAMES = ["color", "colour", "shade"];

const colorMap: Record<string, string> = {
  red: "#ef4444", crimson: "#dc143c", rose: "#f43f5e",
  pink: "#ec4899", fuchsia: "#d946ef", purple: "#a855f7",
  violet: "#8b5cf6", indigo: "#6366f1", blue: "#3b82f6",
  sky: "#0ea5e9", cyan: "#06b6d4", teal: "#14b8a6",
  emerald: "#10b981", green: "#22c55e", lime: "#84cc16",
  yellow: "#eab308", amber: "#f59e0b", orange: "#f97316",
  brown: "#92400e", tan: "#b45309", beige: "#d4b896",
  white: "#f9fafb", cream: "#fefce8", ivory: "#fffff0",
  black: "#111827", charcoal: "#374151", gray: "#9ca3af",
  grey: "#9ca3af", silver: "#d1d5db", navy: "#1e3a5f",
  gold: "#f59e0b", bronze: "#cd7f32", olive: "#556b2f",
  maroon: "#800000", peach: "#ffcba4", mint: "#98ff98",
};

function getColorHex(value: string): string | null {
  const lower = value.toLowerCase().trim();
  return colorMap[lower] ?? null;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function VariantSelector({
  variants,
  selectedVariantId,
  onSelect,
}: VariantSelectorProps) {
  const activeVariants = useMemo(
    () => variants.filter((v) => v.isActive),
    [variants]
  );

  // Group all available attribute options across active variants
  const { groupedAttributes, hasAnyAttributes } = useMemo(() => {
    const map = new Map<
      string,
      Map<string, { value: ProductAttributeValue; variantIds: Set<number> }>
    >();

    let totalAttributesFound = 0;

    for (const variant of activeVariants) {
      for (const av of variant.attributeValues ?? []) {
        if (!av?.attributeValue) continue;
        totalAttributesFound++;
        const attrName = av.attributeValue.attribute?.name || "Option";
        const valSlug = av.attributeValue.slug || String(av.attributeValue.id);

        if (!map.has(attrName)) {
          map.set(attrName, new Map());
        }
        const group = map.get(attrName)!;
        if (!group.has(valSlug)) {
          group.set(valSlug, {
            value: av.attributeValue,
            variantIds: new Set(),
          });
        }
        group.get(valSlug)!.variantIds.add(variant.id);
      }
    }

    return {
      groupedAttributes: map,
      hasAnyAttributes: totalAttributesFound > 0,
    };
  }, [activeVariants]);

  // Current selections based on selected variant
  const currentSelections = useMemo(() => {
    const selections = new Map<string, string>();
    const sel = activeVariants.find((v) => v.id === selectedVariantId) ?? activeVariants[0];

    if (sel?.attributeValues) {
      for (const av of sel.attributeValues) {
        if (!av?.attributeValue) continue;
        const attrName = av.attributeValue.attribute?.name || "Option";
        const valSlug = av.attributeValue.slug || String(av.attributeValue.id);
        selections.set(attrName, valSlug);
      }
    }
    return selections;
  }, [activeVariants, selectedVariantId]);

  /**
   * Checks if an option is directly available for the OTHER currently selected attributes.
   * If true: perfectly in-stock with current selection.
   * If false: available in a different variant combination (muted, click to switch).
   */
  const checkDirectAvailability = (targetAttrName: string, targetSlug: string) => {
    return activeVariants.some((v) => {
      const avs = v.attributeValues ?? [];
      const hasTarget = avs.some((av) => {
        const name = av.attributeValue?.attribute?.name || "Option";
        const slug = av.attributeValue?.slug || String(av.attributeValue?.id);
        return name === targetAttrName && slug === targetSlug;
      });
      if (!hasTarget) return false;

      // Must also match all other currently selected attributes
      for (const [otherAttr, otherSlug] of currentSelections.entries()) {
        if (otherAttr === targetAttrName) continue;
        const matchesOther = avs.some((av) => {
          const name = av.attributeValue?.attribute?.name || "Option";
          const slug = av.attributeValue?.slug || String(av.attributeValue?.id);
          return name === otherAttr && slug === otherSlug;
        });
        if (!matchesOther) return false;
      }
      return true;
    });
  };

  /**
   * Smart selector: When clicking any option (even a muted one),
   * finds the best matching active variant.
   */
  const handleSelect = (targetAttrName: string, targetSlug: string) => {
    // 1. Filter variants that possess this chosen attribute value
    const candidates = activeVariants.filter((variant) => {
      return (variant.attributeValues ?? []).some((av) => {
        const name = av.attributeValue?.attribute?.name || "Option";
        const slug = av.attributeValue?.slug || String(av.attributeValue?.id);
        return name === targetAttrName && slug === targetSlug;
      });
    });

    if (candidates.length === 0) return;

    // 2. Score each candidate by how many OTHER current selections it matches
    let bestVariant = candidates[0];
    let maxMatches = -1;

    for (const candidate of candidates) {
      let matches = 0;
      for (const [attrName, currentSlug] of currentSelections.entries()) {
        if (attrName === targetAttrName) continue;
        const hasOther = (candidate.attributeValues ?? []).some((av) => {
          const name = av.attributeValue?.attribute?.name || "Option";
          const slug = av.attributeValue?.slug || String(av.attributeValue?.id);
          return name === attrName && slug === currentSlug;
        });
        if (hasOther) matches++;
      }

      if (matches > maxMatches) {
        maxMatches = matches;
        bestVariant = candidate;
      }
    }

    onSelect(bestVariant);
  };

  // If no attributes were defined, render SKU pills directly
  if (!hasAnyAttributes || groupedAttributes.size === 0) {
    if (activeVariants.length <= 1) return null;

    return (
      <div className="flex flex-col gap-2.5">
        <span className="text-sm font-semibold text-foreground">Select Option</span>
        <div className="flex flex-wrap gap-2">
          {activeVariants.map((v) => {
            const isSelected = v.id === selectedVariantId;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => onSelect(v)}
                className={cn(
                  "rounded-lg border px-3.5 py-1.5 text-sm font-medium transition-all shadow-2xs cursor-pointer",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground font-semibold"
                    : "border-border bg-background text-foreground hover:border-foreground/40 hover:bg-muted/40"
                )}
              >
                {v.sku}
                {v.price && (
                  <span className="ml-1.5 opacity-75 font-normal">
                    (${Number(v.price).toFixed(2)})
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Multi-attribute option groups (e.g., Color, Size, etc.)
  return (
    <div className="flex flex-col gap-4">
      {[...groupedAttributes.entries()].map(([attrName, valueMap]) => {
        const isColorAttr = COLOR_ATTR_NAMES.includes(attrName.toLowerCase());
        const selectedSlug = currentSelections.get(attrName);
        const selectedValue = [...valueMap.values()].find(
          (v) => (v.value.slug || String(v.value.id)) === selectedSlug
        )?.value;

        return (
          <div key={attrName} className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">{attrName}:</span>
              {selectedValue && (
                <span className="text-sm font-medium text-foreground capitalize">
                  {selectedValue.value}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {[...valueMap.values()].map(({ value }) => {
                const valSlug = value.slug || String(value.id);
                const isSelected = selectedSlug === valSlug;
                const isDirectlyAvailable = isSelected || checkDirectAvailability(attrName, valSlug);
                const colorHex = isColorAttr ? getColorHex(value.value) : null;

                if (colorHex) {
                  // Color swatch button (Always clean & selectable, never slashed out)
                  const isLightColor = ["white", "cream", "ivory", "beige", "#f9fafb", "#fffff0"].some(
                    (c) => value.value.toLowerCase().includes(c)
                  );

                  return (
                    <button
                      key={valSlug}
                      type="button"
                      aria-label={`${attrName}: ${value.value}`}
                      title={value.value}
                      onClick={() => handleSelect(attrName, valSlug)}
                      className={cn(
                        "relative size-9 rounded-full transition-all flex items-center justify-center cursor-pointer",
                        isSelected
                          ? "ring-2 ring-primary ring-offset-2 scale-105 shadow-sm"
                          : "hover:scale-105 opacity-90 hover:opacity-100 border border-border/80"
                      )}
                      style={{ backgroundColor: colorHex }}
                    >
                      {/* Inner border for white/light color chips */}
                      {isLightColor && (
                        <span className="absolute inset-0 rounded-full border border-black/15" />
                      )}

                      {/* Selected checkmark */}
                      {isSelected && (
                        <svg
                          viewBox="0 0 12 12"
                          className={cn(
                            "size-3.5 drop-shadow-sm",
                            isLightColor ? "text-neutral-900" : "text-white"
                          )}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M1.5 6l3 3 6-6" />
                        </svg>
                      )}
                    </button>
                  );
                }

                // Standard pill button (Size, Material, etc.)
                return (
                  <button
                    key={valSlug}
                    type="button"
                    title={
                      !isDirectlyAvailable
                        ? `Size ${value.value} is available in another color (click to switch)`
                        : undefined
                    }
                    onClick={() => handleSelect(attrName, valSlug)}
                    className={cn(
                      "relative min-w-10 rounded-lg border px-3.5 py-1.5 text-sm font-medium transition-all cursor-pointer shadow-2xs",
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground font-semibold shadow-xs"
                        : isDirectlyAvailable
                          ? "border-border bg-background text-foreground hover:border-foreground/50 hover:bg-muted/40"
                          : "opacity-45 border-dashed border-border/90 bg-muted/20 text-muted-foreground hover:opacity-90 hover:border-foreground/50 line-through decoration-muted-foreground/60"
                    )}
                  >
                    {value.value}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
