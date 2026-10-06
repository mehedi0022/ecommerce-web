"use client";

import React, { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  useCreatePaymentMethodMutation,
  useUpdatePaymentMethodMutation,
} from "../../paymentApi";
import type { PaymentMethodConfig, PaymentMethodType, PaymentAccountType } from "../../types";

interface PaymentMethodModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  method?: PaymentMethodConfig | null;
}

export function PaymentMethodModal({
  open,
  onOpenChange,
  method,
}: PaymentMethodModalProps) {
  const isEditing = Boolean(method);

  const [createMethod, { isLoading: isCreating }] = useCreatePaymentMethodMutation();
  const [updateMethod, { isLoading: isUpdating }] = useUpdatePaymentMethodMutation();

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [type, setType] = useState<PaymentMethodType>("MANUAL_MFS");
  const [accountType, setAccountType] = useState<PaymentAccountType>("PERSONAL");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [branchName, setBranchName] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [instructions, setInstructions] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [chargePercentage, setChargePercentage] = useState("0");
  const [chargeFlat, setChargeFlat] = useState("0");
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState("0");

  useEffect(() => {
    if (method) {
      setName(method.name);
      setCode(method.code);
      setType(method.type);
      setAccountType(method.accountType);
      setAccountNumber(method.accountNumber || "");
      setBankName(method.bankName || "");
      setBranchName(method.branchName || "");
      setRoutingNumber(method.routingNumber || "");
      setInstructions(method.instructions || "");
      setQrCodeUrl(method.qrCodeUrl || "");
      setChargePercentage(String(method.chargePercentage || "0"));
      setChargeFlat(String(method.chargeFlat || "0"));
      setIsActive(method.isActive);
      setSortOrder(String(method.sortOrder || "0"));
    } else {
      setName("");
      setCode("");
      setType("MANUAL_MFS");
      setAccountType("PERSONAL");
      setAccountNumber("");
      setBankName("");
      setBranchName("");
      setRoutingNumber("");
      setInstructions("");
      setQrCodeUrl("");
      setChargePercentage("0");
      setChargeFlat("0");
      setIsActive(true);
      setSortOrder("0");
    }
  }, [method, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter a method name");
      return;
    }

    if (!isEditing && !code.trim()) {
      toast.error("Please enter a unique code");
      return;
    }

    try {
      if (isEditing && method) {
        await updateMethod({
          id: method.id,
          body: {
            name: name.trim(),
            type,
            accountType,
            accountNumber: accountNumber.trim() || null,
            bankName: bankName.trim() || null,
            branchName: branchName.trim() || null,
            routingNumber: routingNumber.trim() || null,
            instructions: instructions.trim() || null,
            qrCodeUrl: qrCodeUrl.trim() || null,
            chargePercentage: Number(chargePercentage) || 0,
            chargeFlat: Number(chargeFlat) || 0,
            isActive,
            sortOrder: Number(sortOrder) || 0,
          },
        }).unwrap();
        toast.success("Payment method updated successfully");
      } else {
        await createMethod({
          name: name.trim(),
          code: code.trim().toLowerCase().replace(/\s+/g, "_"),
          type,
          accountType,
          accountNumber: accountNumber.trim() || null,
          bankName: bankName.trim() || null,
          branchName: branchName.trim() || null,
          routingNumber: routingNumber.trim() || null,
          instructions: instructions.trim() || null,
          qrCodeUrl: qrCodeUrl.trim() || null,
          chargePercentage: Number(chargePercentage) || 0,
          chargeFlat: Number(chargeFlat) || 0,
          isActive,
          sortOrder: Number(sortOrder) || 0,
        }).unwrap();
        toast.success("Payment method created successfully");
      }
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to save payment method");
    }
  };

  const isSubmitting = isCreating || isUpdating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? `Edit ${method?.name}` : "Add Payment Method"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Method Name *</Label>
              <Input
                placeholder="e.g. bKash Personal"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label>Method Code *</Label>
              <Input
                placeholder="e.g. bkash_personal_2"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={isEditing}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Channel Type</Label>
              <Select
                value={type}
                onValueChange={(val: any) => setType(val)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MANUAL_MFS">Manual MFS (bKash/Nagad/Rocket)</SelectItem>
                  <SelectItem value="MANUAL_BANK">Manual Bank Transfer</SelectItem>
                  <SelectItem value="COD">Cash on Delivery (COD)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {type !== "COD" && (
              <div className="space-y-1.5">
                <Label>Account Type</Label>
                <Select
                  value={accountType}
                  onValueChange={(val: any) => setAccountType(val)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERSONAL">Personal (Send Money)</SelectItem>
                    <SelectItem value="AGENT">Agent (Cash Out)</SelectItem>
                    <SelectItem value="MERCHANT">Merchant Account</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {type !== "COD" && (
            <div className="space-y-1.5">
              <Label>
                {type === "MANUAL_BANK" ? "Bank Account Number" : "Mobile Wallet Number"}
              </Label>
              <Input
                placeholder={type === "MANUAL_BANK" ? "1234567890123" : "017XXXXXXXX"}
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
              />
            </div>
          )}

          {type === "MANUAL_BANK" && (
            <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
              <div className="space-y-1.5">
                <Label>Bank Name</Label>
                <Input
                  placeholder="e.g. City Bank Limited"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Branch Name</Label>
                  <Input
                    placeholder="e.g. Gulshan Branch, Dhaka"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Routing Number</Label>
                  <Input
                    placeholder="e.g. 225271829"
                    value={routingNumber}
                    onChange={(e) => setRoutingNumber(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Instructions for Customer (Bengali / English)</Label>
            <Textarea
              rows={4}
              placeholder="পেমেন্ট করার নিয়মাবলী বিস্তারিত লিখুন..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
            <p className="text-[11px] text-muted-foreground">
              এই নির্দেশনাটি চেকআউট পেজে কাস্টমার যখন এই মেথড সিলেক্ট করবে তখন প্রদর্শিত হবে।
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>QR Code Image URL (Optional)</Label>
              <Input
                placeholder="https://..."
                value={qrCodeUrl}
                onChange={(e) => setQrCodeUrl(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Display Order (Priority)</Label>
              <Input
                type="number"
                min="0"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              />
            </div>
          </div>

          {/* Additional Gateway / Transaction Fee */}
          <div className="rounded-xl border bg-muted/20 p-3.5 space-y-3">
            <div>
              <span className="block text-xs font-semibold text-foreground">
                Payment Gateway / Transaction Charge (Optional)
              </span>
              <span className="block text-[11px] text-muted-foreground">
                কাস্টমারের কাছ থেকে অতিরিক্ত কোনো ট্রানজেকশন ফি (যেমন: ১.৮৫% ক্যাশআউট বা ২% গেটওয়ে চার্জ) নিতে চাইলে এখানে সেট করুন।
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Charge Percentage (%)</Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g. 1.85"
                    value={chargePercentage}
                    onChange={(e) => setChargePercentage(e.target.value)}
                    className="pr-7 text-xs"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-semibold">
                    %
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Flat Fee (৳ BDT)</Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="1"
                    min="0"
                    placeholder="e.g. 10"
                    value={chargeFlat}
                    onChange={(e) => setChargeFlat(e.target.value)}
                    className="pr-7 text-xs"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-semibold">
                    ৳
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <span className="block text-xs font-semibold text-foreground">
                Active in Storefront Checkout
              </span>
              <span className="block text-[11px] text-muted-foreground">
                বন্ধ রাখলে কাস্টমার চেকআউটে এই অপশনটি দেখতে পাবে না।
              </span>
            </div>
            <Switch
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create Method"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
