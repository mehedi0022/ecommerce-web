"use client";

import React, { useState, useMemo } from "react";
import {
  Printer,
  Barcode,
  Layers,
  Copy,
  Check,
  RotateCcw,
  Tag,
  Store,
  Sliders,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Product, ProductVariant } from "@/modules/product/types";
import { useInvoiceSettings } from "@/modules/order/invoice-settings/useInvoiceSettings";

export type LabelSize = "50x30mm" | "40x25mm" | "A4-24";

interface ProductBarcodePrintModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ─── Deterministic High-Definition Code 128-Style SVG Barcode ───────────────
function BarcodeSvg({ value, height = 36 }: { value: string; height?: number }) {
  const bars: { width: number; isSpace: boolean }[] = [];

  // Start pattern
  bars.push(
    { width: 2, isSpace: false },
    { width: 1, isSpace: true },
    { width: 2, isSpace: false }
  );

  const clean = value || "000000";
  for (let i = 0; i < clean.length; i++) {
    const code = clean.charCodeAt(i);
    const w1 = (code % 3) + 1;
    const w2 = ((code >> 1) % 2) + 1;
    const w3 = ((code >> 2) % 3) + 1;
    bars.push(
      { width: w1, isSpace: false },
      { width: 1, isSpace: true },
      { width: w2, isSpace: false },
      { width: w3, isSpace: true }
    );
  }

  // Stop pattern
  bars.push(
    { width: 2, isSpace: false },
    { width: 1, isSpace: true },
    { width: 2, isSpace: false }
  );

  let currentX = 6;
  return (
    <div className="flex flex-col items-center justify-center w-full">
      <svg
        className="w-full text-black"
        style={{ height: `${height}px` }}
        viewBox="0 0 220 40"
        preserveAspectRatio="none"
        fill="currentColor"
      >
        {bars.map((bar, idx) => {
          const x = currentX;
          currentX += bar.width * 2;
          if (bar.isSpace) return null;
          return (
            <rect key={idx} x={x} y={0} width={bar.width * 1.8} height={40} />
          );
        })}
      </svg>
      <span className="font-mono text-[9px] font-bold tracking-widest text-black mt-0.5">
        *{clean}*
      </span>
    </div>
  );
}

