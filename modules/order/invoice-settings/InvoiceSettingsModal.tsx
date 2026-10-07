"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Store,
  MapPin,
  FileText,
  RotateCcw,
  Save,
  Tag,
  Image as ImageIcon,
} from "lucide-react";
import {
  useInvoiceSettings,
} from "./useInvoiceSettings";
import type { InvoiceSettings } from "./invoiceSettings";

interface InvoiceSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InvoiceSettingsModal({
  open,
  onOpenChange,
}: InvoiceSettingsModalProps) {
  const { settings, updateSettings, resetToDefaults } = useInvoiceSettings();
  const [formData, setFormData] = useState<InvoiceSettings>(settings);

  useEffect(() => {
    if (open) {
      setFormData(settings);
    }
  }, [open, settings]);

  const handleChange = (field: keyof InvoiceSettings, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    updateSettings(formData);
    toast.success("Invoice & Shipping settings updated successfully!");
    onOpenChange(false);
  };

  const handleReset = () => {
    if (
      confirm("Are you sure you want to reset all invoice settings to default?")
    ) {
      const reset = resetToDefaults();
      setFormData(reset);
      toast.info("Invoice settings reset to default values.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Store className="size-5 text-primary" />
            <DialogTitle>Customize Invoice & Shipping Label</DialogTitle>
          </div>
          <DialogDescription>
            Changes made here will instantly reflect across all A4 Tax
            Invoices and Thermal Shipping Labels.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="identity" className="w-full mt-2">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="identity" className="text-xs">
              <Store className="size-3.5 mr-1.5" /> Store Info
            </TabsTrigger>
            <TabsTrigger value="contact" className="text-xs">
              <MapPin className="size-3.5 mr-1.5" /> Address & Phone
            </TabsTrigger>
            <TabsTrigger value="terms" className="text-xs">
              <FileText className="size-3.5 mr-1.5" /> Terms & Label
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: STORE IDENTITY */}
          <TabsContent value="identity" className="space-y-4 pt-3">
            <div className="space-y-1.5">
              <Label htmlFor="storeName">Store / Company Name</Label>
              <Input
                id="storeName"
                value={formData.storeName}
                onChange={(e) => handleChange("storeName", e.target.value)}
                placeholder="e.g. NEXTGEN STORE"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="storeTagline">Invoice Subtitle / Tagline</Label>
              <Input
                id="storeTagline"
                value={formData.storeTagline}
                onChange={(e) => handleChange("storeTagline", e.target.value)}
                placeholder="e.g. Official Order Invoice & Delivery Packing Slip"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="logoUrl" className="flex items-center gap-1.5">
                <ImageIcon className="size-3.5 text-muted-foreground" />
                Store Logo Image URL (Optional)
              </Label>
              <Input
                id="logoUrl"
                value={formData.logoUrl || ""}
                onChange={(e) => handleChange("logoUrl", e.target.value)}
                placeholder="https://yourstore.com/logo.png"
              />
              <p className="text-[11px] text-muted-foreground">
                Leave empty to display stylish monogram text with your store name.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="binNumber">VAT Reg / BIN Number</Label>
              <Input
                id="binNumber"
                value={formData.binNumber}
                onChange={(e) => handleChange("binNumber", e.target.value)}
                placeholder="e.g. 002948192-0102"
              />
            </div>
          </TabsContent>

          {/* TAB 2: CONTACT & ADDRESS */}
          <TabsContent value="contact" className="space-y-4 pt-3">
            <div className="space-y-1.5">
              <Label htmlFor="storeAddress">Store / Warehouse Full Address</Label>
              <Textarea
                id="storeAddress"
                rows={2}
                value={formData.storeAddress}
                onChange={(e) => handleChange("storeAddress", e.target.value)}
                placeholder="House, Road, Area, City, Bangladesh"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="supportPhone">Helpline / Phone Number</Label>
                <Input
                  id="supportPhone"
                  value={formData.supportPhone}
                  onChange={(e) => handleChange("supportPhone", e.target.value)}
                  placeholder="+880 1876-346433"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input
                  id="supportEmail"
                  type="email"
                  value={formData.supportEmail}
                  onChange={(e) => handleChange("supportEmail", e.target.value)}
                  placeholder="support@nextgen-shop.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="websiteUrl">Website URL</Label>
              <Input
                id="websiteUrl"
                value={formData.websiteUrl}
                onChange={(e) => handleChange("websiteUrl", e.target.value)}
                placeholder="www.nextgen-shop.com"
              />
            </div>
          </TabsContent>

          {/* TAB 3: TERMS & LABEL SETTINGS */}
          <TabsContent value="terms" className="space-y-4 pt-3">
            <div className="space-y-1.5">
              <Label htmlFor="termsAndConditions">
                Invoice Return Policy & Warranty Terms
              </Label>
              <Textarea
                id="termsAndConditions"
                rows={4}
                value={formData.termsAndConditions}
                onChange={(e) =>
                  handleChange("termsAndConditions", e.target.value)
                }
                placeholder="Enter return policies or inspection instructions..."
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="footerNote">Invoice Footer Note</Label>
              <Input
                id="footerNote"
                value={formData.footerNote}
                onChange={(e) => handleChange("footerNote", e.target.value)}
                placeholder="e.g. This is a computer-generated tax invoice..."
              />
            </div>

            <div className="space-y-1.5 pt-2 border-t">
              <Label htmlFor="defaultDispatchNote">
                Default Shipping Dispatch Note
              </Label>
              <Input
                id="defaultDispatchNote"
                value={formData.defaultDispatchNote}
                onChange={(e) =>
                  handleChange("defaultDispatchNote", e.target.value)
                }
                placeholder="e.g. FRAGILE - HANDLE WITH CARE"
              />
            </div>

            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold">Customer Signature Line</p>
                  <p className="text-[11px] text-muted-foreground">
                    Display customer signature placeholder on A4 invoice
                  </p>
                </div>
                <Switch
                  checked={formData.showCustomerSignature}
                  onCheckedChange={(checked) =>
                    handleChange("showCustomerSignature", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold">Authorized Signatory / Seal</p>
                  <p className="text-[11px] text-muted-foreground">
                    Display company seal placeholder on A4 invoice
                  </p>
                </div>
                <Switch
                  checked={formData.showAuthorizedSignature}
                  onCheckedChange={(checked) =>
                    handleChange("showAuthorizedSignature", checked)
                  }
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-2 border-t pt-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-xs text-muted-foreground hover:text-destructive gap-1 self-start sm:self-center"
          >
            <RotateCcw className="size-3.5" />
            Reset Defaults
          </Button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              className="gap-1.5"
            >
              <Save className="size-3.5" />
              Save Settings
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
