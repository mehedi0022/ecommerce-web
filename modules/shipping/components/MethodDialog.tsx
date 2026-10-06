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
import type { ShippingMethod, CreateMethodInput } from "../shipping.types";

interface MethodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  method?: ShippingMethod | null;
  onSave: (data: CreateMethodInput) => Promise<void>;
  isLoading?: boolean;
}

export function MethodDialog({
  open,
  onOpenChange,
  method,
  onSave,
  isLoading,
}: MethodDialogProps) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (method) {
      setName(method.name);
      setCode(method.code);
      setDescription(method.description || "");
      setSortOrder(String(method.sortOrder ?? 0));
      setIsActive(method.isActive);
    } else {
      setName("");
      setCode("");
      setDescription("");
      setSortOrder("0");
      setIsActive(true);
    }
  }, [method, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Method name is required");
      return;
    }
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      toast.error("Method code is required");
      return;
    }

    const payload: CreateMethodInput = {
      name: name.trim(),
      code: cleanCode,
      description: description.trim() || null,
      sortOrder: Number(sortOrder) || 0,
      isActive,
    };

    try {
      await onSave(payload);
      onOpenChange(false);
    } catch {
      // error handled in parent
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {method ? "Edit Shipping Method" : "Create Shipping Method"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="method-name">
              Method Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="method-name"
              placeholder="e.g. Regular Delivery, Express Delivery"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="method-code">
              Method Code <span className="text-destructive">*</span>
            </Label>
            <Input
              id="method-code"
              placeholder="e.g. REGULAR, EXPRESS, STORE_PICKUP"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              required
              className="font-mono uppercase font-bold"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="method-desc">Description (Optional)</Label>
            <Textarea
              id="method-desc"
              rows={2}
              placeholder="Brief description shown to customers..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="method-sort">Sort Order</Label>
            <Input
              id="method-sort"
              type="number"
              min="0"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="method-active" className="text-sm font-semibold">
                Active Status
              </Label>
              <p className="text-xs text-muted-foreground">
                Enable to make this method available for assignment in zones.
              </p>
            </div>
            <Switch
              id="method-active"
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
              {isLoading ? "Saving..." : method ? "Save Changes" : "Create Method"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
