"use client";

import { useState, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { mediaUrl } from "@/modules/catalog/catalog.utils";
import type { ProductImage } from "../../types";

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
  activeImageId?: number | null;
}

export function ProductGallery({ images, productName, activeImageId }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    if (activeImageId != null) {
      const idx = images.findIndex((img) => img.id === activeImageId);
      if (idx !== -1) {
        setSelectedIndex(idx);
      }
    }
  }, [activeImageId, images]);

  const selectedImage = images[selectedIndex];

  const prev = useCallback(() => {
    setSelectedIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  }, [images.length]);

  const next = useCallback(() => {
    setSelectedIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  }, [images.length]);

  if (images.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-muted">
        <span className="text-sm text-muted-foreground">
          No image available
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* ── Main image ───────────────────────────── */}
      <div className="group relative overflow-hidden rounded-2xl bg-muted">
        <div className="relative aspect-square w-full overflow-hidden">
          <img
            key={selectedImage.id}
            src={mediaUrl(selectedImage.imageUrl)}
            alt={selectedImage.altText ?? productName}
            className={cn(
              "size-full object-contain transition-all duration-300",
              zoomed ? "scale-150 cursor-zoom-out" : "cursor-zoom-in",
            )}
            onClick={() => setZoomed((z) => !z)}
          />
        </div>

        {/* Zoom hint */}
        {!zoomed && (
          <button
            type="button"
            aria-label="Zoom image"
            onClick={() => setZoomed(true)}
            className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm opacity-0 shadow-sm transition group-hover:opacity-100"
          >
            <ZoomIn className="size-4 text-foreground/70" />
          </button>
        )}

        {/* Prev / Next arrows (only when multiple images) */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={prev}
              className="absolute left-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm shadow-sm opacity-0 transition group-hover:opacity-100 hover:bg-background"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={next}
              className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm shadow-sm opacity-0 transition group-hover:opacity-100 hover:bg-background"
            >
              <ChevronRight className="size-4" />
            </button>
          </>
        )}

        {/* Dot indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`View image ${i + 1}`}
                onClick={() => setSelectedIndex(i)}
                className={cn(
                  "size-1.5 rounded-full transition-all",
                  i === selectedIndex
                    ? "bg-foreground w-4"
                    : "bg-foreground/30 hover:bg-foreground/60",
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Thumbnail strip ──────────────────────── */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((image, i) => (
            <button
              key={image.id}
              type="button"
              aria-label={`Select image ${i + 1}`}
              onClick={() => setSelectedIndex(i)}
              className={cn(
                "relative size-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                i === selectedIndex
                  ? "border-foreground ring-2 ring-foreground/20"
                  : "border-transparent hover:border-border",
              )}
            >
              <img
                src={mediaUrl(image.imageUrl)}
                alt={image.altText ?? `${productName} ${i + 1}`}
                className="size-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
