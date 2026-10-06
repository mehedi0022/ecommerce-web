"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  MapPin,
  Plus,
  Trash2,
  ChevronRight,
  Globe,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getDivisions,
  getDistrictsByDivision,
  getUpazilasByDistrict,
  getUnionsByUpazila,
} from "@/utils/address.util";
import {
  useListZoneLocationsQuery,
  useCreateZoneLocationMutation,
  useDeleteZoneLocationMutation,
} from "../shippingApi";
import type { ShippingZone } from "../shipping.types";

interface ZoneLocationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  zone: ShippingZone | null;
}

export function ZoneLocationsModal({
  open,
  onOpenChange,
  zone,
}: ZoneLocationsModalProps) {
  const zoneId = zone?.id ?? 0;

  const { data, isLoading, isFetching } = useListZoneLocationsQuery(zoneId, {
    skip: !zoneId || !open,
  });

  const [createLocation, { isLoading: isCreating }] =
    useCreateZoneLocationMutation();
  const [deleteLocation, { isLoading: isDeleting }] =
    useDeleteZoneLocationMutation();

  // Cascading Selection State
  const [selectedDivisionId, setSelectedDivisionId] = useState("");
  const [selectedDistrictId, setSelectedDistrictId] = useState("");
  const [selectedUpazilaId, setSelectedUpazilaId] = useState("");
  const [selectedUnionId, setSelectedUnionId] = useState("");

  const divisions = useMemo(() => getDivisions(), []);

  const districts = useMemo(() => {
    if (!selectedDivisionId) return [];
    return getDistrictsByDivision(selectedDivisionId);
  }, [selectedDivisionId]);

  const upazilas = useMemo(() => {
    if (!selectedDistrictId) return [];
    return getUpazilasByDistrict(selectedDistrictId);
  }, [selectedDistrictId]);

  const unions = useMemo(() => {
    if (!selectedUpazilaId) return [];
    return getUnionsByUpazila(selectedUpazilaId);
  }, [selectedUpazilaId]);

  const locations = data?.data ?? [];

  const handleAddLocation = async () => {
    if (!zoneId) return;
    if (!selectedDivisionId && !selectedDistrictId) {
      toast.error("Please select at least a Division or District to map");
      return;
    }

    try {
      await createLocation({
        zoneId,
        data: {
          divisionId: selectedDivisionId || null,
          districtId: selectedDistrictId || null,
          upazilaId: selectedUpazilaId || null,
          unionId: selectedUnionId || null,
        },
      }).unwrap();

      toast.success("Location mapped to zone successfully");
      // Reset upazila/union after adding
      setSelectedUpazilaId("");
      setSelectedUnionId("");
    } catch (err: any) {
      toast.error(
        err?.data?.message ||
          "Failed to map location. It might conflict with another active zone."
      );
    }
  };

  const handleDeleteLocation = async (locationId: number) => {
    if (!zoneId) return;
    try {
      await deleteLocation({ zoneId, locationId }).unwrap();
      toast.success("Location mapping removed");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to remove location mapping");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <MapPin className="size-5" />
            </div>
            <div>
              <DialogTitle>Mapped Locations: {zone?.name}</DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Map Bangladesh Divisions, Districts, or Thanas to deterministic delivery zones.
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Add Location Card */}
          <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Map New Bangladesh Location Scope
              </h4>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {/* Division */}
              <div className="space-y-1">
                <label className="text-xs font-medium">1. Division</label>
                <select
                  value={selectedDivisionId}
                  onChange={(e) => {
                    setSelectedDivisionId(e.target.value);
                    setSelectedDistrictId("");
                    setSelectedUpazilaId("");
                    setSelectedUnionId("");
                  }}
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">-- Select Division --</option>
                  {divisions.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.bn_name})
                    </option>
                  ))}
                </select>
              </div>

              {/* District */}
              <div className="space-y-1">
                <label className="text-xs font-medium">2. District</label>
                <select
                  disabled={!selectedDivisionId}
                  value={selectedDistrictId}
                  onChange={(e) => {
                    setSelectedDistrictId(e.target.value);
                    setSelectedUpazilaId("");
                    setSelectedUnionId("");
                  }}
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                >
                  <option value="">
                    {selectedDivisionId
                      ? "All Districts in Division"
                      : "-- Select Division First --"}
                  </option>
                  {districts.map((dist) => (
                    <option key={dist.id} value={dist.id}>
                      {dist.name} ({dist.bn_name})
                    </option>
                  ))}
                </select>
              </div>

              {/* Upazila / Thana */}
              <div className="space-y-1">
                <label className="text-xs font-medium">3. Upazila / Thana (Optional)</label>
                <select
                  disabled={!selectedDistrictId}
                  value={selectedUpazilaId}
                  onChange={(e) => {
                    setSelectedUpazilaId(e.target.value);
                    setSelectedUnionId("");
                  }}
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                >
                  <option value="">
                    {selectedDistrictId
                      ? "All Upazilas / Entire District"
                      : "-- Select District First --"}
                  </option>
                  {upazilas.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.bn_name})
                    </option>
                  ))}
                </select>
              </div>

              {/* Union */}
              <div className="space-y-1">
                <label className="text-xs font-medium">4. Union / Ward (Optional)</label>
                <select
                  disabled={!selectedUpazilaId}
                  value={selectedUnionId}
                  onChange={(e) => setSelectedUnionId(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                >
                  <option value="">
                    {selectedUpazilaId
                      ? "All Unions / Entire Upazila"
                      : "-- Select Upazila First --"}
                  </option>
                  {unions.map((un) => (
                    <option key={un.id} value={un.id}>
                      {un.name} ({un.bn_name})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                size="sm"
                onClick={handleAddLocation}
                disabled={isCreating || !selectedDivisionId}
                className="gap-1.5"
              >
                {isCreating ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Plus className="size-3.5" />
                )}
                Map Selected Area
              </Button>
            </div>
          </div>

          {/* Currently Mapped Locations List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Currently Mapped Scopes ({locations.length})
              </h4>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : locations.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-8 text-center bg-card">
                <Globe className="size-8 text-muted-foreground/60" />
                <p className="mt-2 text-sm font-medium">No locations mapped yet</p>
                <p className="text-xs text-muted-foreground max-w-xs mt-0.5">
                  Orders from addresses matching mapped areas will automatically use this zone.
                </p>
              </div>
            ) : (
              <div className="divide-y rounded-xl border bg-card overflow-hidden">
                {locations.map((loc) => {
                  return (
                    <div
                      key={loc.id}
                      className="flex items-center justify-between p-3 text-xs transition-colors hover:bg-muted/30"
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <MapPin className="size-3.5 text-primary shrink-0" />
                        <span className="font-semibold text-foreground">
                          {loc.divisionName || `Division #${loc.divisionId || "All"}`}
                        </span>

                        <ChevronRight className="size-3 text-muted-foreground shrink-0" />

                        <span className="font-medium text-foreground">
                          {loc.districtName ? (
                            loc.districtName
                          ) : (
                            <Badge variant="outline" className="text-[10px] font-normal">
                              All Districts
                            </Badge>
                          )}
                        </span>

                        {loc.upazilaName && (
                          <>
                            <ChevronRight className="size-3 text-muted-foreground shrink-0" />
                            <span className="text-foreground">
                              {loc.upazilaName}
                            </span>
                          </>
                        )}

                        {loc.unionName && (
                          <>
                            <ChevronRight className="size-3 text-muted-foreground shrink-0" />
                            <span className="text-muted-foreground">
                              {loc.unionName}
                            </span>
                          </>
                        )}
                      </div>

                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => handleDeleteLocation(loc.id)}
                        disabled={isDeleting}
                        className="text-destructive hover:bg-destructive/10 shrink-0"
                        title="Remove location mapping"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
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
