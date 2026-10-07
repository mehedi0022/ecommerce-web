"use client";

import { useState } from "react";
import { History, Package, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetVariantMovementsQuery } from "../inventoryApi";
import type { InventoryItem, InventoryMovementType } from "../inventory.types";

interface Props {
  item: InventoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const typeConfig: Record<
  InventoryMovementType,
  { label: string; className: string }
> = {
  INITIAL_STOCK: {
    label: "Initial Stock",
    className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  RESTOCK: {
    label: "Restock",
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  ORDER: {
    label: "Order Fulfilled",
    className: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  },
  ORDER_CANCELLED: {
    label: "Order Cancelled Release",
    className: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  },
  RETURN: {
    label: "Customer Return",
    className: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  },
  DAMAGED: {
    label: "Damaged / Loss",
    className: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  },
  ADJUSTMENT: {
    label: "Audit Adjustment",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
};

export function VariantMovementHistoryDialog({ item, open, onOpenChange }: Props) {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = useGetVariantMovementsQuery(
    {
      variantId: item?.variantId || 0,
      page,
      limit,
    },
    {
      skip: !open || !item?.variantId,
    }
  );

  if (!item) return null;

  const movements = data?.data || [];
  const meta = data?.meta || { page: 1, limit: 10, total: 0, totalPages: 1 };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col p-6">
        <DialogHeader className="shrink-0 pb-3 border-b">
          <div className="flex items-center gap-2">
            <History className="size-5 text-primary" />
            <DialogTitle className="text-base text-foreground">
              Stock Movement History — {item.sku}
            </DialogTitle>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {item.productName}{" "}
            {item.attributes.length > 0 &&
              `(${item.attributes.map((a) => `${a.name}: ${a.value}`).join(", ")})`}
          </p>
        </DialogHeader>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : movements.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Package className="size-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recorded stock movements for this item yet.</p>
            </div>
          ) : (
            movements.map((m) => {
              const cfg = typeConfig[m.type] || {
                label: m.type,
                className: "bg-muted text-muted-foreground",
              };
              const isPositive = m.quantity > 0;

              return (
                <div
                  key={m.id}
                  className="flex items-start justify-between gap-4 rounded-xl border border-border bg-card p-3 shadow-xs text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold ${cfg.className}`}
                      >
                        {cfg.label}
                      </Badge>
                      {m.referenceId && (
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {m.referenceType ? `${m.referenceType}: ` : ""}
                          {m.referenceId}
                        </span>
                      )}
                    </div>
                    {m.note && (
                      <p className="text-foreground text-xs">{m.note}</p>
                    )}
                    <span className="text-[10px] text-muted-foreground block">
                      {new Date(m.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-sm font-bold font-mono ${
                        isPositive
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {isPositive ? `+${m.quantity}` : m.quantity}
                    </span>
                    <span className="text-[10px] text-muted-foreground block">
                      units
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination Footer */}
        {meta.totalPages > 1 && (
          <div className="shrink-0 pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Page {meta.page} of {meta.totalPages} ({meta.total} movements)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                <ChevronLeft className="size-3.5 mr-1" /> Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2"
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page >= meta.totalPages}
              >
                Next <ChevronRight className="size-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
