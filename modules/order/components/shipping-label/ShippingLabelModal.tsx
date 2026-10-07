"use client";

import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Printer,
  ChevronLeft,
  ChevronRight,
  Settings2,
  Tag,
  CheckCircle2,
  SlidersHorizontal,
  FileText,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import {
  ShippingLabel,
  type ShippingLabelSize,
  type ShippingLabelOptions,
} from "./ShippingLabel";
import type { Order } from "../../order.types";
import { useInvoiceSettings } from "../../invoice-settings/useInvoiceSettings";
import { InvoiceSettingsModal } from "../../invoice-settings/InvoiceSettingsModal";

interface ShippingLabelModalProps {
  order?: Order | null;
  orders?: Order[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShippingLabelModal({
  order,
  orders: rawOrders,
  open,
  onOpenChange,
}: ShippingLabelModalProps) {
  // Normalize orders list (supports either single order or multiple orders)
  const activeOrders: Order[] = React.useMemo(() => {
    if (rawOrders && rawOrders.length > 0) return rawOrders;
    if (order) return [order];
    return [];
  }, [rawOrders, order]);

  const { settings } = useInvoiceSettings();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [size, setSize] = useState<ShippingLabelSize>("A4");
  const [showMerchantReturn, setShowMerchantReturn] = useState(true);
  const [showItemsSummary, setShowItemsSummary] = useState(true);
  const [showBarcodes, setShowBarcodes] = useState(true);
  const [customNote, setCustomNote] = useState("");
  const [isPrinting, setIsPrinting] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  React.useEffect(() => {
    if (settings) {
      setSize(settings.defaultLabelSize || "A4");
      setShowMerchantReturn(settings.showMerchantReturn ?? true);
      setShowItemsSummary(settings.showItemsSummary ?? true);
      setShowBarcodes(settings.showBarcodes ?? true);
      if (settings.defaultDispatchNote) {
        setCustomNote(settings.defaultDispatchNote);
      }
    }
  }, [settings]);

  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!open || activeOrders.length === 0) return null;

  const currentOrder = activeOrders[currentIndex] || activeOrders[0];
  const isBulk = activeOrders.length > 1;

  const options: ShippingLabelOptions = {
    size,
    showMerchantReturn,
    showItemsSummary,
    showBarcodes,
    merchantName: settings.storeName,
    merchantPhone: settings.supportPhone,
    merchantAddress: settings.storeAddress,
    merchantWebsite: settings.websiteUrl,
    customNote: customNote.trim() || undefined,
  };

  const handlePrint = () => {
    setIsPrinting(true);

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      setIsPrinting(false);
      return;
    }

    // Collect all stylesheets from parent
    let styles = "";
    document.querySelectorAll('link[rel="stylesheet"], style').forEach((node) => {
      styles += node.outerHTML;
    });

    const pageCss =
      size === "A4"
        ? `@page { size: A4 portrait; margin: 8mm 10mm; }`
        : size === "4x6"
        ? `@page { size: 100mm 150mm; margin: 0; }`
        : `@page { size: 80mm auto; margin: 0; }`;

    const printStyles = `
      <style>
        ${pageCss}
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          background-color: #ffffff !important;
          color: #000000 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .thermal-print-wrapper {
          display: block !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        .thermal-label-page {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          box-sizing: border-box !important;
          margin: 0 auto !important;
          padding: ${size === "A4" ? "0" : "1.5mm"} !important;
          background: #ffffff !important;
        }
        /* Crucial: ONLY page break between consecutive pages, NEVER after the last page! */
        .thermal-label-page:not(:last-child) {
          page-break-after: always !important;
          break-after: page !important;
        }
        .thermal-label-page:last-child {
          page-break-after: avoid !important;
          break-after: avoid !important;
          margin-bottom: 0 !important;
          padding-bottom: 0 !important;
        }
      </style>
    `;

    // Render HTML of all active orders
    const allLabelsHtml = activeOrders
      .map((ord, idx) => {
        const el = document.getElementById(`print-label-${idx}`);
        return `<div class="thermal-label-page">${el ? el.innerHTML : ""}</div>`;
      })
      .join("");

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Shipping Labels (${activeOrders.length})</title>
          ${styles}
          ${printStyles}
        </head>
        <body>
          <div class="thermal-print-wrapper">
            ${allLabelsHtml}
          </div>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.error("Print error:", err);
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
          setIsPrinting(false);
        }, 1000);
      }
    }, 400);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-4xl max-h-[92vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="border-b pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-lg bg-black text-white flex items-center justify-center">
                <Tag className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                  Parcel Shipping Label / Thermal Slip
                  {isBulk && (
                    <Badge variant="secondary" className="text-xs font-mono">
                      {activeOrders.length} orders
                    </Badge>
                  )}
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Universal high-contrast sticker for thermal label printers (Xprinter, Gprinter, Zebra).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSettingsModalOpen(true)}
                className="gap-1.5 text-xs font-semibold h-9 cursor-pointer shadow-xs"
              >
                <Settings2 className="size-3.5" />
                Customize Template
              </Button>
              <Button
                onClick={handlePrint}
                disabled={isPrinting}
                className="gap-1.5 bg-black hover:bg-neutral-800 text-white font-semibold text-xs h-9 cursor-pointer shadow-sm"
              >
                <Printer className="size-4" />
                {isBulk
                  ? `Print All ${activeOrders.length} Labels`
                  : `Print Shipping Label`}
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* ── Label Customization Controls ─────────────────────────────────── */}
        <div className="bg-muted/40 p-3 sm:p-4 rounded-xl border space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <SlidersHorizontal className="size-3.5 text-primary" /> Label Settings & Layout
            </span>

            {/* Size Selector */}
            <div className="flex items-center gap-1 bg-background border p-0.5 rounded-lg text-xs self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setSize("A4")}
                className={`px-2.5 py-1 rounded-md font-semibold transition ${
                  size === "A4"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                A4 (Paper / Sticker)
              </button>
              <button
                type="button"
                onClick={() => setSize("4x6")}
                className={`px-2.5 py-1 rounded-md font-semibold transition ${
                  size === "4x6"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                4" × 6" Thermal (100×150mm)
              </button>
              <button
                type="button"
                onClick={() => setSize("80mm")}
                className={`px-2.5 py-1 rounded-md font-semibold transition ${
                  size === "80mm"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                3" Roll (80mm)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <label className="flex items-center gap-2 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={showMerchantReturn}
                onChange={(e) => setShowMerchantReturn(e.target.checked)}
                className="rounded border-input text-primary focus:ring-primary size-4"
              />
              <span>Show Return Address</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={showItemsSummary}
                onChange={(e) => setShowItemsSummary(e.target.checked)}
                className="rounded border-input text-primary focus:ring-primary size-4"
              />
              <span>Show Package Contents</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={showBarcodes}
                onChange={(e) => setShowBarcodes(e.target.checked)}
                className="rounded border-input text-primary focus:ring-primary size-4"
              />
              <span>Show Barcodes</span>
            </label>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Label className="text-xs shrink-0 text-muted-foreground">
              Dispatch Note:
            </Label>
            <Input
              type="text"
              placeholder="e.g. Fragile / Do Not Press, Call recipient before handover..."
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              className="h-8 text-xs bg-background"
            />
          </div>
        </div>

        {/* ── Bulk Navigation Header if more than 1 order ───────────────────── */}
        {isBulk && (
          <div className="flex items-center justify-between bg-card border rounded-lg px-4 py-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Previewing:</span>
              <span className="font-mono font-bold text-foreground">
                Order #{currentOrder.orderNumber}
              </span>
              <Badge variant="outline" className="text-[10px]">
                {currentIndex + 1} of {activeOrders.length}
              </Badge>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="h-7 w-7 p-0"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentIndex((prev) =>
                    Math.min(activeOrders.length - 1, prev + 1)
                  )
                }
                disabled={currentIndex === activeOrders.length - 1}
                className="h-7 w-7 p-0"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ── Live Sticker Preview Canvas ──────────────────────────────────── */}
        <div className="flex justify-center bg-neutral-100 dark:bg-neutral-900/60 p-6 rounded-xl border overflow-x-auto min-h-[400px]">
          <div className="shadow-lg transition-transform hover:scale-[1.01]">
            <ShippingLabel order={currentOrder} options={options} />
          </div>
        </div>

        {/* ── Hidden Print Rendering Buffer (Renders all orders for bulk print) ── */}
        <div style={{ display: "none" }} ref={printAreaRef}>
          {activeOrders.map((ord, idx) => (
            <div key={ord.id || ord.orderNumber} id={`print-label-${idx}`}>
              <ShippingLabel order={ord} options={options} />
            </div>
          ))}
        </div>

        {/* Invoice & Label Settings Modal */}
        <InvoiceSettingsModal
          open={isSettingsModalOpen}
          onOpenChange={setIsSettingsModalOpen}
        />
      </DialogContent>
    </Dialog>
  );
}
