"use client";

import { useState } from "react";
import { mediaUrl } from "@/modules/catalog/catalog.utils";
import { toast } from "sonner";
import { SlidersHorizontal, Loader2, Package, Plus, Minus } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { useAdjustInventoryMutation } from "../inventoryApi";
import type { InventoryItem } from "../inventory.types";

interface Props {
  item: InventoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InventoryAdjustDialog({ item, open, onOpenChange }: Props) {
  const [direction, setDirection] = useState<"ADD" | "DEDUCT">("ADD");
  const [quantity, setQuantity] = useState<string>("");
  const [referenceId, setReferenceId] = useState<string>("");
  const [note, setNote] = useState<string>("");

  const [adjust, { isLoading }] = useAdjustInventoryMutation();

  const handleClose = () => {
    setQuantity("");
    setReferenceId("");
    setNote("");
    setDirection("ADD");
    onOpenChange(false);
  };

  const parsedQty = Number(quantity) || 0;
  const delta = direction === "ADD" ? parsedQty : -parsedQty;
  const currentOnHand = item?.quantity ?? 0;
  const newOnHand = currentOnHand + delta;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    if (!parsedQty || parsedQty <= 0) {
      toast.error("Please enter a valid non-zero adjustment quantity.");
      return;
    }

    if (newOnHand < item.reservedQuantity) {
      toast.error(
        `Adjustment would bring total on-hand below reserved stock (${item.reservedQuantity} reserved).`
      );
      return;
    }

    if (!note.trim()) {
      toast.error("Please provide an audit note explaining the adjustment reason.");
      return;
    }

    try {
      await adjust({
        variantId: item.variantId,
        quantity: delta,
        referenceType: "AUDIT_ADJUSTMENT",
        referenceId: referenceId.trim() || undefined,
        note: note.trim(),
      }).unwrap();

      toast.success(
        `Adjusted stock by ${delta > 0 ? `+${delta}` : delta} units for SKU: ${item.sku}`
      );
      handleClose();
    } catch (err: any) {
      toast.error(
        err?.data?.message || err?.message || "Failed to adjust inventory"
      );
    }
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <SlidersHorizontal className="size-5 text-primary" />
            Audit Stock Adjustment
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Variant Preview Box */}
          <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-3">
            <div className="size-12 shrink-0 overflow-hidden rounded-lg border bg-background flex items-center justify-center relative">
              {item.productImage ? (
                <img
                  src={mediaUrl(item.productImage)}
                  alt={item.productName}
                  className="size-full object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-muted-foreground">
                  <Package className="size-5" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1 text-xs">
              <p className="font-semibold text-foreground truncate">
                {item.productName}
              </p>
              <p className="font-mono text-muted-foreground">{item.sku}</p>
              {item.attributes.length > 0 && (
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {item.attributes.map((a) => `${a.name}: ${a.value}`).join(" · ")}
                </p>
              )}
            </div>
            <div className="text-right text-xs shrink-0">
              <span className="text-muted-foreground block text-[10px]">
                Current On-Hand
              </span>
              <span className="font-bold text-foreground text-sm">
                {item.quantity} units
              </span>
            </div>
          </div>

          {/* Direction toggle */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Adjustment Action</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDirection("ADD")}
                className={`flex items-center justify-center gap-1.5 rounded-lg border p-2 text-xs font-semibold transition ${
                  direction === "ADD"
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold"
                    : "border-border bg-background text-muted-foreground hover:bg-muted"
                }`}
              >
                <Plus className="size-3.5" /> Increase (+) Stock
              </button>
              <button
                type="button"
                onClick={() => setDirection("DEDUCT")}
                className={`flex items-center justify-center gap-1.5 rounded-lg border p-2 text-xs font-semibold transition ${
                  direction === "DEDUCT"
                    ? "border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold"
                    : "border-border bg-background text-muted-foreground hover:bg-muted"
                }`}
              >
                <Minus className="size-3.5" /> Decrease (-) Stock
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="adjust-qty" className="text-xs font-semibold">
              Adjustment Quantity *
            </Label>
            <Input
              id="adjust-qty"
              type="number"
              min="1"
              required
              placeholder="e.g. 5"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="text-sm"
              autoFocus
            />

            {parsedQty > 0 && (
              <div className="rounded-lg border border-border bg-background p-2.5 text-xs flex justify-between items-center mt-2">
                <span className="text-muted-foreground">New On-Hand Total:</span>
                <span className="font-bold text-foreground text-sm">
                  {newOnHand} units{" "}
                  <span
                    className={
                      delta > 0
                        ? "text-emerald-600 text-xs"
                        : "text-amber-600 text-xs"
                    }
                  >
                    ({delta > 0 ? `+${delta}` : delta})
                  </span>
                </span>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="adjust-ref-id" className="text-xs font-semibold">
              Audit Batch or Reference ID (Optional)
            </Label>
            <Input
              id="adjust-ref-id"
              placeholder="e.g. AUDIT-2026-Q4"
              value={referenceId}
              onChange={(e) => setReferenceId(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="adjust-note" className="text-xs font-semibold">
              Audit Reason & Explanation *
            </Label>
            <Textarea
              id="adjust-note"
              required
              placeholder="e.g. Physical inventory recount discrepancy corrected, sample moved to showroom, packing count correction."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="resize-none text-xs"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="font-semibold bg-primary"
              disabled={isLoading || !parsedQty || !note.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin mr-1.5" />
                  Updating Stock...
                </>
              ) : (
                <>
                  <SlidersHorizontal className="size-3.5 mr-1.5" />
                  Save Adjustment
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
