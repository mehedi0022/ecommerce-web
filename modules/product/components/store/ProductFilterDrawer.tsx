"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ProductFilterSidebar } from "./ProductFilterSidebar";
import type { Category } from "@/modules/category/types";
import type { Brand } from "@/modules/brand/types";

interface ProductFilterDrawerProps {
  categories: Category[];
  brands: Brand[];
}

export function ProductFilterDrawer({
  categories,
  brands,
}: ProductFilterDrawerProps) {
  const [open, setOpen] = useState(false);
  const searchParams = useSearchParams();

  // Calculate active filter count
  const keys = ["category", "brand", "minPrice", "maxPrice", "rating", "inStock", "isFeatured"];
  const activeCount = keys.filter((k) => searchParams.has(k)).length;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "gap-2 h-9 text-xs font-semibold cursor-pointer lg:hidden"
        )}
      >
        <SlidersHorizontal className="size-3.5" />
        <span>Filters</span>
        {activeCount > 0 && (
          <span className="flex size-4.5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {activeCount}
          </span>
        )}
      </SheetTrigger>

      <SheetContent side="left" className="w-[310px] sm:w-[360px] overflow-y-auto p-6">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="text-base font-bold flex items-center gap-2">
            <SlidersHorizontal className="size-4 text-primary" />
            Filter Products
          </SheetTitle>
        </SheetHeader>

        <div className="py-4">
          <ProductFilterSidebar
            categories={categories}
            brands={brands}
            onFilterChange={() => setOpen(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
