"use client";

import React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
  { label: "Featured & Best Selling", sortBy: "isFeatured", sortOrder: "desc" },
  { label: "Newest Arrivals", sortBy: "createdAt", sortOrder: "desc" },
  { label: "Price: Low to High", sortBy: "price", sortOrder: "asc" },
  { label: "Price: High to Low", sortBy: "price", sortOrder: "desc" },
  { label: "Customer Rating", sortBy: "rating", sortOrder: "desc" },
  { label: "Product Name: A–Z", sortBy: "name", sortOrder: "asc" },
];

export function ProductSortSelect({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSortBy = searchParams.get("sortBy") || "createdAt";
  const currentSortOrder = searchParams.get("sortOrder") || "desc";

  const currentValue = `${currentSortBy}:${currentSortOrder}`;

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [sortBy, sortOrder] = e.target.value.split(":");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");

    if (sortBy === "createdAt" && sortOrder === "desc") {
      params.delete("sortBy");
      params.delete("sortOrder");
    } else {
      params.set("sortBy", sortBy);
      params.set("sortOrder", sortOrder);
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-xs text-muted-foreground hidden sm:inline flex items-center gap-1 font-medium">
        <ArrowUpDown className="size-3.5" /> Sort by:
      </span>
      <select
        value={currentValue}
        onChange={handleSortChange}
        aria-label="Sort products"
        className="h-9 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-semibold text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
      >
        {SORT_OPTIONS.map((opt) => (
          <option
            key={`${opt.sortBy}:${opt.sortOrder}`}
            value={`${opt.sortBy}:${opt.sortOrder}`}
          >
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
