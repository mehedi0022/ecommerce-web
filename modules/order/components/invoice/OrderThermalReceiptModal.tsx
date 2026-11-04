"use client";

import React, { useState, useRef } from "react";
import { format } from "date-fns";
import {
  Printer,
  Store,
  RotateCcw,
  Sliders,
  Check,
  Copy,
  Receipt,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { Order } from "../../order.types";
import { useInvoiceSettings } from "../../invoice-settings/useInvoiceSettings";

interface OrderThermalReceiptModalProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderThermalReceiptModal({
  order,
  open,
  onOpenChange,
}: OrderThermalReceiptModalProps) {
  const { settings } = useInvoiceSettings();
  const [rollWidth, setRollWidth] = useState<"80mm" | "58mm">("80mm");
  const [showBarcode, setShowBarcode] = useState(true);
  const [showCustomerAddress, setShowCustomerAddress] = useState(true);
  const [showPolicy, setShowPolicy] = useState(true);
  const [copied, setCopied] = useState(false);

  const receiptRef = useRef<HTMLDivElement>(null);

  if (!order) return null;

  const isStorePickup =
    order.source === "OUTLET_POS" ||
    order.addresses?.some((a) =>
      a.addressLine1?.toLowerCase().includes("store pickup")
    );

  const formattedDate = order.placedAt
    ? format(new Date(order.placedAt), "dd/MM/yyyy, hh:mm a")
    : format(new Date(order.createdAt), "dd/MM/yyyy, hh:mm a");

  const shippingAddr =
    order.addresses?.find((a) => a.type === "SHIPPING") || order.addresses?.[0];

  const subtotal = Number(order.subtotal) || 0;
  const discount = Number(order.discountAmount) || 0;
  const shipping = Number(order.shippingCharge) || 0;
  const grandTotal = Number(order.grandTotal) || 0;
  const advanceAmount = Number(order.advanceAmount ?? (order.paymentStatus === "PAID" ? grandTotal : 0));
  const dueAmount = Number(order.dueAmount ?? (grandTotal > advanceAmount ? grandTotal - advanceAmount : 0));
  const changeAmount = advanceAmount > grandTotal ? advanceAmount - grandTotal : 0;

  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=420,height=650");
    if (!printWindow) {
      alert("Please allow popups to print the receipt.");
      return;
    }

    const is58 = rollWidth === "58mm";
    const widthCss = is58 ? "56mm" : "76mm";
    const bodySize = is58 ? "11px" : "12px";
    const titleSize = is58 ? "15px" : "17px";

    const itemsHtml = (order.items || [])
      .map(
        (it) => `
        <tr>
          <td style="padding: 3px 0; font-size: ${bodySize}; line-height: 1.2;">
            <div style="font-weight: bold;">${it.productName}</div>
            <div style="font-size: 10px; color: #444;">SKU: ${it.sku}</div>
          </td>
          <td style="text-align: center; padding: 3px 2px; font-size: ${bodySize}; vertical-align: top;">${it.quantity}</td>
          <td style="text-align: right; padding: 3px 2px; font-size: ${bodySize}; vertical-align: top;">${Number(it.unitPrice).toFixed(0)}</td>
          <td style="text-align: right; padding: 3px 0; font-size: ${bodySize}; font-weight: bold; vertical-align: top;">${Number(it.lineTotal).toFixed(0)}</td>
        </tr>
      `
      )
      .join("");

    const receiptHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt #${order.orderNumber}</title>
          <style>
            @page {
              size: ${rollWidth} auto;
              margin: 0;
            }
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body {
              font-family: 'Courier New', Courier, monospace, sans-serif;
              width: ${widthCss};
              margin: 2mm auto;
              padding: 2px 4px;
              color: #000;
              font-size: ${bodySize};
              line-height: 1.25;
              background: #fff;
            }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .bold { font-weight: bold; }
            .divider { border-top: 1px dashed #000; margin: 4px 0; }
            .divider-double { border-top: 2px solid #000; margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; }
            th { border-bottom: 1px dashed #000; padding: 3px 0; font-size: 10px; font-weight: bold; }
            .summary-row { display: flex; justify-content: space-between; padding: 1.5px 0; font-size: ${bodySize}; }
            .barcode { font-size: 15px; font-weight: bold; letter-spacing: 3px; margin: 5px 0; }
          </style>
        </head>
        <body>
          <div class="text-center">
            <h2 style="margin: 0; font-size: ${titleSize}; text-transform: uppercase; font-weight: 900;">
              ${settings.storeName || "E-COMMERCE STORE"}
            </h2>
            ${settings.storeAddress ? `<p style="margin: 2px 0; font-size: 10px;">${settings.storeAddress}</p>` : ""}
            ${settings.supportPhone ? `<p style="margin: 1px 0; font-size: 10px;">Helpline: ${settings.supportPhone}</p>` : ""}
            ${settings.binNumber ? `<p style="margin: 1px 0; font-size: 9px;">BIN/VAT: ${settings.binNumber}</p>` : ""}
            <div class="divider"></div>
            ${
              showBarcode
                ? `<div class="barcode">*${order.orderNumber}*</div>`
                : ""
            }
            <div style="font-weight: bold; font-size: 13px;">ORDER: #${order.orderNumber}</div>
            <div style="font-size: 10px; color: #333;">Date: ${formattedDate}</div>
            <div style="font-size: 10px;">Channel: ${order.source || "WEBSITE"} | Status: ${order.status}</div>
          </div>

          <div class="divider"></div>

          <div style="font-size: 11px;">
            <div>Customer: <strong>${order.customerName}</strong></div>
            <div>Phone: <strong>${order.customerPhone}</strong></div>
            ${
              showCustomerAddress && shippingAddr?.addressLine1
                ? `<div style="font-size: 10px; color: #222; margin-top: 2px;">
                    Addr: ${shippingAddr.addressLine1}${shippingAddr.district ? `, ${shippingAddr.district}` : ""}
                   </div>`
                : ""
            }
          </div>

          <div class="divider"></div>

          <table>
            <thead>
              <tr>
                <th style="text-align: left;">Item</th>
                <th>Qty</th>
                <th style="text-align: right;">Rate</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="divider"></div>

          <div class="summary-row">
            <span>Subtotal:</span>
            <span>৳${subtotal.toFixed(2)}</span>
          </div>

          ${
            discount > 0
              ? `<div class="summary-row">
                  <span>Discount:</span>
                  <span>-৳${discount.toFixed(2)}</span>
                </div>`
              : ""
          }

          ${
            shipping > 0
              ? `<div class="summary-row">
                  <span>Delivery Charge:</span>
                  <span>৳${shipping.toFixed(2)}</span>
                </div>`
              : ""
          }

          <div class="divider-double"></div>

          <div class="summary-row bold" style="font-size: 13px;">
            <span>GRAND TOTAL:</span>
            <span>৳${grandTotal.toFixed(2)}</span>
          </div>

          <div class="summary-row">
            <span>Payment Method:</span>
            <span>${order.paymentMethod}</span>
          </div>

          <div class="summary-row">
            <span>Paid / Received:</span>
            <span>৳${advanceAmount.toFixed(2)}</span>
          </div>

          ${
            changeAmount > 0
              ? `<div class="summary-row bold">
                  <span>Change Returned:</span>
                  <span>৳${changeAmount.toFixed(2)}</span>
                </div>`
              : ""
          }

          ${
            dueAmount > 0
              ? `<div class="summary-row bold" style="font-size: 12px;">
                  <span>Due on Delivery:</span>
                  <span>৳${dueAmount.toFixed(2)}</span>
                </div>`
              : ""
          }

          <div class="divider"></div>

          ${
            showPolicy
              ? `<div class="text-center" style="font-size: 9px; margin-top: 6px; line-height: 1.3;">
                  <p style="margin: 2px 0;">${settings.footerNote || "Thank you for shopping with us!"}</p>
                  <p style="margin: 2px 0;">Retain receipt for exchange/warranty claims.</p>
                </div>`
              : ""
          }

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(receiptHtml);
    printWindow.document.close();
  };

  const handleCopyOrderNo = () => {
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[92vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="border-b pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">
                  POS Thermal Receipt
                </DialogTitle>
                <p className="text-xs text-muted-foreground">
                  Order #{order.orderNumber} • {order.customerName}
                </p>
              </div>
            </div>

            {/* Print Button */}
            <Button
              onClick={handlePrint}
              size="sm"
              className="gap-1.5 font-bold bg-emerald-600 hover:bg-emerald-700"
            >
              <Printer className="h-4 w-4" />
              Print Receipt
            </Button>
          </div>
        </DialogHeader>

        {/* Options Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-muted/40 rounded-lg border text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-muted-foreground">Roll Width:</span>
            <div className="inline-flex rounded-md border p-0.5 bg-background">
              <button
                type="button"
                onClick={() => setRollWidth("80mm")}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                  rollWidth === "80mm"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                80mm (Desktop POS)
              </button>
              <button
                type="button"
                onClick={() => setRollWidth("58mm")}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                  rollWidth === "58mm"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                58mm (Mobile POS)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showBarcode}
                onChange={(e) => setShowBarcode(e.target.checked)}
                className="rounded border-input text-primary size-3.5"
              />
              <span>Barcode</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showCustomerAddress}
                onChange={(e) => setShowCustomerAddress(e.target.checked)}
                className="rounded border-input text-primary size-3.5"
              />
              <span>Address</span>
            </label>
          </div>
        </div>

        {/* Receipt Live Visual Preview */}
        <div className="flex justify-center p-4 bg-zinc-100 dark:bg-zinc-950 rounded-xl border overflow-x-auto">
          <div
            ref={receiptRef}
            style={{ width: rollWidth === "58mm" ? "250px" : "330px" }}
            className="bg-white text-zinc-900 font-mono text-[11px] p-4 shadow-md rounded-sm border border-zinc-200"
          >
            {/* Header */}
            <div className="text-center space-y-0.5">
              <h3 className="font-black text-sm uppercase tracking-wide">
                {settings.storeName || "E-COMMERCE STORE"}
              </h3>
              {settings.storeAddress && (
                <p className="text-[10px] text-zinc-600">{settings.storeAddress}</p>
              )}
              {settings.supportPhone && (
                <p className="text-[10px] text-zinc-600">
                  Tel: {settings.supportPhone}
                </p>
              )}
              {settings.binNumber && (
                <p className="text-[9px] text-zinc-500">BIN: {settings.binNumber}</p>
              )}

              <div className="border-t border-dashed border-zinc-400 my-2" />

              {showBarcode && (
                <div className="font-bold text-sm tracking-widest my-1">
                  *{order.orderNumber}*
                </div>
              )}

              <div className="font-bold text-xs">ORDER #{order.orderNumber}</div>
              <div className="text-[10px] text-zinc-500">{formattedDate}</div>
              <div className="text-[10px] text-zinc-700">
                Channel: {order.source || "WEBSITE"}
              </div>
            </div>

            <div className="border-t border-dashed border-zinc-400 my-2" />

            {/* Customer Details */}
            <div className="space-y-0.5 text-[11px]">
              <div>
                Customer: <span className="font-bold">{order.customerName}</span>
              </div>
              <div>
                Phone: <span className="font-bold">{order.customerPhone}</span>
              </div>
              {showCustomerAddress && shippingAddr?.addressLine1 && (
                <div className="text-[10px] text-zinc-600 leading-tight">
                  Addr: {shippingAddr.addressLine1}
                  {shippingAddr.district ? `, ${shippingAddr.district}` : ""}
                </div>
              )}
            </div>

            <div className="border-t border-dashed border-zinc-400 my-2" />

            {/* Line Items Table */}
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-dashed border-zinc-400 text-[10px]">
                  <th className="pb-1 text-left">Item</th>
                  <th className="pb-1 text-center">Qty</th>
                  <th className="pb-1 text-right">Rate</th>
                  <th className="pb-1 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {(order.items || []).map((it) => (
                  <tr key={it.id} className="align-top">
                    <td className="py-1 pr-1">
                      <div className="font-semibold leading-tight line-clamp-2">
                        {it.productName}
                      </div>
                      <div className="text-[9px] text-zinc-500">SKU: {it.sku}</div>
                    </td>
                    <td className="py-1 text-center">{it.quantity}</td>
                    <td className="py-1 text-right">৳{Number(it.unitPrice).toFixed(0)}</td>
                    <td className="py-1 text-right font-bold">
                      ৳{Number(it.lineTotal).toFixed(0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t border-dashed border-zinc-400 my-2" />

            {/* Financial Summary */}
            <div className="space-y-1">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal:</span>
                <span>৳{subtotal.toFixed(2)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount:</span>
                  <span>-৳{discount.toFixed(2)}</span>
                </div>
              )}

              {shipping > 0 && (
                <div className="flex justify-between text-zinc-600">
                  <span>Delivery Charge:</span>
                  <span>৳{shipping.toFixed(2)}</span>
                </div>
              )}

              <div className="border-t border-zinc-900 my-1 pt-1 flex justify-between font-bold text-xs">
                <span>GRAND TOTAL:</span>
                <span>৳{grandTotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-zinc-600">
                <span>Payment Mode:</span>
                <span className="font-medium text-zinc-800">{order.paymentMethod}</span>
              </div>

              <div className="flex justify-between text-zinc-800 font-semibold">
                <span>Paid / Tendered:</span>
                <span>৳{advanceAmount.toFixed(2)}</span>
              </div>

              {changeAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Change Returned:</span>
                  <span>৳{changeAmount.toFixed(2)}</span>
                </div>
              )}

              {dueAmount > 0 && (
                <div className="flex justify-between text-rose-700 font-bold">
                  <span>Due on Delivery:</span>
                  <span>৳{dueAmount.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="border-t border-dashed border-zinc-400 my-3" />

            {/* Footer */}
            {showPolicy && (
              <div className="text-center text-[9px] text-zinc-500 space-y-0.5 leading-tight">
                <p>{settings.footerNote || "Thank you for shopping with us!"}</p>
                <p>Please preserve this receipt for exchange or warranty claims.</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
