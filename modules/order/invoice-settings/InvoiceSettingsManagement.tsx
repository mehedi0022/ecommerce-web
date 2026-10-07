"use client";

import React, { useState } from "react";
import {
  Store,
  MapPin,
  FileText,
  RotateCcw,
  Save,
  Printer,
  Eye,
  CheckCircle2,
  Tag,
  Image as ImageIcon,
  Sliders,
  Phone,
  Mail,
  Globe,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useInvoiceSettings } from "./useInvoiceSettings";
import { OrderInvoice } from "../components/invoice/OrderInvoice";
import { ShippingLabel } from "../components/shipping-label/ShippingLabel";
import type { Order } from "../order.types";
import type { InvoiceSettings } from "./invoiceSettings";

// Mock sample order for live interactive preview
const SAMPLE_ORDER: Order = {
  id: 9999,
  orderNumber: "ORD-SAMPLE-101",
  userId: 1,
  status: "CONFIRMED",
  subtotal: "3500.00",
  shippingCharge: "100.00",
  discountAmount: "200.00",
  taxAmount: "0.00",
  grandTotal: "3400.00",
  advanceAmount: "500.00",
  dueAmount: "2900.00",
  isAdvanceRequired: true,
  paymentStatus: "PARTIALLY_PAID",
  paymentMethod: "CASH_ON_DELIVERY",
  couponId: null,
  couponCode: "SAVE200",
  shippingZoneId: 1,
  shippingMethodId: 1,
  shippingZoneName: "Inside Dhaka",
  shippingMethodName: "Steadfast Express",
  customerName: "Rahim Chowdhury",
  customerPhone: "01712-345678",
  customerEmail: "rahim.chowdhury@example.com",
  customerNote: "Please deliver before 5 PM",
  placedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  statusHistory: [],
  addresses: [
    {
      id: 1,
      type: "SHIPPING",
      fullName: "Rahim Chowdhury",
      phone: "01712-345678",
      addressLine1: "House #45, Road #11, Sector #4",
      area: "Uttara",
      district: "Dhaka",
      upazila: "Uttara",
      postalCode: "1230",
      countryCode: "BD",
    },
  ],
  items: [
    {
      id: 1,
      productId: 10,
      variantId: 1,
      productName: "Premium Wireless Noise-Cancelling Headphones",
      productSlug: "premium-wireless-headphones",
      sku: "AUDIO-WH-1000",
      unitPrice: "2500.00",
      quantity: 1,
      lineTotal: "2500.00",
      createdAt: new Date().toISOString(),
      attributes: [
        { id: 1, attributeName: "Color", attributeValue: "Matte Black" },
      ],
    },
    {
      id: 2,
      productId: 11,
      variantId: 2,
      productName: "Braided Fast Charging Cable (Type-C to C, 2M)",
      productSlug: "braided-fast-charging-cable",
      sku: "CABLE-TC-2M",
      unitPrice: "500.00",
      quantity: 2,
      lineTotal: "1000.00",
      createdAt: new Date().toISOString(),
      attributes: [
        { id: 2, attributeName: "Length", attributeValue: "2 Meter" },
      ],
    },
  ],
  shipment: {
    id: 1,
    trackingNumber: "ST-88992011BD",
    consignmentId: "CID-9912048",
    courierName: "Steadfast Courier",
    trackingUrl: "https://steadfast.com.bd/t/ST-88992011BD",
    status: "IN_TRANSIT",
    shippedAt: new Date().toISOString(),
    deliveredAt: null,
  },
};

