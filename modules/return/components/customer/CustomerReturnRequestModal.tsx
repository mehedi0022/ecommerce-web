"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { RotateCcw, AlertCircle, Loader2, CheckCircle2, Ban } from "lucide-react";
import { useCreateReturnRequestMutation } from "../../returnApi";
import type { ReturnReason, CreateReturnItemInput } from "../../return.types";
import type { OrderItemReturnItem } from "@/modules/order/order.types";

interface CustomerReturnRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderNumber: string;
  orderItems: Array<{
    id: number;
    productName: string;
    sku?: string;
    unitPrice: string | number;
    quantity: number;
    returnItems?: OrderItemReturnItem[];
  }>;
  onSuccess?: () => void;
}

const CONSUMING_STATUSES = ["REQUESTED", "APPROVED", "IN_TRANSIT", "RECEIVED", "COMPLETED"];

const REASON_LABELS: Record<ReturnReason, string> = {
  DEFECTIVE: "Defective or Malfunctioning Item",
  DAMAGED: "Damaged in Shipping / Broken",
  WRONG_ITEM: "Wrong Item / Color / Model Received",
  NOT_AS_DESCRIBED: "Item does not match website description",
  SIZE_OR_FIT: "Size or Fit issue",
  CHANGED_MIND: "Changed Mind / No longer needed",
  OTHER: "Other reason",
};

