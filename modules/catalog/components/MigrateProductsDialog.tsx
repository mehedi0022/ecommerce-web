"use client";

import { useState } from "react";
import { ArrowRightLeft, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useMigrateCategoryProductsMutation } from "@/modules/category/categoryApi";
import type { Category } from "@/modules/category/types";

interface MigrateProductsDialogProps {
  category: Category;
  categories: Array<Category & { path?: string }>;
  onClose: () => void;
  onSuccess?: () => void;
}

export function MigrateProductsDialog({
  category,
  categories,
  onClose,
  onSuccess,
}: MigrateProductsDialogProps) {
  const [targetId, setTargetId] = useState<number | "">("");
  const [migrate, { isLoading }] = useMigrateCategoryProductsMutation();

  // Exclude current category
  const availableTargets = categories.filter((c) => c.id !== category.id);

  const handleMigrate = async () => {
    if (!targetId) {
      toast.error("Please select a target category.");
      return;
    }

    try {
      const res = await migrate({
        id: category.id,
        targetCategoryId: Number(targetId),
      }).unwrap();

      const count = res?.data?.migratedCount ?? 0;
      toast.success(
        `Successfully transferred ${count} product(s) to target category!`
      );
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(
        err?.data?.message || err?.message || "Failed to migrate products."
      );
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && !isLoading && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <ArrowRightLeft className="size-5 text-primary" />
            Migrate Products
          </DialogTitle>
          <DialogDescription className="text-xs">
            Transfer all products currently assigned to{" "}
            <strong className="text-foreground">{category.name}</strong> to
            another category.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-300">
            <AlertCircle className="size-4 shrink-0 mt-0.5 text-amber-600" />
            <p className="leading-relaxed">
              This action will reassign all products from{" "}
              <strong>{category.name}</strong> to the chosen destination category.
              Their existing variants and attribute configurations will be
              preserved.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">
              Destination Target Category:
            </label>
            <select
              value={targetId}
              onChange={(e) =>
                setTargetId(e.target.value ? Number(e.target.value) : "")
              }
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs shadow-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Select destination category...</option>
              {availableTargets.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.path ?? c.name} {c.isLeaf ? "(Leaf)" : "(Group)"}
                </option>
              ))}
            </select>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            className="text-xs h-9"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleMigrate}
            disabled={!targetId || isLoading}
            className="gap-1.5 text-xs h-9 bg-primary font-semibold shadow-xs"
          >
            {isLoading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <ArrowRightLeft className="size-3.5" />
            )}
            {isLoading ? "Transferring..." : "Confirm & Transfer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
