"use client";

import { useState } from "react";
import { mediaUrl } from "@/modules/catalog/catalog.utils";
import { toast } from "sonner";
import { PackagePlus, Loader2, Package } from "lucide-react";
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
import { useRestockInventoryMutation } from "../inventoryApi";
import type { InventoryItem } from "../inventory.types";

interface Props {
  item: InventoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InventoryRestockDialog({ item, open, onOpenChange }: Props) {
  const [quantity, setQuantity] = useState<string>("");
  const [referenceType, setReferenceType] = useState<string>("PURCHASE_ORDER");
  const [referenceId, setReferenceId] = useState<string>("");
  const [note, setNote] = useState<string>("");

  const [restock, { isLoading }] = useRestockInventoryMutation();

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
      toast.error("Please enter a valid positive quantity to restock.");
      return;
    }

    try {
      await restock({
        variantId: item.variantId,
        quantity: qty,
        referenceType: referenceType.trim() || undefined,
        referenceId: referenceId.trim() || undefined,
        note: note.trim() || undefined,
      }).unwrap();

      toast.success(`Successfully restocked ${qty} units for SKU: ${item.sku}`);
      handleClose();
    } catch (err: any) {
      toast.error(
        err?.data?.message || err?.message || "Failed to record restock"
      );
    }
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <PackagePlus className="size-5 text-emerald-600" />
            Restock Inventory
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Variant Preview Card */}
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
              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                {item.availableQuantity}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="restock-qty" className="text-xs font-semibold">
              Quantity to Add *
            </Label>
            <Input
              id="restock-qty"
              type="number"
              min="1"
              required
              placeholder="e.g. 50"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="text-sm"
              autoFocus
            />
            {Number(quantity) > 0 && (
              <p className="text-[11px] text-muted-foreground">
                New available stock will be:{" "}
                <strong className="text-foreground">
                  {item.availableQuantity + Number(quantity)} units
                </strong>
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="restock-ref-type" className="text-xs font-semibold">
                Reference Type
              </Label>
              <select
                id="restock-ref-type"
                value={referenceType}
                onChange={(e) => setReferenceType(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
              >
                <option value="PURCHASE_ORDER">Purchase Order (PO)</option>
                <option value="SUPPLIER_INVOICE">Supplier Invoice</option>
                <option value="WAREHOUSE_TRANSFER">Warehouse Transfer</option>
                <option value="MANUAL">Manual Addition</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="restock-ref-id" className="text-xs font-semibold">
                Reference ID / PO Number
              </Label>
              <Input
                id="restock-ref-id"
                placeholder="e.g. PO-2026-004"
                value={referenceId}
                onChange={(e) => setReferenceId(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="restock-note" className="text-xs font-semibold">
              Internal Note / Remarks (Optional)
            </Label>
            <Textarea
              id="restock-note"
              placeholder="e.g. Received shipment from manufacturer batch #4."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
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
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              disabled={isLoading || !quantity}
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin mr-1.5" />
                  Adding Stock...
                </>
              ) : (
                <>
                  <PackagePlus className="size-3.5 mr-1.5" />
                  Confirm Restock
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