export function ProductBarcodePrintModal({
  product,
  open,
  onOpenChange,
}: ProductBarcodePrintModalProps) {
  const { settings } = useInvoiceSettings();

  // Print format
  const [labelSize, setLabelSize] = useState<LabelSize>("50x30mm");
  const [showStoreName, setShowStoreName] = useState(true);
  const [showPrice, setShowPrice] = useState(true);

  // Sticker quantities per variant ID
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  // Initialize quantities when product opens
  React.useEffect(() => {
    if (product && product.variants) {
      const initial: Record<number, number> = {};
      product.variants.forEach((v) => {
        initial[v.id] = 1;
      });
      setQuantities(initial);
    }
  }, [product]);

  const variants = product?.variants || [];

  const handleQuantityChange = (variantId: number, qty: number) => {
    setQuantities((prev) => ({
      ...prev,
      [variantId]: Math.max(0, qty),
    }));
  };

  const handleSetAllQuantities = (qty: number) => {
    const updated: Record<number, number> = {};
    variants.forEach((v) => {
      updated[v.id] = qty;
    });
    setQuantities(updated);
  };

  // Compile list of labels to print
  const labelsToPrint = useMemo(() => {
    if (!product || !variants.length) return [];
    const list: Array<{
      variant: ProductVariant;
      index: number;
    }> = [];

    variants.forEach((v) => {
      const count = quantities[v.id] ?? 0;
      for (let i = 0; i < count; i++) {
        list.push({ variant: v, index: i });
      }
    });

    return list;
  }, [product, variants, quantities]);

  if (!product) return null;

  const handlePrint = () => {
    if (labelsToPrint.length === 0) {
      alert("Please specify at least 1 sticker to print.");
      return;
    }

    const printWindow = window.open("", "_blank", "width=600,height=700");
    if (!printWindow) {
      alert("Please allow popups to print barcode labels.");
      return;
    }

    const is50x30 = labelSize === "50x30mm";
    const is40x25 = labelSize === "40x25mm";
    const isA4 = labelSize === "A4-24";

    const storeTitle = showStoreName ? (settings.storeName || "STORE") : "";

    const labelsHtml = labelsToPrint
      .map(({ variant }) => {
        const effectiveBarcode = variant.barcode?.trim() || variant.sku;
        const attrSummary = (variant.attributeValues || [])
          .map((av) => av.attributeValue?.value)
          .filter(Boolean)
          .join(" / ");

        const priceText = showPrice ? `৳${Number(variant.price).toFixed(0)}` : "";
        const skuSubText = variant.barcode?.trim() && variant.barcode.trim() !== variant.sku ? `SKU: ${variant.sku}` : "";

        if (is50x30) {
          return `
            <div class="label-50x30">
              ${storeTitle ? `<div class="store-name">${storeTitle}</div>` : ""}
              <div class="product-title">${product.name}</div>
              ${attrSummary ? `<div class="attr-summary">${attrSummary}</div>` : ""}
              <div class="barcode-wrap">
                <svg class="barcode-svg" viewBox="0 0 220 36" preserveAspectRatio="none">
                  <rect x="10" y="0" width="3" height="36" fill="#000"/>
                  <rect x="16" y="0" width="2" height="36" fill="#000"/>
                  <rect x="22" y="0" width="5" height="36" fill="#000"/>
                  <rect x="30" y="0" width="2" height="36" fill="#000"/>
                  <rect x="36" y="0" width="4" height="36" fill="#000"/>
                  <rect x="44" y="0" width="3" height="36" fill="#000"/>
                  <rect x="52" y="0" width="6" height="36" fill="#000"/>
                  <rect x="62" y="0" width="2" height="36" fill="#000"/>
                  <rect x="68" y="0" width="4" height="36" fill="#000"/>
                  <rect x="76" y="0" width="3" height="36" fill="#000"/>
                  <rect x="84" y="0" width="5" height="36" fill="#000"/>
                  <rect x="94" y="0" width="2" height="36" fill="#000"/>
                  <rect x="100" y="0" width="4" height="36" fill="#000"/>
                  <rect x="108" y="0" width="3" height="36" fill="#000"/>
                  <rect x="116" y="0" width="6" height="36" fill="#000"/>
                  <rect x="126" y="0" width="2" height="36" fill="#000"/>
                  <rect x="132" y="0" width="5" height="36" fill="#000"/>
                  <rect x="142" y="0" width="3" height="36" fill="#000"/>
                  <rect x="150" y="0" width="4" height="36" fill="#000"/>
                  <rect x="158" y="0" width="2" height="36" fill="#000"/>
                  <rect x="164" y="0" width="5" height="36" fill="#000"/>
                  <rect x="174" y="0" width="3" height="36" fill="#000"/>
                  <rect x="182" y="0" width="4" height="36" fill="#000"/>
                  <rect x="190" y="0" width="2" height="36" fill="#000"/>
                  <rect x="196" y="0" width="5" height="36" fill="#000"/>
                  <rect x="206" y="0" width="3" height="36" fill="#000"/>
                </svg>
              </div>
              <div class="footer-row">
                <span class="sku-text">*${effectiveBarcode}*</span>
                ${priceText ? `<span class="price-text">${priceText}</span>` : ""}
              </div>
              ${skuSubText ? `<div style="font-size:7px;color:#555;line-height:1;margin-top:1px;">${skuSubText}</div>` : ""}
            </div>
          `;
        }

        if (is40x25) {
          return `
            <div class="label-40x25">
              ${storeTitle ? `<div class="store-name">${storeTitle}</div>` : ""}
              <div class="product-title">${product.name}</div>
              <div class="barcode-wrap-sm">
                <svg class="barcode-svg-sm" viewBox="0 0 200 30" preserveAspectRatio="none">
                  <rect x="8" y="0" width="3" height="30" fill="#000"/>
                  <rect x="14" y="0" width="2" height="30" fill="#000"/>
                  <rect x="20" y="0" width="5" height="30" fill="#000"/>
                  <rect x="28" y="0" width="2" height="30" fill="#000"/>
                  <rect x="34" y="0" width="4" height="30" fill="#000"/>
                  <rect x="42" y="0" width="3" height="30" fill="#000"/>
                  <rect x="50" y="0" width="6" height="30" fill="#000"/>
                  <rect x="60" y="0" width="2" height="30" fill="#000"/>
                  <rect x="66" y="0" width="4" height="30" fill="#000"/>
                  <rect x="74" y="0" width="3" height="30" fill="#000"/>
                  <rect x="82" y="0" width="5" height="30" fill="#000"/>
                  <rect x="92" y="0" width="2" height="30" fill="#000"/>
                  <rect x="98" y="0" width="4" height="30" fill="#000"/>
                  <rect x="106" y="0" width="3" height="30" fill="#000"/>
                  <rect x="114" y="0" width="6" height="30" fill="#000"/>
                  <rect x="124" y="0" width="2" height="30" fill="#000"/>
                  <rect x="130" y="0" width="5" height="30" fill="#000"/>
                  <rect x="140" y="0" width="3" height="30" fill="#000"/>
                  <rect x="148" y="0" width="4" height="30" fill="#000"/>
                  <rect x="156" y="0" width="2" height="30" fill="#000"/>
                  <rect x="162" y="0" width="5" height="30" fill="#000"/>
                  <rect x="172" y="0" width="3" height="30" fill="#000"/>
                  <rect x="180" y="0" width="4" height="30" fill="#000"/>
                  <rect x="188" y="0" width="3" height="30" fill="#000"/>
                </svg>
              </div>
              <div class="footer-row">
                <span class="sku-text">${effectiveBarcode}</span>
                ${priceText ? `<span class="price-text">${priceText}</span>` : ""}
              </div>
            </div>
          `;
        }

        // A4 Grid
        return `
          <div class="label-a4">
            <div class="store-name">${storeTitle}</div>
            <div class="product-title">${product.name} ${attrSummary ? `(${attrSummary})` : ""}</div>
            <div class="barcode-wrap">
              <svg class="barcode-svg" viewBox="0 0 220 32" preserveAspectRatio="none">
                <rect x="10" y="0" width="3" height="32" fill="#000"/>
                <rect x="16" y="0" width="2" height="32" fill="#000"/>
                <rect x="22" y="0" width="5" height="32" fill="#000"/>
                <rect x="30" y="0" width="2" height="32" fill="#000"/>
                <rect x="36" y="0" width="4" height="32" fill="#000"/>
                <rect x="44" y="0" width="3" height="32" fill="#000"/>
                <rect x="52" y="0" width="6" height="32" fill="#000"/>
                <rect x="62" y="0" width="2" height="32" fill="#000"/>
                <rect x="68" y="0" width="4" height="32" fill="#000"/>
                <rect x="76" y="0" width="3" height="32" fill="#000"/>
                <rect x="84" y="0" width="5" height="32" fill="#000"/>
                <rect x="94" y="0" width="2" height="32" fill="#000"/>
                <rect x="100" y="0" width="4" height="32" fill="#000"/>
                <rect x="108" y="0" width="3" height="32" fill="#000"/>
                <rect x="116" y="0" width="6" height="32" fill="#000"/>
                <rect x="126" y="0" width="2" height="32" fill="#000"/>
                <rect x="132" y="0" width="5" height="32" fill="#000"/>
                <rect x="142" y="0" width="3" height="32" fill="#000"/>
                <rect x="150" y="0" width="4" height="32" fill="#000"/>
                <rect x="158" y="0" width="2" height="32" fill="#000"/>
                <rect x="164" y="0" width="5" height="32" fill="#000"/>
                <rect x="174" y="0" width="3" height="32" fill="#000"/>
                <rect x="182" y="0" width="4" height="32" fill="#000"/>
                <rect x="190" y="0" width="2" height="32" fill="#000"/>
                <rect x="196" y="0" width="5" height="32" fill="#000"/>
                <rect x="206" y="0" width="3" height="32" fill="#000"/>
              </svg>
            </div>
            <div class="footer-row">
              <span class="sku-text">*${effectiveBarcode}*</span>
              ${priceText ? `<span class="price-text">${priceText}</span>` : ""}
            </div>
            ${skuSubText ? `<div style="font-size:7px;color:#555;line-height:1;margin-top:1px;">${skuSubText}</div>` : ""}
          </div>
        `;
      })
      .join("");

    const pageCss = is50x30
      ? `@page { size: 50mm 30mm; margin: 0; }`
      : is40x25
      ? `@page { size: 40mm 25mm; margin: 0; }`
      : `@page { size: A4 portrait; margin: 8mm 6mm; }`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Barcodes - ${product.name}</title>
          <style>
            ${pageCss}
            * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; }
            body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
            
            /* 50x30mm Thermal Label */
            .label-50x30 {
              width: 50mm;
              height: 30mm;
              padding: 1.5mm 2.5mm;
              page-break-after: always;
              overflow: hidden;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              text-align: center;
            }
            
            /* 40x25mm Thermal Label */
            .label-40x25 {
              width: 40mm;
              height: 25mm;
              padding: 1mm 1.5mm;
              page-break-after: always;
              overflow: hidden;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              text-align: center;
            }
            
            /* A4 Sheet (3 columns x 8 rows) */
            .a4-container {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 2mm 3mm;
              width: 100%;
            }
            .label-a4 {
              border: 1px dashed #ddd;
              padding: 2mm 3mm;
              height: 33mm;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              text-align: center;
              page-break-inside: avoid;
            }
            
            .store-name { font-size: 8px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; }
            .product-title { font-size: 9px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.1; }
            .attr-summary { font-size: 8px; color: #444; line-height: 1; }
            .barcode-wrap { width: 100%; height: 11mm; display: flex; align-items: center; justify-content: center; }
            .barcode-svg { width: 92%; height: 100%; }
            .barcode-wrap-sm { width: 100%; height: 8mm; display: flex; align-items: center; justify-content: center; }
            .barcode-svg-sm { width: 95%; height: 100%; }
            .footer-row { display: flex; justify-content: space-between; align-items: center; font-size: 9px; font-weight: bold; }
            .sku-text { font-family: monospace; font-size: 8px; }
            .price-text { font-weight: 900; font-size: 10px; }
          </style>
        </head>
        <body>
          ${isA4 ? `<div class="a4-container">${labelsHtml}</div>` : labelsHtml}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 600);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[92vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="border-b pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <Barcode className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">
                  Print Product Barcode Labels
                </DialogTitle>
                <p className="text-xs text-muted-foreground truncate max-w-sm">
                  {product.name}
                </p>
              </div>
            </div>

            <Button
              onClick={handlePrint}
              disabled={labelsToPrint.length === 0}
              size="sm"
              className="gap-1.5 font-bold bg-primary shadow-xs"
            >
              <Printer className="h-4 w-4" />
              Print ({labelsToPrint.length}) Labels
            </Button>
          </div>
        </DialogHeader>

        {/* Configuration Bar */}
        <div className="space-y-3 p-3 bg-muted/40 rounded-xl border text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Label className="text-xs font-semibold">Label Size / Media:</Label>
              <div className="inline-flex rounded-lg border p-0.5 bg-background">
                <button
                  type="button"
                  onClick={() => setLabelSize("50x30mm")}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                    labelSize === "50x30mm"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  50 x 30 mm (Thermal Tag)
                </button>
                <button
                  type="button"
                  onClick={() => setLabelSize("40x25mm")}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                    labelSize === "40x25mm"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  40 x 25 mm (Small Roll)
                </button>
                <button
                  type="button"
                  onClick={() => setLabelSize("A4-24")}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                    labelSize === "A4-24"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  A4 Sticker Sheet (24 labels)
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showStoreName}
                  onChange={(e) => setShowStoreName(e.target.checked)}
                  className="rounded border-input text-primary size-3.5"
                />
                <span>Store Title</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showPrice}
                  onChange={(e) => setShowPrice(e.target.checked)}
                  className="rounded border-input text-primary size-3.5"
                />
                <span>Price (৳)</span>
              </label>
            </div>
          </div>

          {/* Bulk quantity helpers */}
          <div className="flex items-center justify-between border-t pt-2 text-[11px] text-muted-foreground">
            <span>Quick quantity presets:</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleSetAllQuantities(1)}
                className="px-2 py-0.5 rounded border bg-background hover:bg-muted font-medium"
              >
                1 per variant
              </button>
              <button
                type="button"
                onClick={() => handleSetAllQuantities(5)}
                className="px-2 py-0.5 rounded border bg-background hover:bg-muted font-medium"
              >
                5 per variant
              </button>
              <button
                type="button"
                onClick={() => handleSetAllQuantities(10)}
                className="px-2 py-0.5 rounded border bg-background hover:bg-muted font-medium"
              >
                10 per variant
              </button>
              <button
                type="button"
                onClick={() => handleSetAllQuantities(0)}
                className="px-2 py-0.5 rounded text-destructive hover:bg-destructive/10 font-medium"
              >
                Clear all
              </button>
            </div>
          </div>
        </div>

        {/* Variants Quantity Selection Table */}
        <div className="border rounded-xl overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-muted/50 border-b text-muted-foreground font-semibold">
              <tr>
                <th className="py-2.5 px-3">Variant / Option</th>
                <th className="py-2.5 px-3 font-mono">SKU / Barcode</th>
                <th className="py-2.5 px-3 text-right">Selling Price</th>
                <th className="py-2.5 px-3 text-center w-28">Print Copies</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {variants.map((v) => {
                const attrSummary = (v.attributeValues || [])
                  .map((av) => av.attributeValue?.value)
                  .filter(Boolean)
                  .join(" / ");

                const qty = quantities[v.id] ?? 0;

                return (
                  <tr key={v.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 px-3 font-medium">
                      {attrSummary || `Option #${v.id}`}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-muted-foreground">
                      <div className="font-semibold text-foreground">{v.barcode?.trim() || v.sku}</div>
                      {v.barcode?.trim() && v.barcode.trim() !== v.sku && (
                        <div className="text-[10px] text-muted-foreground">SKU: {v.sku}</div>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold">
                      ৳{Number(v.price).toFixed(0)}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Input
                          type="number"
                          min="0"
                          max="999"
                          value={qty}
                          onChange={(e) =>
                            handleQuantityChange(v.id, parseInt(e.target.value) || 0)
                          }
                          className="h-7 w-16 text-center font-bold text-xs"
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Live Sticker Sample Preview */}
        {variants.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Single Sticker Preview Sample:
            </div>
            <div className="flex justify-center p-4 bg-zinc-100 dark:bg-zinc-950 rounded-xl border">
              <div
                style={{
                  width: labelSize === "40x25mm" ? "180px" : "210px",
                  height: labelSize === "40x25mm" ? "115px" : "130px",
                }}
                className="bg-white text-zinc-900 border border-zinc-300 rounded shadow-sm p-2 flex flex-col justify-between text-center select-none"
              >
                {showStoreName && (
                  <div className="text-[8px] font-bold uppercase tracking-wider text-zinc-600 truncate">
                    {settings.storeName || "STORE"}
                  </div>
                )}
                <div className="text-[9px] font-bold text-zinc-900 truncate leading-tight">
                  {product.name}
                </div>
                <div className="text-[8px] text-zinc-600 truncate">
                  {(variants[0].attributeValues || [])
                    .map((av) => av.attributeValue?.value)
                    .filter(Boolean)
                    .join(" / ") || "Standard"}
                </div>

                <div className="w-full my-0.5">
                  <BarcodeSvg value={variants[0].barcode?.trim() || variants[0].sku} height={labelSize === "40x25mm" ? 28 : 34} />
                </div>

                <div className="flex justify-between items-center text-[9px] font-bold pt-0.5 border-t border-zinc-200">
                  <span className="font-mono text-[8px] text-zinc-700">
                    {variants[0].barcode?.trim() || variants[0].sku}
                  </span>
                  {showPrice && (
                    <span className="text-[10px] text-zinc-950">
                      ৳{Number(variants[0].price).toFixed(0)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
