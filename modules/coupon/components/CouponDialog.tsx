"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import type {
  Coupon,
  CreateCouponInput,
  DiscountType,
} from "../coupon.types";

interface CouponDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coupon?: Coupon | null;
  onSave: (data: CreateCouponInput) => Promise<void>;
  isLoading?: boolean;
}

export function CouponDialog({
  open,
  onOpenChange,
  coupon,
  onSave,
  isLoading,
}: CouponDialogProps) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<DiscountType>("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState("");
  const [minimumOrderAmount, setMinimumOrderAmount] = useState("");
  const [maximumDiscountAmount, setMaximumDiscountAmount] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [usageLimitPerUser, setUsageLimitPerUser] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (coupon) {
      setCode(coupon.code);
      setName(coupon.name);
      setDescription(coupon.description || "");
      setDiscountType(coupon.discountType);
      setDiscountValue(String(coupon.discountValue));
      setMinimumOrderAmount(
        coupon.minimumOrderAmount ? String(coupon.minimumOrderAmount) : ""
      );
      setMaximumDiscountAmount(
        coupon.maximumDiscountAmount ? String(coupon.maximumDiscountAmount) : ""
      );
      setUsageLimit(coupon.usageLimit ? String(coupon.usageLimit) : "");
      setUsageLimitPerUser(
        coupon.usageLimitPerUser ? String(coupon.usageLimitPerUser) : ""
      );
      setStartsAt(
        coupon.startsAt ? new Date(coupon.startsAt).toISOString().slice(0, 16) : ""
      );
      setExpiresAt(
        coupon.expiresAt
          ? new Date(coupon.expiresAt).toISOString().slice(0, 16)
          : ""
      );
      setIsActive(coupon.isActive);
    } else {
      setCode("");
      setName("");
      setDescription("");
      setDiscountType("PERCENTAGE");
      setDiscountValue("");
      setMinimumOrderAmount("");
      setMaximumDiscountAmount("");
      setUsageLimit("");
      setUsageLimitPerUser("");
      setStartsAt("");
      setExpiresAt("");
      setIsActive(true);
    }
  }, [coupon, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      toast.error("Coupon code is required");
      return;
    }

    if (!name.trim()) {
      toast.error("Coupon name is required");
      return;
    }

    const numDiscountValue = Number(discountValue);
    if (isNaN(numDiscountValue) || numDiscountValue <= 0) {
      toast.error("Discount value must be greater than 0");
      return;
    }

    if (discountType === "PERCENTAGE" && numDiscountValue > 100) {
      toast.error("Percentage discount cannot exceed 100%");
      return;
    }

    if (startsAt && expiresAt && new Date(expiresAt) <= new Date(startsAt)) {
      toast.error("Expiry date must be after start date");
      return;
    }

    const payload: CreateCouponInput = {
      code: cleanCode,
      name: name.trim(),
      description: description.trim() || null,
      discountType,
      discountValue: numDiscountValue,
      minimumOrderAmount: minimumOrderAmount ? Number(minimumOrderAmount) : null,
      maximumDiscountAmount: maximumDiscountAmount
        ? Number(maximumDiscountAmount)
        : null,
      usageLimit: usageLimit ? Number(usageLimit) : null,
      usageLimitPerUser: usageLimitPerUser ? Number(usageLimitPerUser) : null,
      startsAt: startsAt ? new Date(startsAt).toISOString() : null,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      isActive,
    };

    try {
      await onSave(payload);
      onOpenChange(false);
    } catch {
      // error handled in caller
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {coupon ? "Edit Coupon" : "Create New Coupon"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Coupon Code & Name */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="coupon-code">
                Coupon Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="coupon-code"
                placeholder="e.g. EID2026 or SAVE20"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                required
                className="font-mono uppercase font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="coupon-name">
                Coupon Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="coupon-name"
                placeholder="e.g. Eid Special Discount"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="coupon-desc">Description (Optional)</Label>
            <Textarea
              id="coupon-desc"
              rows={2}
              placeholder="Brief details about the promo or campaign..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Discount Type & Value */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="discount-type">Discount Type</Label>
              <select
                id="discount-type"
                value={discountType}
                onChange={(e) =>
                  setDiscountType(e.target.value as DiscountType)
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED_AMOUNT">Fixed Amount (৳)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="discount-value">
                Discount Value{" "}
                {discountType === "PERCENTAGE" ? "(%)" : "(৳)"}{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="discount-value"
                type="number"
                step="0.01"
                min="0.01"
                max={discountType === "PERCENTAGE" ? "100" : undefined}
                placeholder={discountType === "PERCENTAGE" ? "20" : "150"}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Min Order & Max Discount */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="min-order">Min Order Amount (৳)</Label>
              <Input
                id="min-order"
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 500 (optional)"
                value={minimumOrderAmount}
                onChange={(e) => setMinimumOrderAmount(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="max-discount">Max Discount Cap (৳)</Label>
              <Input
                id="max-discount"
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 300 (optional)"
                value={maximumDiscountAmount}
                onChange={(e) => setMaximumDiscountAmount(e.target.value)}
              />
            </div>
          </div>

          {/* Usage Limits */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="usage-limit">Total Usage Limit</Label>
              <Input
                id="usage-limit"
                type="number"
                min="1"
                placeholder="Total available uses (optional)"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="usage-limit-user">Usage Limit Per User</Label>
              <Input
                id="usage-limit-user"
                type="number"
                min="1"
                placeholder="e.g. 1 per customer"
                value={usageLimitPerUser}
                onChange={(e) => setUsageLimitPerUser(e.target.value)}
              />
            </div>
          </div>

          {/* Validity Period */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="starts-at">Starts At</Label>
              <Input
                id="starts-at"
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="expires-at">Expires At</Label>
              <Input
                id="expires-at"
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>
          </div>

          {/* Active Switch */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="is-active" className="text-sm font-semibold">
                Coupon Status
              </Label>
              <p className="text-xs text-muted-foreground">
                When enabled, customers can apply this code during checkout.
              </p>
            </div>
            <Switch
              id="is-active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? "Saving..."
                : coupon
                ? "Save Changes"
                : "Create Coupon"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
