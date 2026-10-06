"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProductPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  className?: string;
}

export function ProductPagination({
  currentPage,
  totalPages,
  totalItems,
  limit,
  className,
}: ProductPaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (pageNumber === 1) {
      params.delete("page");
    } else {
      params.set("page", String(pageNumber));
    }
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  // Generate page numbers with ellipses
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      if (start > 2) pages.push("ellipsis");
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push("ellipsis");

      pages.push(totalPages);
    }

    return pages;
  };

  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalItems);

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-4 py-8 border-t mt-10",
        className
      )}
    >
      <p className="text-xs text-muted-foreground order-2 sm:order-1">
        Showing <span className="font-semibold text-foreground">{startItem}</span> to{" "}
        <span className="font-semibold text-foreground">{endItem}</span> of{" "}
        <span className="font-semibold text-foreground">{totalItems}</span> products
      </p>

      <nav
        aria-label="Product pagination"
        className="flex items-center gap-1 order-1 sm:order-2"
      >
        {/* Previous Button */}
        {currentPage > 1 ? (
          <Link
            href={createPageUrl(currentPage - 1)}
            aria-label="Previous page"
            className={cn(
              buttonVariants({ variant: "outline", size: "icon-sm" }),
              "size-8 rounded-lg"
            )}
          >
            <ChevronLeft className="size-4" />
          </Link>
        ) : (
          <span
            className={cn(
              buttonVariants({ variant: "outline", size: "icon-sm" }),
              "size-8 rounded-lg opacity-40 pointer-events-none"
            )}
          >
            <ChevronLeft className="size-4" />
          </span>
        )}

        {/* Page numbers */}
        {getPageNumbers().map((p, idx) => {
          if (p === "ellipsis") {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="px-2 text-xs text-muted-foreground select-none"
              >
                …
              </span>
            );
          }

          const isCurrent = p === currentPage;

          return (
            <Link
              key={p}
              href={createPageUrl(p)}
              aria-current={isCurrent ? "page" : undefined}
              className={cn(
                buttonVariants({
                  variant: isCurrent ? "default" : "outline",
                  size: "sm",
                }),
                "size-8 p-0 rounded-lg text-xs font-semibold"
              )}
            >
              {p}
            </Link>
          );
        })}

        {/* Next Button */}
        {currentPage < totalPages ? (
          <Link
            href={createPageUrl(currentPage + 1)}
            aria-label="Next page"
            className={cn(
              buttonVariants({ variant: "outline", size: "icon-sm" }),
              "size-8 rounded-lg"
            )}
          >
            <ChevronRight className="size-4" />
          </Link>
        ) : (
          <span
            className={cn(
              buttonVariants({ variant: "outline", size: "icon-sm" }),
              "size-8 rounded-lg opacity-40 pointer-events-none"
            )}
          >
            <ChevronRight className="size-4" />
          </span>
        )}
      </nav>
    </div>
  );
}
