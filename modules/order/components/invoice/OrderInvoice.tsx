"use client";

import React, { forwardRef, useRef } from "react";
import { format } from "date-fns";
import {
  Printer,
  MapPin,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Package,
  Phone,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { mediaUrl } from "@/modules/catalog/catalog.utils";
import type { Order } from "../../order.types";

export interface OrderInvoiceProps {
  order: Order;
  /** Hide print/download action buttons in pure printable view */
  hideActions?: boolean;
  className?: string;
}

// ─── Currency Formatter ───────────────────────────────────────────────────────
function formatBDT(amount: number | string | undefined | null): string {
  const num = Number(amount) || 0;
  return `৳ ${num.toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// ─── Simple Deterministic SVG Barcode Generator ─────────────────────────────
function SvgBarcode({ value }: { value: string }) {
  const bars: { width: number; isSpace: boolean }[] = [];
  // Start guard
  bars.push(
    { width: 2, isSpace: false },
    { width: 1, isSpace: true },
    { width: 2, isSpace: false }
  );

  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
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

  // End guard
  bars.push(
    { width: 2, isSpace: false },
    { width: 1, isSpace: true },
    { width: 2, isSpace: false }
  );

  let currentX = 10;
  return (
    <div className="flex flex-col items-center">
      <svg
        className="h-9 w-44 text-black"
        viewBox="0 0 220 40"
        fill="currentColor"
        aria-hidden="true"
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
      <span className="font-mono text-[10px] tracking-widest text-gray-500 mt-0.5">
        *{value}*
      </span>
    </div>
  );
}

export const OrderInvoice = forwardRef<HTMLDivElement, OrderInvoiceProps>(
  ({ order, hideActions = false, className }, externalRef) => {
    const internalRef = useRef<HTMLDivElement>(null);
    const printRef = (externalRef as React.RefObject<HTMLDivElement>) || internalRef;

    // ─── Bulletproof Clean Print Engine (via Hidden Iframe) ───────────────────
    const handlePrint = () => {
      const invoiceElement = printRef.current;
      if (!invoiceElement) {
        window.print();
        return;
      }

      // Create an isolated iframe to print only the invoice without modal clipping
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
        return;
      }

      let styles = "";
      document
        .querySelectorAll('link[rel="stylesheet"], style')
        .forEach((node) => {
          styles += node.outerHTML;
        });

      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Invoice - ${order.orderNumber}</title>
            ${styles}
            <style>
              @page {
                size: A4 portrait;
                margin: 10mm 12mm;
              }
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                box-sizing: border-box;
              }
              body {
                background: #ffffff !important;
                color: #111827 !important;
                margin: 0 !important;
                padding: 0 !important;
                font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
              }
              .print-container {
                max-width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                border: none !important;
                box-shadow: none !important;
              }
            </style>
          </head>
          <body>
            <div class="print-container">
              ${invoiceElement.innerHTML}
            </div>
          </body>
        </html>
      `);
      doc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch {
          window.print();
        } finally {
          setTimeout(() => {
            iframe.remove();
          }, 1500);
        }
      }, 350);
    };

    const shippingAddr =
      order.addresses?.find((a) => a.type === "SHIPPING") ??
      order.addresses?.[0];

    const formattedDate = order.placedAt
      ? format(new Date(order.placedAt), "dd MMMM yyyy, hh:mm a")
      : format(new Date(order.createdAt), "dd MMMM yyyy");

    const isPaid = order.paymentStatus === "PAID";
    const isCOD = order.paymentMethod === "CASH_ON_DELIVERY";

    return (
      <div className={cn("space-y-4 w-full", className)}>
        {/* ── Action Toolbar (Hidden during print) ── */}
        {!hideActions && (
          <div className="flex items-center justify-between gap-3 rounded-xl border bg-card p-3 print:hidden">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Printer className="size-4 text-primary" />
              <span className="font-medium">
                Official A4 Tax Invoice & Delivery Packing Slip
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handlePrint}
                className="h-8 gap-1.5 text-xs font-semibold cursor-pointer shadow-xs"
              >
                <Printer className="size-3.5" />
                Print / Save PDF
              </Button>
            </div>
          </div>
        )}

        {/* ── Printable Invoice Document Container ── */}
        <div
          ref={printRef}
          className="mx-auto bg-white text-gray-900 p-6 sm:p-10 rounded-xl border shadow-sm print:border-none print:shadow-none print:p-0 print:m-0 w-full max-w-4xl"
          style={{ minHeight: "297mm", color: "#111827", backgroundColor: "#ffffff" }}
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b pb-6">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="size-10 rounded-lg bg-black text-white flex items-center justify-center font-black text-xl shadow-xs">
                  S
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-tight text-black">
                    STORE<span className="text-gray-500">.</span>
                  </h1>
                  <p className="text-[11px] text-gray-500 font-semibold tracking-wide uppercase">
                    Official Order Invoice & Delivery Packing Slip
                  </p>
                </div>
              </div>

              <div className="mt-3 text-xs text-gray-600 space-y-0.5">
                <p className="font-medium text-gray-800">
                  Dhaka, Bangladesh
                </p>
                <p>Support Helpline: +880 1876-346433 | support@ecom.store</p>
                <p>VAT Reg / BIN: 002948192-0102</p>
              </div>
            </div>

            <div className="flex flex-col items-start sm:items-end">
              <SvgBarcode value={order.orderNumber} />
              <div className="mt-2 text-left sm:text-right">
                <p className="text-xs font-bold text-gray-900 font-mono">
                  INV: #{order.orderNumber}
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Date: {formattedDate}
                </p>
                <div className="mt-1 flex items-center gap-1.5 sm:justify-end">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-gray-300 bg-gray-50 text-gray-700">
                    STATUS: {order.status}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded border",
                      isPaid
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                        : "bg-amber-50 text-amber-800 border-amber-300"
                    )}
                  >
                    {isPaid ? "PAID" : "COD (UNPAID)"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Three-Box Metadata Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6 text-xs">
            {/* Box 1: Customer Details */}
            <div className="border border-gray-200 rounded-lg p-3.5 bg-gray-50/60">
              <p className="font-bold text-gray-900 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                <MapPin className="size-3.5 text-gray-700" /> Deliver To (Customer)
              </p>
              {shippingAddr ? (
                <div className="space-y-1 text-gray-700">
                  <p className="font-bold text-gray-900 text-sm">
                    {shippingAddr.fullName || order.customerName}
                  </p>
                  <p className="font-semibold text-gray-800 flex items-center gap-1">
                    <Phone className="size-3 text-gray-500 inline" />{" "}
                    {shippingAddr.phone || order.customerPhone}
                  </p>
                  {order.customerEmail && (
                    <p className="text-gray-600 truncate">
                      <Mail className="size-3 text-gray-500 inline mr-1" />
                      {order.customerEmail}
                    </p>
                  )}
                  <p className="leading-tight pt-1 text-gray-800 font-medium">
                    {shippingAddr.addressLine1}
                    {shippingAddr.addressLine2
                      ? `, ${shippingAddr.addressLine2}`
                      : ""}
                    {shippingAddr.area ? `, ${shippingAddr.area}` : ""}
                  </p>
                  <p className="text-gray-700">
                    {shippingAddr.upazila ? `${shippingAddr.upazila}, ` : ""}
                    {shippingAddr.district}
                    {shippingAddr.postalCode
                      ? ` - ${shippingAddr.postalCode}`
                      : ""}
                    , Bangladesh
                  </p>
                </div>
              ) : (
                <div className="space-y-1 text-gray-700">
                  <p className="font-bold text-gray-900 text-sm">
                    {order.customerName}
                  </p>
                  {order.customerPhone && (
                    <p className="font-semibold text-gray-800">
                      Phone: {order.customerPhone}
                    </p>
                  )}
                  {order.customerEmail && (
                    <p className="text-gray-600">Email: {order.customerEmail}</p>
                  )}
                  <p className="text-gray-500 italic pt-1">
                    Customer address on file
                  </p>
                </div>
              )}
            </div>

            {/* Box 2: Courier & Dispatch Details */}
            <div className="border border-gray-200 rounded-lg p-3.5 bg-gray-50/60">
              <p className="font-bold text-gray-900 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                <Truck className="size-3.5 text-gray-700" /> Logistics & Courier
              </p>
              <div className="space-y-1 text-gray-700">
                <p>
                  <span className="text-gray-500">Courier Partner:</span>{" "}
                  <strong className="text-gray-900">
                    {order.shipment?.courierName ||
                      "Standard Delivery (Pending Courier Handover)"}
                  </strong>
                </p>
                <p>
                  <span className="text-gray-500">Tracking Code:</span>{" "}
                  <strong className="font-mono text-gray-900">
                    {order.shipment?.trackingNumber ||
                      "Assigned on Courier Pickup"}
                  </strong>
                </p>
                <p>
                  <span className="text-gray-500">Shipping Zone:</span>{" "}
                  <span className="font-medium text-gray-900">
                    {order.shippingZoneName || "Bangladesh"}
                  </span>
                </p>
                <p>
                  <span className="text-gray-500">Delivery Method:</span>{" "}
                  <span className="font-medium text-gray-900">
                    {order.shippingMethodName || "Standard Delivery"}
                  </span>
                </p>
              </div>
            </div>

            {/* Box 3: Payment Summary & Collection */}
            <div className="border border-gray-200 rounded-lg p-3.5 bg-gray-50/60">
              <p className="font-bold text-gray-900 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-gray-700" /> Payment & Collection
              </p>
              <div className="space-y-1 text-gray-700">
                <p>
                  <span className="text-gray-500">Payment Mode:</span>{" "}
                  <strong className="text-gray-900">
                    {order.paymentMethod === "PARTIAL_COD" || order.isAdvanceRequired
                      ? "Partial Advance + COD"
                      : isCOD
                      ? "Cash on Delivery (COD)"
                      : "Online Pre-paid"}
                  </strong>
                </p>
                <p>
                  <span className="text-gray-500">Payment Status:</span>{" "}
                  <strong
                    className={
                      isPaid
                        ? "text-emerald-700 font-bold"
                        : order.paymentStatus === "PARTIALLY_PAID"
                        ? "text-blue-700 font-bold"
                        : "text-amber-700 font-bold"
                    }
                  >
                    {order.paymentStatus}
                  </strong>
                </p>
                <div className="pt-2 border-t mt-2">
                  <p className="text-[11px] text-gray-500">
                    {order.paymentMethod === "PARTIAL_COD" || order.isAdvanceRequired
                      ? `Delivery Agent: Collect Due Cash of ৳${Number(order.dueAmount || 0).toFixed(2)} upon Handover`
                      : isPaid
                      ? "Paid Online. Do NOT collect cash."
                      : "Delivery Agent: Collect Cash upon Handover"}
                  </p>
                  <p className="text-base font-black text-gray-900 font-mono mt-0.5">
                    {order.paymentMethod === "PARTIAL_COD" || order.isAdvanceRequired
                      ? `Due: ${formatBDT(order.dueAmount || 0)} (Total: ${formatBDT(order.grandTotal)})`
                      : formatBDT(order.grandTotal)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Note if exists */}
          {order.customerNote && (
            <div className="mb-6 rounded-lg bg-yellow-50 border border-yellow-200 p-2.5 text-xs text-yellow-900">
              <strong className="font-bold">Customer Delivery Note:</strong> &ldquo;
              {order.customerNote}&rdquo;
            </div>
          )}

          {/* Order Items Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden my-6">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-100 border-b border-gray-200 text-gray-700 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">#</th>
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3 text-right">Unit Price</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-800">
                {order.items?.map((item, idx) => {
                  const itemImg =
                    item.product?.images?.find((img) => img.isPrimary)?.imageUrl ||
                    item.product?.images?.[0]?.imageUrl;

                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50">
                      <td className="py-2.5 px-3 text-center text-gray-500">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-start gap-2.5">
                          <div className="size-11 shrink-0 rounded-md border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center">
                            {itemImg ? (
                              <img
                                src={mediaUrl(itemImg)}
                                alt={item.productName}
                                className="size-full object-cover"
                                crossOrigin="anonymous"
                              />
                            ) : (
                              <Package className="size-4 text-gray-400" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-gray-900 leading-snug">
                              {item.productName}
                            </p>
                            {item.attributes && item.attributes.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {item.attributes.map((a, i) => (
                                  <span
                                    key={i}
                                    className="inline-flex items-center px-1.5 py-0.5 rounded bg-gray-100 text-[10px] font-semibold text-gray-700 border border-gray-200"
                                  >
                                    {a.attributeName}: {a.attributeValue}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-gray-600">
                        {item.sku}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                        {formatBDT(item.unitPrice)}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold">
                        {item.quantity}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-gray-900 tabular-nums">
                        {formatBDT(item.lineTotal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Calculation Summary Bottom Block */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b pb-6">
            <div className="text-xs text-gray-600 space-y-1.5 max-w-sm">
              <p className="font-bold text-gray-900 uppercase tracking-wider text-[11px]">
                Important Terms & Return Policy:
              </p>
              <p className="text-[11px] leading-relaxed">
                1. Please inspect the parcel and verify all items in front of the delivery agent.
              </p>
              <p className="text-[11px] leading-relaxed">
                2. If any discrepancy or damaged product is found, please notify customer support within 24 hours.
              </p>
              <p className="text-[11px] leading-relaxed">
                3. Retain this invoice copy for warranty claims and hassle-free exchange.
              </p>
            </div>

            <div className="w-full sm:w-80 space-y-2 text-xs">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal ({order.items?.length || 0} items):</span>
                <span className="font-mono font-medium tabular-nums">
                  {formatBDT(order.subtotal)}
                </span>
              </div>

              <div className="flex justify-between text-gray-700">
                <span>Shipping & Delivery Fee:</span>
                <span className="font-mono font-medium tabular-nums">
                  {Number(order.shippingCharge) === 0
                    ? "FREE"
                    : formatBDT(order.shippingCharge)}
                </span>
              </div>

              {Number(order.discountAmount) > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Discount ({order.couponCode || "Coupon"}):</span>
                  <span className="font-mono tabular-nums">
                    -{formatBDT(order.discountAmount)}
                  </span>
                </div>
              )}

              {Number(order.taxAmount) > 0 && (
                <div className="flex justify-between text-gray-700">
                  <span>Tax / VAT:</span>
                  <span className="font-mono tabular-nums">
                    +{formatBDT(order.taxAmount)}
                  </span>
                </div>
              )}

              <div className="border-t-2 border-gray-900 pt-2 flex justify-between items-baseline font-bold text-gray-900">
                <span className="text-sm uppercase tracking-wide">Total Order Value:</span>
                <span className="text-lg font-black text-black font-mono tabular-nums">
                  {formatBDT(order.grandTotal)}
                </span>
              </div>

              {(order.isAdvanceRequired || Number(order.advanceAmount || 0) > 0) && (
                <div className="pt-2 border-t border-dashed space-y-1 text-xs">
                  <div className="flex justify-between text-gray-700">
                    <span>Advance Payment (Paid/Verified):</span>
                    <span className="font-mono font-bold text-amber-700 tabular-nums">
                      {formatBDT(order.advanceAmount || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-900 font-bold border-t pt-1">
                    <span>Due on Delivery (COD to Collect):</span>
                    <span className="font-mono text-sm tabular-nums text-emerald-800">
                      {formatBDT(order.dueAmount || 0)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Signature and Verification Footer */}
          <div className="mt-12 pt-6 grid grid-cols-2 gap-8 text-xs text-center">
            <div>
              <div className="border-b border-gray-400 w-44 mx-auto mb-1.5" />
              <p className="font-bold text-gray-800">Customer Signature</p>
              <p className="text-[10px] text-gray-500">Received in good condition</p>
            </div>

            <div>
              <div className="border-b border-gray-400 w-44 mx-auto mb-1.5" />
              <p className="font-bold text-gray-800">Authorized Signature & Seal</p>
              <p className="text-[10px] text-gray-500">For Store</p>
            </div>
          </div>

          {/* System Footer */}
          <div className="mt-10 text-center border-t pt-4 text-[10px] text-gray-400">
            This is a computer-generated tax invoice and packing slip. No physical stamp required.
          </div>
        </div>
      </div>
    );
  }
);

OrderInvoice.displayName = "OrderInvoice";
