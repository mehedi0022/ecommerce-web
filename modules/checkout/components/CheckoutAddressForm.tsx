"use client";

import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getDivisions,
  getDistrictsByDivision,
  getUpazilasByDistrict,
  getUnionsByUpazila,
  findDivisionByName,
  findDistrictByName,
  findUpazilaByName,
} from "@/utils/address.util";
import type { CheckoutAddress } from "../checkout.types";

interface CheckoutAddressFormProps {
  address: CheckoutAddress;
  onChange: (address: CheckoutAddress) => void;
  showContactFields?: boolean;
}

export function CheckoutAddressForm({
  address,
  onChange,
  showContactFields = true,
}: CheckoutAddressFormProps) {
  const divisions = useMemo(() => getDivisions(), []);

  // Resolve active Division ID (either already stored as address.divisionId or inferred from name)
  const currentDivisionId = useMemo(() => {
    if (address.divisionId) return String(address.divisionId);
    const found = findDivisionByName(address.division);
    return found ? String(found.id) : "";
  }, [address.divisionId, address.division]);

  // Available districts based on division
  const availableDistricts = useMemo(() => {
    if (!currentDivisionId) return [];
    return getDistrictsByDivision(currentDivisionId);
  }, [currentDivisionId]);

  // Resolve active District ID
  const currentDistrictId = useMemo(() => {
    if (address.districtId) return String(address.districtId);
    const found = findDistrictByName(address.district, currentDivisionId || undefined);
    return found ? String(found.id) : "";
  }, [address.districtId, address.district, currentDivisionId]);

  // Available upazilas based on district
  const availableUpazilas = useMemo(() => {
    if (!currentDistrictId) return [];
    return getUpazilasByDistrict(currentDistrictId);
  }, [currentDistrictId]);

  // Resolve active Upazila ID
  const currentUpazilaId = useMemo(() => {
    if (address.upazilaId) return String(address.upazilaId);
    const found = findUpazilaByName(address.upazila, currentDistrictId || undefined);
    return found ? String(found.id) : "";
  }, [address.upazilaId, address.upazila, currentDistrictId]);

  // Available unions based on upazila
  const availableUnions = useMemo(() => {
    if (!currentUpazilaId) return [];
    return getUnionsByUpazila(currentUpazilaId);
  }, [currentUpazilaId]);

  // Resolve active Union ID
  const currentUnionId = useMemo(() => {
    if (address.unionId) return String(address.unionId);
    if (!address.area || !currentUpazilaId) return "";
    const matched = availableUnions.find(
      (u) => u.name.toLowerCase() === (address.area || "").toLowerCase()
    );
    return matched ? String(matched.id) : "";
  }, [address.unionId, address.area, currentUpazilaId, availableUnions]);

  // Handle field change helper
  const updateAddress = (updates: Partial<CheckoutAddress>) => {
    onChange({
      ...address,
      ...updates,
    });
  };

  // Division selection handler
  const handleDivisionChange = (newDivisionId: string) => {
    if (!newDivisionId) {
      updateAddress({
        divisionId: "",
        division: "",
        districtId: "",
        district: "",
        upazilaId: "",
        upazila: "",
        thana: "",
        unionId: "",
        area: "",
      });
      return;
    }

    const matchedDiv = divisions.find((d) => String(d.id) === newDivisionId);
    const validDistricts = getDistrictsByDivision(newDivisionId);
    const isDistrictValid = validDistricts.some(
      (dist) => String(dist.id) === currentDistrictId
    );

    updateAddress({
      divisionId: newDivisionId,
      division: matchedDiv?.name || "",
      districtId: isDistrictValid ? currentDistrictId : "",
      district: isDistrictValid ? address.district : "",
      upazilaId: isDistrictValid ? currentUpazilaId : "",
      upazila: isDistrictValid ? address.upazila : "",
      thana: isDistrictValid ? address.thana : "",
      unionId: isDistrictValid ? currentUnionId : "",
      area: isDistrictValid ? address.area : "",
    });
  };

  // District selection handler
  const handleDistrictChange = (newDistrictId: string) => {
    if (!newDistrictId) {
      updateAddress({
        districtId: "",
        district: "",
        upazilaId: "",
        upazila: "",
        thana: "",
        unionId: "",
        area: "",
      });
      return;
    }

    const matchedDist = availableDistricts.find((d) => String(d.id) === newDistrictId);
    const matchedDiv = matchedDist
      ? divisions.find((div) => String(div.id) === String(matchedDist.division_id))
      : null;

    updateAddress({
      districtId: newDistrictId,
      district: matchedDist?.name || "",
      divisionId: matchedDiv ? String(matchedDiv.id) : currentDivisionId,
      division: matchedDiv ? matchedDiv.name : address.division,
      upazilaId: "",
      upazila: "",
      thana: "",
      unionId: "",
      area: "",
    });
  };

  // Upazila selection handler
  const handleUpazilaChange = (newUpazilaId: string) => {
    if (!newUpazilaId) {
      updateAddress({
        upazilaId: "",
        upazila: "",
        thana: "",
        unionId: "",
        area: "",
      });
      return;
    }

    const matchedUpz = availableUpazilas.find((u) => String(u.id) === newUpazilaId);

    updateAddress({
      upazilaId: newUpazilaId,
      upazila: matchedUpz?.name || "",
      thana: matchedUpz?.name || "",
      unionId: "",
      area: "",
    });
  };

  // Union / Area selection handler
  const handleUnionChange = (newUnionId: string) => {
    if (!newUnionId) {
      updateAddress({
        unionId: "",
        area: "",
      });
      return;
    }

    const matchedUnion = availableUnions.find((u) => String(u.id) === newUnionId);

    updateAddress({
      unionId: newUnionId,
      area: matchedUnion?.name || "",
    });
  };

  return (
    <div className="space-y-4">
      {/* ── Recipient Name & Phone ────────────────────────────────────────── */}
      {showContactFields && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="addr-name" className="text-xs font-semibold">
              Recipient Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="addr-name"
              placeholder="e.g. Tanvir Ahmed"
              value={address.fullName}
              onChange={(e) => updateAddress({ fullName: e.target.value })}
              className="h-10 text-sm"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="addr-phone" className="text-xs font-semibold">
              Delivery Phone Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="addr-phone"
              type="tel"
              placeholder="e.g. 01712345678"
              value={address.phone}
              onChange={(e) => updateAddress({ phone: e.target.value })}
              className="h-10 text-sm"
              required
            />
          </div>
        </div>
      )}

      {/* ── Division & District (Cascading Canonical IDs) ─────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="addr-division" className="text-xs font-semibold">
            Division <span className="text-destructive">*</span>
          </Label>
          <select
            id="addr-division"
            value={currentDivisionId}
            onChange={(e) => handleDivisionChange(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            required
          >
            <option value="">Select Division</option>
            {divisions.map((div) => (
              <option key={div.id} value={div.id}>
                {div.name} ({div.bn_name})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="addr-district" className="text-xs font-semibold">
            District / City <span className="text-destructive">*</span>
          </Label>
          <select
            id="addr-district"
            value={currentDistrictId}
            onChange={(e) => handleDistrictChange(e.target.value)}
            disabled={!currentDivisionId || availableDistricts.length === 0}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            required
          >
            <option value="">
              {currentDivisionId ? "Select District" : "Select Division first"}
            </option>
            {availableDistricts.map((dist) => (
              <option key={dist.id} value={dist.id}>
                {dist.name} ({dist.bn_name})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Upazila / Thana & Union / Area (Cascading Canonical IDs) ──────── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="addr-upazila" className="text-xs font-semibold">
            Upazila / Thana <span className="text-destructive">*</span>
          </Label>
          <select
            id="addr-upazila"
            value={currentUpazilaId}
            onChange={(e) => handleUpazilaChange(e.target.value)}
            disabled={!currentDistrictId || availableUpazilas.length === 0}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            required
          >
            <option value="">
              {currentDistrictId ? "Select Upazila / Thana" : "Select District first"}
            </option>
            {availableUpazilas.map((upz) => (
              <option key={upz.id} value={upz.id}>
                {upz.name} ({upz.bn_name})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="addr-union" className="text-xs font-semibold">
            Union / Area{" "}
            <span className="text-xs font-normal text-muted-foreground">
              (Optional)
            </span>
          </Label>
          {availableUnions.length > 0 ? (
            <select
              id="addr-union"
              value={currentUnionId}
              onChange={(e) => handleUnionChange(e.target.value)}
              disabled={!currentUpazilaId}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select Union / Area</option>
              {availableUnions.map((uni) => (
                <option key={uni.id} value={uni.id}>
                  {uni.name} ({uni.bn_name})
                </option>
              ))}
            </select>
          ) : (
            <Input
              id="addr-union"
              placeholder={currentUpazilaId ? "Enter local area / ward" : "Select Upazila first"}
              value={address.area || ""}
              disabled={!currentUpazilaId}
              onChange={(e) => updateAddress({ area: e.target.value })}
              className="h-10 text-sm"
            />
          )}
        </div>
      </div>

      {/* ── Street Address Line 1 ────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <Label htmlFor="addr-line1" className="text-xs font-semibold">
          Street Address, House & Road <span className="text-destructive">*</span>
        </Label>
        <Input
          id="addr-line1"
          placeholder="e.g. House 42, Road 11, Block D, Banani"
          value={address.addressLine1}
          onChange={(e) => updateAddress({ addressLine1: e.target.value })}
          className="h-10 text-sm"
          required
        />
      </div>

      {/* ── Street Address Line 2 & Postal Code ───────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="addr-line2" className="text-xs font-semibold">
            Apartment, Suite, Landmark{" "}
            <span className="text-xs font-normal text-muted-foreground">
              (Optional)
            </span>
          </Label>
          <Input
            id="addr-line2"
            placeholder="e.g. 4th floor, Flat 4B, near Jamuna Future Park"
            value={address.addressLine2 || ""}
            onChange={(e) => updateAddress({ addressLine2: e.target.value })}
            className="h-10 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="addr-postal" className="text-xs font-semibold">
            Postal / Zip Code{" "}
            <span className="text-xs font-normal text-muted-foreground">
              (Optional)
            </span>
          </Label>
          <Input
            id="addr-postal"
            placeholder="e.g. 1213"
            value={address.postalCode || ""}
            onChange={(e) => updateAddress({ postalCode: e.target.value })}
            className="h-10 text-sm"
          />
        </div>
      </div>
    </div>
  );
}
