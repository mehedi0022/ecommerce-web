"use client";

import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface AdminPaginationProps {
  /** Current active page (1-indexed) */
  page: number;
  /** Items per page limit */
  limit: number;
  /** Total number of items across all pages */
  total: number;
  /** Total number of pages (computed automatically if omitted) */
  totalPages?: number;
  /** Callback when page number changes */
  onPageChange: (newPage: number) => void;
  /** Optional callback when limit/rows-per-page changes */
  onLimitChange?: (newLimit: number) => void;
  /** Allowed options for rows per page */
  pageSizeOptions?: number[];
  /** Disable controls while data is loading/fetching */
  disabled?: boolean;
  /** Additional container styling */
  className?: string;
  /** Show rows per page selector (default: true if onLimitChange is passed) */
  showPageSizeSelector?: boolean;
}

export function AdminPagination({
  page,
  limit,
  total,
  totalPages: propTotalPages,
  onPageChange,
  onLimitChange,
  pageSizeOptions = [10, 15, 20, 50, 100],
  disabled = false,
  className,
  showPageSizeSelector = true,
}: AdminPaginationProps) {
  const calculatedTotalPages = Math.max(1, Math.ceil(total / limit));
  const totalPages = propTotalPages ?? calculatedTotalPages;

  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  // Generate pagination buttons array (numbers and ellipsis)
  const getPageNumbers = (): (number | "...")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (page <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }
    if (page >= totalPages - 3) {
      return [
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }
    return [1, "...", page - 1, page, page + 1, "...", totalPages];
  };

  const pages = getPageNumbers();

  const handlePageClick = (p: number) => {
    if (p < 1 || p > totalPages || p === page || disabled) return;
    onPageChange(p);
  };

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-3 border-t px-4 py-3 bg-muted/20 text-xs",
        className
      )}
    >
      {/* Left side: Results Count & Rows Per Page */}
      <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
        <div>
          Showing{" "}
          <span className="font-semibold text-foreground">{startItem}</span> to{" "}
          <span className="font-semibold text-foreground">{endItem}</span> of{" "}
          <span className="font-semibold text-foreground">{total}</span> entries
        </div>

        {showPageSizeSelector && onLimitChange && (
          <div className="flex items-center gap-1.5 border-l pl-4 dark:border-border/60">
            <span>Rows per page:</span>
            <select
              value={limit}
              disabled={disabled}
              onChange={(e) => {
                const nextLimit = Number(e.target.value);
                onLimitChange(nextLimit);
                onPageChange(1);
              }}
              className="h-8 rounded-md border border-input bg-background px-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-medium cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right side: Page navigation */}
      <div className="flex items-center gap-1">
        {/* First Page */}
        <Button
          variant="outline"
          size="icon-sm"
          className="h-8 w-8"
          disabled={page <= 1 || disabled}
          onClick={() => handlePageClick(1)}
          title="First Page"
        >
          <ChevronsLeft className="size-3.5" />
        </Button>

        {/* Previous Page */}
        <Button
          variant="outline"
          size="icon-sm"
          className="h-8 w-8"
          disabled={page <= 1 || disabled}
          onClick={() => handlePageClick(page - 1)}
          title="Previous Page"
        >
          <ChevronLeft className="size-3.5" />
        </Button>

        {/* Page numbers (visible on sm+ screens) */}
        <div className="hidden sm:flex items-center gap-1 mx-1">
          {pages.map((item, idx) => {
            if (item === "...") {
              return (
                <div
                  key={`ellipsis-${idx}`}
                  className="flex size-8 items-center justify-center text-muted-foreground"
                >
                  <MoreHorizontal className="size-3.5" />
                </div>
              );
            }

            const isActive = item === page;
            return (
              <Button
                key={`page-${item}`}
                variant={isActive ? "default" : "outline"}
                size="icon-sm"
                className={cn(
                  "h-8 w-8 text-xs font-medium",
                  isActive && "pointer-events-none font-bold"
                )}
                disabled={disabled}
                onClick={() => handlePageClick(item)}
              >
                {item}
              </Button>
            );
          })}
        </div>

        {/* Mobile current page indicator */}
        <span className="sm:hidden text-xs font-mono px-2 text-muted-foreground">
          {page} / {totalPages}
        </span>

        {/* Next Page */}
        <Button
          variant="outline"
          size="icon-sm"
          className="h-8 w-8"
          disabled={page >= totalPages || disabled}
          onClick={() => handlePageClick(page + 1)}
          title="Next Page"
        >
          <ChevronRight className="size-3.5" />
        </Button>

        {/* Last Page */}
        <Button
          variant="outline"
          size="icon-sm"
          className="h-8 w-8"
          disabled={page >= totalPages || disabled}
          onClick={() => handlePageClick(totalPages)}
          title="Last Page"
        >
          <ChevronsRight className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