export function InvoiceSettingsManagement() {
  const { settings, updateSettings, resetToDefaults, isSaving, isLoading } = useInvoiceSettings();
  const [formData, setFormData] = useState<InvoiceSettings>(settings);
  const [activePreviewTab, setActivePreviewTab] = useState<"invoice" | "label">("invoice");
  const [previewLabelSize, setPreviewLabelSize] = useState<"A4" | "4x6" | "80mm">("A4");

  React.useEffect(() => {
    setFormData(settings);
    setPreviewLabelSize(settings.defaultLabelSize);
  }, [settings]);

  const handleChange = (field: keyof InvoiceSettings, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    await updateSettings(formData);
    toast.success("Store invoice and shipping label settings saved to database successfully!");
  };

  const handleReset = async () => {
    if (confirm("Reset all invoice and label settings to factory defaults?")) {
      const reset = await resetToDefaults();
      setFormData(reset);
      setPreviewLabelSize(reset.defaultLabelSize);
      toast.info("Invoice settings reset to default values in database.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="size-6 text-primary" />
            Invoice & Shipping Label Customization
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Update your company branding, logo, return address, BIN, helpline, and delivery terms in PostgreSQL database.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={isSaving}
            className="text-xs gap-1.5"
          >
            <RotateCcw className="size-3.5" />
            Reset Defaults
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="gap-1.5 font-semibold shadow-xs"
          >
            {isSaving ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Save className="size-3.5" />
            )}
            {isSaving ? "Saving to DB..." : "Save to Database"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Controls (7 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Card 1: Brand & Identity */}
          <Card className="shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Store className="size-4 text-primary" />
                Store Branding & Identity
              </CardTitle>
              <CardDescription className="text-xs">
                Visible on header of A4 Invoices and Shipping Slips.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="storeName" className="text-xs font-semibold">
                  Store / Company Name
                </Label>
                <Input
                  id="storeName"
                  value={formData.storeName}
                  onChange={(e) => handleChange("storeName", e.target.value)}
                  placeholder="e.g. NEXTGEN STORE"
                  className="font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="storeTagline" className="text-xs font-semibold">
                  Invoice Subtitle / Tagline
                </Label>
                <Input
                  id="storeTagline"
                  value={formData.storeTagline}
                  onChange={(e) => handleChange("storeTagline", e.target.value)}
                  placeholder="Official Order Invoice & Delivery Packing Slip"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="logoUrl" className="text-xs font-semibold flex items-center gap-1.5">
                  <ImageIcon className="size-3.5 text-muted-foreground" />
                  Store Logo Image URL (PNG/SVG/JPG)
                </Label>
                <Input
                  id="logoUrl"
                  value={formData.logoUrl || ""}
                  onChange={(e) => handleChange("logoUrl", e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
                <p className="text-[11px] text-muted-foreground">
                  Paste a direct image URL. If blank, a monogram logo with your store initial is displayed.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="binNumber" className="text-xs font-semibold">
                  VAT Reg / BIN Number
                </Label>
                <Input
                  id="binNumber"
                  value={formData.binNumber}
                  onChange={(e) => handleChange("binNumber", e.target.value)}
                  placeholder="e.g. 002948192-0102"
                />
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Contact & Return Address */}
          <Card className="shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="size-4 text-primary" />
                Contact & Return Address
              </CardTitle>
              <CardDescription className="text-xs">
                Printed as merchant return address for failed/undelivered courier parcels.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="storeAddress" className="text-xs font-semibold">
                  Full Dispatch / Warehouse Address
                </Label>
                <Textarea
                  id="storeAddress"
                  rows={2}
                  value={formData.storeAddress}
                  onChange={(e) => handleChange("storeAddress", e.target.value)}
                  placeholder="House, Road, City, Bangladesh"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="supportPhone" className="text-xs font-semibold">
                    Support Phone / Helpline
                  </Label>
                  <Input
                    id="supportPhone"
                    value={formData.supportPhone}
                    onChange={(e) => handleChange("supportPhone", e.target.value)}
                    placeholder="+880 1876-346433"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="supportEmail" className="text-xs font-semibold">
                    Support Email
                  </Label>
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
                <Label htmlFor="websiteUrl" className="text-xs font-semibold">
                  Website URL
                </Label>
                <Input
                  id="websiteUrl"
                  value={formData.websiteUrl}
                  onChange={(e) => handleChange("websiteUrl", e.target.value)}
                  placeholder="www.nextgen-shop.com"
                />
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Terms, Policy & Label Options */}
          <Card className="shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sliders className="size-4 text-primary" />
                Terms, Policy & Print Defaults
              </CardTitle>
              <CardDescription className="text-xs">
                Fine-tune document footers, signatures, and default label sizes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="termsAndConditions" className="text-xs font-semibold">
                  Return Policy & Customer Terms
                </Label>
                <Textarea
                  id="termsAndConditions"
                  rows={4}
                  value={formData.termsAndConditions}
                  onChange={(e) =>
                    handleChange("termsAndConditions", e.target.value)
                  }
                  placeholder="Enter invoice terms..."
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="footerNote" className="text-xs font-semibold">
                  Bottom Footer Disclaimer
                </Label>
                <Input
                  id="footerNote"
                  value={formData.footerNote}
                  onChange={(e) => handleChange("footerNote", e.target.value)}
                  placeholder="Computer generated invoice..."
                />
              </div>

              <div className="space-y-1.5 pt-2 border-t">
                <Label htmlFor="defaultDispatchNote" className="text-xs font-semibold">
                  Default Dispatch Warning Note (Label)
                </Label>
                <Input
                  id="defaultDispatchNote"
                  value={formData.defaultDispatchNote}
                  onChange={(e) =>
                    handleChange("defaultDispatchNote", e.target.value)
                  }
                  placeholder="FRAGILE - HANDLE WITH CARE"
                />
              </div>

              <div className="space-y-3 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold">Customer Signature Area</p>
                    <p className="text-[11px] text-muted-foreground">
                      Enable receiver verification signature line on A4 invoice
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
                    <p className="text-xs font-semibold">Authorized Seal Area</p>
                    <p className="text-[11px] text-muted-foreground">
                      Enable company stamp placeholder on A4 invoice
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
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Interactive Real-Time Preview (6 cols) */}
        <div className="lg:col-span-6 space-y-4 sticky top-6">
          <Card className="shadow-xs border-2 border-primary/20">
            <CardHeader className="p-4 pb-3 bg-muted/40 border-b">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Eye className="size-4 text-primary" />
                  <CardTitle className="text-sm font-bold">
                    Live Real-Time Preview
                  </CardTitle>
                </div>

                <div className="flex items-center gap-2">
                  <Tabs
                    value={activePreviewTab}
                    onValueChange={(v) => setActivePreviewTab(v as any)}
                  >
                    <TabsList className="h-8">
                      <TabsTrigger value="invoice" className="text-xs h-7 px-3">
                        A4 Invoice
                      </TabsTrigger>
                      <TabsTrigger value="label" className="text-xs h-7 px-3">
                        Shipping Label
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 bg-muted/20">
              {activePreviewTab === "invoice" ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground pb-1">
                    <span>A4 Tax Invoice & Packing Slip Preview</span>
                    <span className="font-mono text-[11px]">Size: 210 × 297mm</span>
                  </div>
                  <div className="rounded-lg border bg-white p-2 shadow-sm overflow-x-auto max-h-[750px] overflow-y-auto">
                    <OrderInvoice
                      order={SAMPLE_ORDER}
                      hideActions={true}
                      customSettings={formData}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs pb-1">
                    <span className="text-muted-foreground">
                      Parcel Label Format:
                    </span>
                    <div className="inline-flex rounded-md border bg-background p-0.5 shadow-xs">
                      <button
                        type="button"
                        onClick={() => setPreviewLabelSize("A4")}
                        className={`px-2.5 py-1 text-xs font-semibold rounded ${
                          previewLabelSize === "A4"
                            ? "bg-primary text-primary-foreground shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        A4 Sheet
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewLabelSize("4x6")}
                        className={`px-2.5 py-1 text-xs font-semibold rounded ${
                          previewLabelSize === "4x6"
                            ? "bg-primary text-primary-foreground shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        4" × 6" Sticker
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewLabelSize("80mm")}
                        className={`px-2.5 py-1 text-xs font-semibold rounded ${
                          previewLabelSize === "80mm"
                            ? "bg-primary text-primary-foreground shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        80mm Roll
                      </button>
                    </div>
                  </div>

                  <div className="rounded-lg border bg-zinc-100 p-4 shadow-sm flex items-center justify-center min-h-[480px] max-h-[750px] overflow-y-auto">
                    <ShippingLabel
                      order={SAMPLE_ORDER}
                      options={{
                        size: previewLabelSize,
                        merchantName: formData.storeName,
                        merchantPhone: formData.supportPhone,
                        merchantAddress: formData.storeAddress,
                        merchantWebsite: formData.websiteUrl,
                        customNote: formData.defaultDispatchNote,
                        showMerchantReturn: formData.showMerchantReturn,
                        showItemsSummary: formData.showItemsSummary,
                        showBarcodes: formData.showBarcodes,
                      }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
