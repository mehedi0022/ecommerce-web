"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Settings2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateThresholdMutation } from "../inventoryApi";
import type { InventoryItem } from "../inventory.types";

interface Props {
  item: InventoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InventoryThresholdDialog({ item, open, onOpenChange }: Props) {
  const [threshold, setThreshold] = useState<string>("5");

  useEffect(() => {
    if (item) {
      setThreshold(String(item.lowStockThreshold));
    }
  }, [item]);

  const [updateThreshold, { isLoading }] = useUpdateThresholdMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    const val = Number(threshold);
    if (isNaN(val) || val < 0) {
      toast.error("Threshold must be a non-negative number.");
      return;
    }

    try {
      await updateThreshold({
        variantId: item.variantId,
        lowStockThreshold: val,
      }).unwrap();

      toast.success(
        `Updated low stock threshold to ${val} for SKU: ${item.sku}`
      );
      onOpenChange(false);
    } catch (err: any) {
      toast.error(
        err?.data?.message || err?.message || "Failed to update threshold"
      );
    }
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground text-base">
            <Settings2 className="size-4 text-primary" />
            Low Stock Threshold
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <p className="text-xs text-muted-foreground">
            {item.productName} · <span className="font-mono">{item.sku}</span>
          </p>

          <div className="space-y-1.5">
            <Label htmlFor="threshold-val" className="text-xs font-semibold">
              Minimum Alert Quantity
            </Label>
            <Input
              id="threshold-val"
              type="number"
              min="0"
              required
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              className="text-sm"
              autoFocus
            />
            <p className="text-[11px] text-muted-foreground">
              When available stock reaches or falls below this number, it will be marked as <strong>Low Stock</strong>.
            </p>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin mr-1.5" />
                  Saving...
                </>
              ) : (
                "Save Threshold"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
