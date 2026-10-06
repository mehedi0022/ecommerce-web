"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  MapPin,
  Truck,
  Plus,
  Edit2,
  Trash2,
  Globe,
  Settings2,
  RefreshCw,
  Layers,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useListShippingZonesQuery,
  useCreateShippingZoneMutation,
  useUpdateShippingZoneMutation,
  useDeleteShippingZoneMutation,
  useListShippingMethodsQuery,
  useCreateShippingMethodMutation,
  useUpdateShippingMethodMutation,
  useDeleteShippingMethodMutation,
} from "../shippingApi";
import type {
  ShippingZone,
  ShippingMethod,
  CreateZoneInput,
  CreateMethodInput,
} from "../shipping.types";
import { ZoneDialog } from "./ZoneDialog";
import { ZoneLocationsModal } from "./ZoneLocationsModal";
import { ZoneMethodsModal } from "./ZoneMethodsModal";
import { MethodDialog } from "./MethodDialog";

export function ShippingManagementPage() {
  const [activeTab, setActiveTab] = useState<"zones" | "methods">("zones");

  // Queries
  const {
    data: zonesData,
    isLoading: isZonesLoading,
    isFetching: isZonesFetching,
    refetch: refetchZones,
  } = useListShippingZonesQuery();

  const {
    data: methodsData,
    isLoading: isMethodsLoading,
    isFetching: isMethodsFetching,
    refetch: refetchMethods,
  } = useListShippingMethodsQuery();

  // Mutations
  const [createZone, { isLoading: isCreatingZone }] =
    useCreateShippingZoneMutation();
  const [updateZone, { isLoading: isUpdatingZone }] =
    useUpdateShippingZoneMutation();
  const [deleteZone, { isLoading: isDeletingZone }] =
    useDeleteShippingZoneMutation();

  const [createMethod, { isLoading: isCreatingMethod }] =
    useCreateShippingMethodMutation();
  const [updateMethod, { isLoading: isUpdatingMethod }] =
    useUpdateShippingMethodMutation();
  const [deleteMethod, { isLoading: isDeletingMethod }] =
    useDeleteShippingMethodMutation();

  // Modal States
  const [isZoneDialogOpen, setIsZoneDialogOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<ShippingZone | null>(null);
  const [deletingZone, setDeletingZone] = useState<ShippingZone | null>(null);

  const [managingLocationsZone, setManagingLocationsZone] =
    useState<ShippingZone | null>(null);
  const [managingMethodsZone, setManagingMethodsZone] =
    useState<ShippingZone | null>(null);

  const [isMethodDialogOpen, setIsMethodDialogOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<ShippingMethod | null>(
    null
  );
  const [deletingMethod, setDeletingMethod] = useState<ShippingMethod | null>(
    null
  );

  const zones = zonesData?.data ?? [];
  const methods = methodsData?.data ?? [];

  const activeZonesCount = zones.filter((z) => z.isActive).length;
  const activeMethodsCount = methods.filter((m) => m.isActive).length;

  // Zone Handlers
  const handleOpenCreateZone = () => {
    setSelectedZone(null);
    setIsZoneDialogOpen(true);
  };

  const handleOpenEditZone = (zone: ShippingZone) => {
    setSelectedZone(zone);
    setIsZoneDialogOpen(true);
  };

  const handleSaveZone = async (formData: CreateZoneInput) => {
    try {
      if (selectedZone) {
        await updateZone({ zoneId: selectedZone.id, data: formData }).unwrap();
        toast.success("Shipping zone updated successfully");
      } else {
        await createZone(formData).unwrap();
        toast.success("Shipping zone created successfully");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to save shipping zone");
      throw err;
    }
  };

  const handleToggleZoneStatus = async (zone: ShippingZone) => {
    try {
      await updateZone({
        zoneId: zone.id,
        data: { isActive: !zone.isActive },
      }).unwrap();
      toast.success(
        `Zone ${zone.isActive ? "deactivated" : "activated"} successfully`
      );
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update zone status");
    }
  };

  const handleDeleteZone = async () => {
    if (!deletingZone) return;
    try {
      await deleteZone(deletingZone.id).unwrap();
      toast.success("Shipping zone deleted successfully");
      setDeletingZone(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete shipping zone");
    }
  };

  // Method Handlers
  const handleOpenCreateMethod = () => {
    setSelectedMethod(null);
    setIsMethodDialogOpen(true);
  };

  const handleOpenEditMethod = (method: ShippingMethod) => {
    setSelectedMethod(method);
    setIsMethodDialogOpen(true);
  };

  const handleSaveMethod = async (formData: CreateMethodInput) => {
    try {
      if (selectedMethod) {
        await updateMethod({
          methodId: selectedMethod.id,
          data: formData,
        }).unwrap();
        toast.success("Shipping method updated successfully");
      } else {
        await createMethod(formData).unwrap();
        toast.success("Shipping method created successfully");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to save shipping method");
      throw err;
    }
  };

  const handleToggleMethodStatus = async (method: ShippingMethod) => {
    try {
      await updateMethod({
        methodId: method.id,
        data: { isActive: !method.isActive },
      }).unwrap();
      toast.success(
        `Method ${method.isActive ? "deactivated" : "activated"} successfully`
      );
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update method status");
    }
  };

  const handleDeleteMethod = async () => {
    if (!deletingMethod) return;
    try {
      await deleteMethod(deletingMethod.id).unwrap();
      toast.success("Shipping method deleted successfully");
      setDeletingMethod(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete shipping method");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Shipping & Zone Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Configure regional delivery zones across Bangladesh, map districts, and manage delivery charges.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "zones" ? (
            <Button onClick={handleOpenCreateZone} className="gap-2 shrink-0">
              <Plus className="size-4" />
              New Shipping Zone
            </Button>
          ) : (
            <Button onClick={handleOpenCreateMethod} className="gap-2 shrink-0">
              <Plus className="size-4" />
              New Shipping Method
            </Button>
          )}
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="shadow-none">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <MapPin className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Zones</p>
              <p className="text-xl font-bold">{zones.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Active Zones</p>
              <p className="text-xl font-bold">{activeZonesCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600">
              <Truck className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Delivery Methods</p>
              <p className="text-xl font-bold">{methods.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-600">
              <Layers className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Active Methods</p>
              <p className="text-xl font-bold">{activeMethodsCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
        <div className="inline-flex rounded-xl border bg-muted/40 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("zones")}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all",
              activeTab === "zones"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <MapPin className="size-3.5 text-primary" />
            Shipping Zones
            <span
              className={cn(
                "ml-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold",
                activeTab === "zones"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {zones.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("methods")}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all",
              activeTab === "methods"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Truck className="size-3.5 text-primary" />
            Global Shipping Methods
            <span
              className={cn(
                "ml-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold",
                activeTab === "methods"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {methods.length}
            </span>
          </button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (activeTab === "zones") refetchZones();
            else refetchMethods();
          }}
          disabled={isZonesFetching || isMethodsFetching}
          className="h-9 gap-1.5 text-xs"
        >
          <RefreshCw
            className={`size-3.5 ${
              isZonesFetching || isMethodsFetching ? "animate-spin" : ""
            }`}
          />
          Refresh
        </Button>
      </div>

      {/* ── TAB 1: SHIPPING ZONES ────────────────────────────────────── */}
      {activeTab === "zones" && (
        <div className="space-y-6">
          {isZonesLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-56 animate-pulse rounded-2xl border bg-muted/40"
                />
              ))}
            </div>
          ) : zones.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center bg-card">
              <div className="rounded-full bg-primary/10 p-4 text-primary">
                <Globe className="size-8" />
              </div>
              <h3 className="mt-4 text-base font-semibold">
                No shipping zones created yet
              </h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Define geographic areas (such as Inside Dhaka and Outside Dhaka) and map districts to calculate delivery charges during checkout.
              </p>
              <Button onClick={handleOpenCreateZone} className="mt-6 gap-2">
                <Plus className="size-4" />
                Create First Zone
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {zones.map((zone) => (
                <Card
                  key={zone.id}
                  className="overflow-hidden border bg-card shadow-none transition-all hover:border-primary/40 flex flex-col justify-between"
                >
                  <div>
                    {/* Card Header */}
                    <div className="flex items-center justify-between border-b px-4 py-3 bg-muted/20">
                      <div className="flex items-center gap-2">
                        <MapPin className="size-4 text-primary" />
                        <span className="font-semibold text-sm">
                          {zone.name}
                        </span>
                      </div>
                      {zone.isActive ? (
                        <Badge
                          variant="default"
                          className="bg-emerald-600 text-[10px] px-1.5 py-0"
                        >
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          Inactive
                        </Badge>
                      )}
                    </div>

                    <CardContent className="p-4 space-y-4">
                      {zone.description ? (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {zone.description}
                        </p>
                      ) : (
                        <p className="text-xs italic text-muted-foreground/60">
                          No description provided
                        </p>
                      )}

                      <div className="flex items-center justify-between text-xs text-muted-foreground border-y py-2">
                        <span>Display Order:</span>
                        <span className="font-mono font-medium text-foreground">
                          {zone.sortOrder ?? 0}
                        </span>
                      </div>

                      {/* Management Buttons */}
                      <div className="space-y-2 pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full justify-between h-9 text-xs font-medium"
                          onClick={() => setManagingLocationsZone(zone)}
                        >
                          <span className="flex items-center gap-2">
                            <Globe className="size-3.5 text-primary" />
                            Manage Mapped Areas (BD)
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            Configure &rarr;
                          </span>
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full justify-between h-9 text-xs font-medium"
                          onClick={() => setManagingMethodsZone(zone)}
                        >
                          <span className="flex items-center gap-2">
                            <Truck className="size-3.5 text-primary" />
                            Delivery Methods & Charges
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            Configure &rarr;
                          </span>
                        </Button>
                      </div>
                    </CardContent>
                  </div>

                  {/* Footer Actions */}
                  <div className="flex items-center justify-between border-t px-4 py-3 bg-muted/10 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs flex-1 gap-1"
                      onClick={() => handleOpenEditZone(zone)}
                    >
                      <Edit2 className="size-3" />
                      Edit
                    </Button>

                    <Button
                      size="sm"
                      variant={zone.isActive ? "ghost" : "secondary"}
                      className="h-8 text-xs flex-1"
                      onClick={() => handleToggleZoneStatus(zone)}
                    >
                      {zone.isActive ? "Deactivate" : "Activate"}
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2 text-destructive hover:bg-destructive/10"
                      onClick={() => setDeletingZone(zone)}
                      title="Delete Zone"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: GLOBAL SHIPPING METHODS ──────────────────────────── */}
      {activeTab === "methods" && (
        <div className="space-y-6">
          {isMethodsLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-44 animate-pulse rounded-2xl border bg-muted/40"
                />
              ))}
            </div>
          ) : methods.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center bg-card">
              <div className="rounded-full bg-primary/10 p-4 text-primary">
                <Truck className="size-8" />
              </div>
              <h3 className="mt-4 text-base font-semibold">
                No shipping methods created
              </h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Create universal shipping methods (such as Regular Delivery, Express, or Next Day) that can then be assigned to zones with specific charges.
              </p>
              <Button onClick={handleOpenCreateMethod} className="mt-6 gap-2">
                <Plus className="size-4" />
                Create First Method
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {methods.map((method) => (
                <Card
                  key={method.id}
                  className="overflow-hidden border bg-card shadow-none transition-all hover:border-primary/40 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between border-b px-4 py-3 bg-muted/20">
                      <div className="flex items-center gap-2">
                        <Truck className="size-4 text-primary" />
                        <span className="font-semibold text-sm">
                          {method.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-bold">
                          {method.code}
                        </span>
                        {method.isActive ? (
                          <Badge
                            variant="default"
                            className="bg-emerald-600 text-[10px] px-1.5 py-0"
                          >
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            Inactive
                          </Badge>
                        )}
                      </div>
                    </div>

                    <CardContent className="p-4 space-y-3">
                      {method.description ? (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {method.description}
                        </p>
                      ) : (
                        <p className="text-xs italic text-muted-foreground/60">
                          No description
                        </p>
                      )}

                      <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-2">
                        <span>Display Order:</span>
                        <span className="font-mono font-medium text-foreground">
                          {method.sortOrder ?? 0}
                        </span>
                      </div>
                    </CardContent>
                  </div>

                  <div className="flex items-center justify-between border-t px-4 py-3 bg-muted/10 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs flex-1 gap-1"
                      onClick={() => handleOpenEditMethod(method)}
                    >
                      <Edit2 className="size-3" />
                      Edit
                    </Button>

                    <Button
                      size="sm"
                      variant={method.isActive ? "ghost" : "secondary"}
                      className="h-8 text-xs flex-1"
                      onClick={() => handleToggleMethodStatus(method)}
                    >
                      {method.isActive ? "Deactivate" : "Activate"}
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2 text-destructive hover:bg-destructive/10"
                      onClick={() => setDeletingMethod(method)}
                      title="Delete Method"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Dialogs & Modals ────────────────────────────────────────── */}

      {/* Zone Create / Edit Dialog */}
      <ZoneDialog
        open={isZoneDialogOpen}
        onOpenChange={setIsZoneDialogOpen}
        zone={selectedZone}
        onSave={handleSaveZone}
        isLoading={isCreatingZone || isUpdatingZone}
      />

      {/* Zone Locations Modal */}
      <ZoneLocationsModal
        open={!!managingLocationsZone}
        onOpenChange={(open) => !open && setManagingLocationsZone(null)}
        zone={managingLocationsZone}
      />

      {/* Zone Methods Modal */}
      <ZoneMethodsModal
        open={!!managingMethodsZone}
        onOpenChange={(open) => !open && setManagingMethodsZone(null)}
        zone={managingMethodsZone}
      />

      {/* Method Create / Edit Dialog */}
      <MethodDialog
        open={isMethodDialogOpen}
        onOpenChange={setIsOpen => setIsMethodDialogOpen(setIsOpen)}
        method={selectedMethod}
        onSave={handleSaveMethod}
        isLoading={isCreatingMethod || isUpdatingMethod}
      />

      {/* Delete Zone Alert */}
      <AlertDialog
        open={!!deletingZone}
        onOpenChange={(open) => !open && setDeletingZone(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Shipping Zone?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete zone{" "}
              <strong className="text-foreground">
                "{deletingZone?.name}"
              </strong>
              ? All mapped location scopes and linked delivery rates for this zone will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteZone}
              disabled={isDeletingZone}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletingZone ? "Deleting..." : "Delete Zone"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Method Alert */}
      <AlertDialog
        open={!!deletingMethod}
        onOpenChange={(open) => !open && setDeletingMethod(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Shipping Method?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete method{" "}
              <strong className="text-foreground">
                "{deletingMethod?.name}" ({deletingMethod?.code})
              </strong>
              ? If it is currently assigned to any active zones, orders in those zones may be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMethod}
              disabled={isDeletingMethod}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletingMethod ? "Deleting..." : "Delete Method"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
