"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Truck,
  Plus,
  Trash2,
  Edit2,
  Clock,
  Sparkles,
  Loader2,
  CheckCircle2,
  DollarSign,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  useListZoneMethodsQuery,
  useCreateZoneMethodMutation,
  useUpdateZoneMethodMutation,
  useDeleteZoneMethodMutation,
  useListShippingMethodsQuery,
} from "../shippingApi";
import type {
  ShippingZone,
  ShippingZoneMethod,
  CreateZoneMethodInput,
} from "../shipping.types";

interface ZoneMethodsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  zone: ShippingZone | null;
}

export function ZoneMethodsModal({
  open,
  onOpenChange,
  zone,
}: ZoneMethodsModalProps) {
  const zoneId = zone?.id ?? 0;

  const { data: zoneMethodsData, isLoading, isFetching } =
    useListZoneMethodsQuery(zoneId, {
      skip: !zoneId || !open,
    });

  const { data: globalMethodsData } = useListShippingMethodsQuery(undefined, {
    skip: !open,
  });

  const [createZoneMethod, { isLoading: isCreating }] =
    useCreateZoneMethodMutation();
  const [updateZoneMethod, { isLoading: isUpdating }] =
    useUpdateZoneMethodMutation();
  const [deleteZoneMethod, { isLoading: isDeleting }] =
    useDeleteZoneMethodMutation();

  // Form State
  const [methodId, setMethodId] = useState("");
  const [charge, setCharge] = useState("");
  const [freeShippingThreshold, setFreeShippingThreshold] = useState("");
  const [estimatedMinDays, setEstimatedMinDays] = useState("");
  const [estimatedMaxDays, setEstimatedMaxDays] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState("0");

  const [editingMethodId, setEditingMethodId] = useState<number | null>(null);

  const zoneMethods = zoneMethodsData?.data ?? [];
  const globalMethods = globalMethodsData?.data ?? [];

  const handleStartEdit = (zm: ShippingZoneMethod) => {
    setEditingMethodId(zm.id);
    setMethodId(String(zm.methodId));
    setCharge(zm.charge);
    setFreeShippingThreshold(
      zm.freeShippingThreshold ? String(zm.freeShippingThreshold) : ""
    );
    setEstimatedMinDays(
      zm.estimatedMinDays ? String(zm.estimatedMinDays) : ""
    );
    setEstimatedMaxDays(
      zm.estimatedMaxDays ? String(zm.estimatedMaxDays) : ""
    );
    setIsActive(zm.isActive);
    setSortOrder(String(zm.sortOrder ?? 0));
  };

  const handleCancelEdit = () => {
    setEditingMethodId(null);
    setMethodId("");
    setCharge("");
    setFreeShippingThreshold("");
    setEstimatedMinDays("");
    setEstimatedMaxDays("");
    setIsActive(true);
    setSortOrder("0");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!zoneId) return;

    const numCharge = Number(charge);
    if (isNaN(numCharge) || numCharge < 0) {
      toast.error("Please enter a valid shipping charge (৳)");
      return;
    }

    const minDays = estimatedMinDays ? Number(estimatedMinDays) : null;
    const maxDays = estimatedMaxDays ? Number(estimatedMaxDays) : null;

    if (minDays !== null && maxDays !== null && maxDays < minDays) {
      toast.error("Max delivery days cannot be less than min delivery days");
      return;
    }

    try {
      if (editingMethodId) {
        await updateZoneMethod({
          zoneId,
          zoneMethodId: editingMethodId,
          data: {
            charge: numCharge,
            freeShippingThreshold: freeShippingThreshold
              ? Number(freeShippingThreshold)
              : null,
            estimatedMinDays: minDays,
            estimatedMaxDays: maxDays,
            isActive,
            sortOrder: Number(sortOrder) || 0,
          },
        }).unwrap();
        toast.success("Zone delivery method updated");
        handleCancelEdit();
      } else {
        if (!methodId) {
          toast.error("Please select a shipping method to link");
          return;
        }

        await createZoneMethod({
          zoneId,
          data: {
            methodId: Number(methodId),
            charge: numCharge,
            freeShippingThreshold: freeShippingThreshold
              ? Number(freeShippingThreshold)
              : null,
            estimatedMinDays: minDays,
            estimatedMaxDays: maxDays,
            isActive,
            sortOrder: Number(sortOrder) || 0,
          },
        }).unwrap();
        toast.success("Shipping method linked to zone");
        handleCancelEdit();
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to save zone method");
    }
  };

  const handleDelete = async (zoneMethodId: number) => {
    if (!zoneId) return;
    try {
      await deleteZoneMethod({ zoneId, zoneMethodId }).unwrap();
      toast.success("Method removed from zone");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to remove method");
    }
  };

  const handleToggleStatus = async (zm: ShippingZoneMethod) => {
    try {
      await updateZoneMethod({
        zoneId,
        zoneMethodId: zm.id,
        data: { isActive: !zm.isActive },
      }).unwrap();
      toast.success(`Method ${zm.isActive ? "deactivated" : "activated"}`);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update status");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Truck className="size-5" />
            </div>
            <div>
              <DialogTitle>Delivery Rates & Methods: {zone?.name}</DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Set shipping fees, free shipping thresholds, and estimated delivery times for this zone.
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Form to Add / Edit Zone Method */}
          <form
            onSubmit={handleSubmit}
            className="rounded-xl border bg-muted/30 p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {editingMethodId ? "Edit Delivery Rate" : "Add Delivery Method to Zone"}
              </h4>
              {editingMethodId && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelEdit}
                  className="h-6 text-xs"
                >
                  Cancel Edit
                </Button>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {/* Method Selector */}
              <div className="space-y-1">
                <Label htmlFor="method-select" className="text-xs">
                  Shipping Method <span className="text-destructive">*</span>
                </Label>
                <select
                  id="method-select"
                  disabled={!!editingMethodId}
                  value={methodId}
                  onChange={(e) => setMethodId(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-60"
                  required
                >
                  <option value="">-- Select Shipping Method --</option>
                  {globalMethods.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Delivery Charge (৳) */}
              <div className="space-y-1">
                <Label htmlFor="method-charge" className="text-xs">
                  Delivery Charge (৳) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="method-charge"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g. 60 or 120"
                  value={charge}
                  onChange={(e) => setCharge(e.target.value)}
                  required
                  className="h-8 text-xs"
                />
              </div>

              {/* Free Shipping Threshold */}
              <div className="space-y-1">
                <Label htmlFor="free-threshold" className="text-xs">
                  Free Shipping Threshold (৳)
                </Label>
                <Input
                  id="free-threshold"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g. 2000 (Free if order >= this)"
                  value={freeShippingThreshold}
                  onChange={(e) => setFreeShippingThreshold(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              {/* Estimated Days */}
              <div className="space-y-1">
                <Label className="text-xs">Delivery Duration (Days)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    placeholder="Min days (e.g. 1)"
                    value={estimatedMinDays}
                    onChange={(e) => setEstimatedMinDays(e.target.value)}
                    className="h-8 text-xs"
                  />
                  <span className="text-muted-foreground text-xs">to</span>
                  <Input
                    type="number"
                    min="0"
                    placeholder="Max days (e.g. 3)"
                    value={estimatedMaxDays}
                    onChange={(e) => setEstimatedMaxDays(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <Switch
                  id="zm-active"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
                <Label htmlFor="zm-active" className="text-xs font-normal">
                  Active for checkout
                </Label>
              </div>

              <Button
                type="submit"
                size="sm"
                disabled={isCreating || isUpdating}
                className="gap-1.5"
              >
                {isCreating || isUpdating ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Plus className="size-3.5" />
                )}
                {editingMethodId ? "Update Rate" : "Add Rate to Zone"}
              </Button>
            </div>
          </form>

          {/* Linked Methods List */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Configured Rates for this Zone ({zoneMethods.length})
            </h4>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : zoneMethods.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-8 text-center bg-card">
                <Truck className="size-8 text-muted-foreground/60" />
                <p className="mt-2 text-sm font-medium">No methods configured</p>
                <p className="text-xs text-muted-foreground max-w-xs mt-0.5">
                  Customers in this zone will not see delivery options until at least one rate is added.
                </p>
              </div>
            ) : (
              <div className="divide-y rounded-xl border bg-card overflow-hidden">
                {zoneMethods.map((zm) => {
                  return (
                    <div
                      key={zm.id}
                      className="flex items-center justify-between p-3.5 text-xs transition-colors hover:bg-muted/30"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-foreground">
                            {zm.method?.name || `Method #${zm.methodId}`}
                          </span>
                          <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                            {zm.method?.code}
                          </span>
                          {zm.isActive ? (
                            <Badge variant="default" className="bg-emerald-600 text-[10px] px-1.5 py-0">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              Inactive
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-muted-foreground text-xs flex-wrap">
                          <span className="font-bold text-foreground">
                            ৳{zm.charge}
                          </span>

                          {zm.freeShippingThreshold && (
                            <span className="flex items-center gap-1 text-emerald-600 font-medium">
                              <Sparkles className="size-3" />
                              Free above ৳{zm.freeShippingThreshold}
                            </span>
                          )}

                          {(zm.estimatedMinDays !== null ||
                            zm.estimatedMaxDays !== null) && (
                            <span className="flex items-center gap-1">
                              <Clock className="size-3" />
                              {zm.estimatedMinDays}-{zm.estimatedMaxDays} Days
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          onClick={() => handleStartEdit(zm)}
                          title="Edit rate"
                        >
                          <Edit2 className="size-3.5" />
                        </Button>

                        <Button
                          size="icon-sm"
                          variant="ghost"
                          onClick={() => handleDelete(zm.id)}
                          disabled={isDeleting}
                          className="text-destructive hover:bg-destructive/10"
                          title="Remove method"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
