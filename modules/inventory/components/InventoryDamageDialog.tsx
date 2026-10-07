"use client";

import { useState } from "react";
import { mediaUrl } from "@/modules/catalog/catalog.utils";
import { toast } from "sonner";
import { AlertCircle, Loader2, Package } from "lucide-react";
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
import { useRecordDamageMutation } from "../inventoryApi";
import type { InventoryItem } from "../inventory.types";

interface Props {
  item: InventoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InventoryDamageDialog({ item, open, onOpenChange }: Props) {
  const [quantity, setQuantity] = useState<string>("" );
  const [referenceId, setReferenceId] = useState<string>("");
  const [note, setNote] = useState<string>("");

  const [recordDamage, { isLoading }] = useRecordDamageMutation();

  const handleClose = () => {
    setQuantity("");
    setReferenceId("");
    setNote("");
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    const qty = Number(quantity);
    if (!qty || qty <= 0) {
      toast.error("Please enter a valid positive quantity to deduct.");
      return;
    }

    if (qty > item.availableQuantity) {
      toast.error(
        `Cannot record damage exceeding available stock (${item.availableQuantity} available).`
      );
      return;
    }

    if (!note.trim()) {
      toast.error("Please provide a reason or note for the damaged items.");
      return;
    }

    try {
      await recordDamage({
        variantId: item.variantId,
        quantity: qty,
        referenceType: "DAMAGE_LOG",
        referenceId: referenceId.trim() || undefined,
        note: note.trim(),
      }).unwrap();

      toast.success(
        `Recorded ${qty} damaged units for SKU: ${item.sku}`
      );
      handleClose();
    } catch (err: any) {
      toast.error(
        err?.data?.message || err?.message || "Failed to record damaged stock"
      );
    }
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <AlertCircle className="size-5 text-rose-600" />
            Record Damaged or Lost Stock
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
                Available
              </span>
              <span className="font-bold text-foreground text-sm">
                {item.availableQuantity}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="damage-qty" className="text-xs font-semibold">
              Damaged Quantity to Remove *
            </Label>
            <Input
              id="damage-qty"
              type="number"
              min="1"
              max={item.availableQuantity}
              required
              placeholder={`Max: ${item.availableQuantity}`}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="text-sm"
              autoFocus
            />
            {Number(quantity) > 0 && (
              <p className="text-[11px] text-muted-foreground">
                Remaining Available Stock will be:{" "}
                <strong className="text-foreground">
                  {Math.max(0, item.availableQuantity - Number(quantity))} units
                </strong>
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="damage-ref-id" className="text-xs font-semibold">
              Incident or Reference ID (Optional)
            </Label>
            <Input
              id="damage-ref-id"
              placeholder="e.g. INC-2026-101"
              value={referenceId}
              onChange={(e) => setReferenceId(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="damage-note" className="text-xs font-semibold">
              Damage Reason and Explanation *
            </Label>
            <Textarea
              id="damage-note"
              required
              placeholder="e.g. Water leak in shelf section B, transit packaging damaged, expired goods."
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
              variant="destructive"
              className="font-semibold"
              disabled={isLoading || !quantity || !note.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin mr-1.5" />
                  Recording Damage...
                </>
              ) : (
                <>
                  <AlertCircle className="size-3.5 mr-1.5" />
                  Deduct Damaged Stock
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
