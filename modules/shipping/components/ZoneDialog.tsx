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
import type { ShippingZone, CreateZoneInput } from "../shipping.types";

interface ZoneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  zone?: ShippingZone | null;
  onSave: (data: CreateZoneInput) => Promise<void>;
  isLoading?: boolean;
}

export function ZoneDialog({
  open,
  onOpenChange,
  zone,
  onSave,
  isLoading,
}: ZoneDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (zone) {
      setName(zone.name);
      setDescription(zone.description || "");
      setSortOrder(String(zone.sortOrder ?? 0));
      setIsActive(zone.isActive);
    } else {
      setName("");
      setDescription("");
      setSortOrder("0");
      setIsActive(true);
    }
  }, [zone, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Zone name is required");
      return;
    }

    const payload: CreateZoneInput = {
      name: name.trim(),
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
            {zone ? "Edit Shipping Zone" : "Create Shipping Zone"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="zone-name">
              Zone Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="zone-name"
              placeholder="e.g. Inside Dhaka, Outside Dhaka, Sub-Dhaka"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="zone-desc">Description (Optional)</Label>
            <Textarea
              id="zone-desc"
              rows={2}
              placeholder="Coverage summary or internal notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sort-order">Sort Order</Label>
            <Input
              id="sort-order"
              type="number"
              min="0"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="zone-active" className="text-sm font-semibold">
                Active Status
              </Label>
              <p className="text-xs text-muted-foreground">
                Enable to apply delivery rates for mapped locations.
              </p>
            </div>
            <Switch
              id="zone-active"
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
              {isLoading ? "Saving..." : zone ? "Save Changes" : "Create Zone"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