export function CustomerReturnRequestModal({
  open,
  onOpenChange,
  orderNumber,
  orderItems,
  onSuccess,
}: CustomerReturnRequestModalProps) {
  const [createReturn, { isLoading }] = useCreateReturnRequestMutation();

  // Selected item returns: orderItemId -> { quantity, reason, customerNote }
  const [selectedItems, setSelectedItems] = useState<
    Record<number, { quantity: number; reason: ReturnReason; customerNote: string }>
  >({});
  const [generalNote, setGeneralNote] = useState("");

  const hasAnyReturnableItem = orderItems.some((item) => {
    const consumedReturns = (item.returnItems || []).filter(
      (ri) => ri.return && CONSUMING_STATUSES.includes(ri.return.status)
    );
    const consumedQty = consumedReturns.reduce((sum, ri) => sum + ri.quantity, 0);
    return item.quantity > consumedQty;
  });

  const toggleItemSelection = (itemId: number, returnableQty: number) => {
    if (returnableQty <= 0) return;
    setSelectedItems((prev) => {
      const next = { ...prev };
      if (next[itemId]) {
        delete next[itemId];
      } else {
        next[itemId] = {
          quantity: Math.min(1, returnableQty),
          reason: "DEFECTIVE",
          customerNote: "",
        };
      }
      return next;
    });
  };

  const updateItem = (
    itemId: number,
    field: "quantity" | "reason" | "customerNote",
    value: any
  ) => {
    setSelectedItems((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const itemsToSubmit: CreateReturnItemInput[] = Object.entries(selectedItems).map(
      ([orderItemId, data]) => ({
        orderItemId: Number(orderItemId),
        quantity: data.quantity,
        reason: data.reason,
        customerNote: data.customerNote.trim() || undefined,
      })
    );

    if (itemsToSubmit.length === 0) {
      toast.error("Please select at least one item to return");
      return;
    }

    try {
      const res = await createReturn({
        orderNumber,
        data: {
          customerNote: generalNote.trim() || undefined,
          items: itemsToSubmit,
        },
      }).unwrap();

      toast.success(
        `Return request #${res.data.returnNumber} submitted successfully!`
      );
      setSelectedItems({});
      setGeneralNote("");
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to submit return request");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <RotateCcw className="size-5" />
            </div>
            <div>
              <DialogTitle>Request Return / Exchange</DialogTitle>
              <DialogDescription>
                Select the items from order #{orderNumber} that you wish to return.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {!hasAnyReturnableItem && (
            <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              <span>
                All items in this order have already been returned or requested for return. You can track their status in the <strong>Returns</strong> section.
              </span>
            </div>
          )}

          {/* Item Selector List */}
          <div className="space-y-3">
            <Label className="text-xs font-semibold text-foreground">
              Select Items to Return ({Object.keys(selectedItems).length} selected)
            </Label>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {orderItems.map((item) => {
                const consumedReturns = (item.returnItems || []).filter(
                  (ri) => ri.return && CONSUMING_STATUSES.includes(ri.return.status)
                );
                const consumedQty = consumedReturns.reduce((sum, ri) => sum + ri.quantity, 0);
                const remainingReturnableQty = Math.max(0, item.quantity - consumedQty);
                const isFullyConsumed = remainingReturnableQty === 0;

                const isSelected = Boolean(selectedItems[item.id]);
                const itemData = selectedItems[item.id];

                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-lg border transition-all text-xs ${
                      isFullyConsumed
                        ? "border-border/60 bg-muted/40 opacity-80"
                        : isSelected
                        ? "border-primary bg-primary/5"
                        : "border-input bg-card hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          id={`item-${item.id}`}
                          checked={isSelected}
                          disabled={isFullyConsumed}
                          onChange={() => toggleItemSelection(item.id, remainingReturnableQty)}
                          className="mt-0.5 rounded border-gray-300 text-primary focus:ring-primary size-4 disabled:opacity-40 disabled:cursor-not-allowed"
                        />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <label
                              htmlFor={`item-${item.id}`}
                              className={`font-semibold text-foreground ${
                                isFullyConsumed
                                  ? "cursor-not-allowed text-muted-foreground"
                                  : "cursor-pointer"
                              }`}
                            >
                              {item.productName}
                            </label>
                            {isFullyConsumed && (
                              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                                Return Already Requested
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            Purchased: {item.quantity} units &bull; ৳
                            {Number(item.unitPrice).toLocaleString()} each
                            {consumedQty > 0 && (
                              <span className="ml-1 text-amber-700 dark:text-amber-400 font-medium">
                                ({consumedQty} requested / returned)
                              </span>
                            )}
                            {!isFullyConsumed && consumedQty > 0 && (
                              <span className="ml-1 text-foreground font-semibold">
                                &bull; {remainingReturnableQty} returnable
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      {isSelected && !isFullyConsumed && (
                        <div className="flex items-center gap-2 shrink-0">
                          <Label className="text-[11px]">Qty to return:</Label>
                          <select
                            value={itemData.quantity}
                            onChange={(e) =>
                              updateItem(item.id, "quantity", Number(e.target.value))
                            }
                            className="h-7 text-xs rounded border bg-background px-2 font-medium"
                          >
                            {Array.from({ length: remainingReturnableQty }, (_, i) => i + 1).map(
                              (num) => (
                                <option key={num} value={num}>
                                  {num}
                                </option>
                              )
                            )}
                          </select>
                        </div>
                      )}
                    </div>

                    {isSelected && (
                      <div className="mt-3 pt-3 border-t grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <Label className="text-[11px]">Reason for return *</Label>
                          <Select
                            value={itemData.reason}
                            onValueChange={(val) =>
                              updateItem(item.id, "reason", val as ReturnReason)
                            }
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Select Reason" />
                            </SelectTrigger>
                            <SelectContent>
                              {(Object.keys(REASON_LABELS) as ReturnReason[]).map(
                                (rKey) => (
                                  <SelectItem key={rKey} value={rKey} className="text-xs">
                                    {REASON_LABELS[rKey]}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-[11px]">Item Note / Fault Detail</Label>
                          <input
                            type="text"
                            placeholder="e.g. Scratched surface, zipper jammed..."
                            value={itemData.customerNote}
                            onChange={(e) =>
                              updateItem(item.id, "customerNote", e.target.value)
                            }
                            className="h-8 w-full text-xs rounded-md border border-input bg-background px-2.5 py-1 focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Overall Comments */}
          <div className="space-y-1.5">
            <Label htmlFor="ret-general-note" className="text-xs">
              Additional Comments / Pickup Instructions (Optional)
            </Label>
            <Textarea
              id="ret-general-note"
              rows={2}
              placeholder="e.g. Preferred pickup time, packaging condition..."
              value={generalNote}
              onChange={(e) => setGeneralNote(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 text-xs text-muted-foreground flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0 text-primary" />
            <span>
              Once approved by our support team, our courier partner will collect the parcel. Please keep the item in its original box/packaging.
            </span>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || Object.keys(selectedItems).length === 0}
              className="gap-1.5"
            >
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CheckCircle2 className="size-4" />
              )}
              Submit Return Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
