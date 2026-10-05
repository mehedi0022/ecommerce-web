"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CheckoutAddress } from "../checkout.types";

const BANGLADESH_DISTRICTS = [
  "Dhaka",
  "Chattogram",
  "Gazipur",
  "Narayanganj",
  "Sylhet",
  "Rajshahi",
  "Khulna",
  "Barishal",
  "Rangpur",
  "Cumilla",
  "Bogura",
  "Cox's Bazar",
  "Mymensingh",
  "Tangail",
  "Jessore",
  "Dinajpur",
  "Narsingdi",
  "Brahmanbaria",
  "Feni",
  "Noakhali",
];

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
  const handleChange = (field: keyof CheckoutAddress, value: string) => {
    onChange({
      ...address,
      [field]: value,
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
              onChange={(e) => handleChange("fullName", e.target.value)}
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
              onChange={(e) => handleChange("phone", e.target.value)}
              className="h-10 text-sm"
              required
            />
          </div>
        </div>
      )}

      {/* ── Street Address Line 1 ────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <Label htmlFor="addr-line1" className="text-xs font-semibold">
          Street Address, House & Road <span className="text-destructive">*</span>
        </Label>
        <Input
          id="addr-line1"
          placeholder="e.g. House 42, Road 11, Block D, Banani"
          value={address.addressLine1}
          onChange={(e) => handleChange("addressLine1", e.target.value)}
          className="h-10 text-sm"
          required
        />
      </div>

      {/* ── Street Address Line 2 ────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <Label htmlFor="addr-line2" className="text-xs font-semibold">
          Apartment, Suite, Unit, Landmark{" "}
          <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
        </Label>
        <Input
          id="addr-line2"
          placeholder="e.g. 4th floor, Flat 4B, near Jamuna Future Park"
          value={address.addressLine2 || ""}
          onChange={(e) => handleChange("addressLine2", e.target.value)}
          className="h-10 text-sm"
        />
      </div>

      {/* ── District & Postal Code ───────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="addr-district" className="text-xs font-semibold">
            City / District <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <input
              id="addr-district"
              list="districts-list"
              placeholder="Select or type district (e.g. Dhaka)"
              value={address.district}
              onChange={(e) => handleChange("district", e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            />
            <datalist id="districts-list">
              {BANGLADESH_DISTRICTS.map((dist) => (
                <option key={dist} value={dist} />
              ))}
            </datalist>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="addr-postal" className="text-xs font-semibold">
            Postal / Zip Code{" "}
            <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
          </Label>
          <Input
            id="addr-postal"
            placeholder="e.g. 1213"
            value={address.postalCode || ""}
            onChange={(e) => handleChange("postalCode", e.target.value)}
            className="h-10 text-sm"
          />
        </div>
      </div>
    </div>
  );
}

