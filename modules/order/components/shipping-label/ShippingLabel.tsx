"use client";

import React, { forwardRef } from "react";
import { format } from "date-fns";
import {
  Package,
  Phone,
  MapPin,
  Truck,
  AlertTriangle,
  ShieldCheck,
  CheckCircle,
  Tag,
} from "lucide-react";
import type { Order } from "../../order.types";
import { useInvoiceSettings } from "../../invoice-settings/useInvoiceSettings";
import type { ShippingLabelSize } from "../../invoice-settings/invoiceSettings";

export type { ShippingLabelSize };

export interface ShippingLabelOptions {
  size?: ShippingLabelSize;
  showMerchantReturn?: boolean;
  showItemsSummary?: boolean;
  showBarcodes?: boolean;
  merchantName?: string;
  merchantPhone?: string;
  merchantAddress?: string;
  merchantWebsite?: string;
  customNote?: string;
}

export interface ShippingLabelProps {
  order: Order;
  options?: ShippingLabelOptions;
  className?: string;
}

// ── Deterministic Crisp SVG Barcode Generator ─────────────────────────────────
export function ThermalBarcode({
  value,
  height = 42,
  widthScale = 2,
  className = "",
}: {
  value: string;
  height?: number;
  widthScale?: number;
  className?: string;
}) {
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

  let currentX = 4;
  const totalWidth = bars.reduce((acc, b) => acc + b.width * widthScale, 8);

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <svg
        className="w-full max-w-[280px]"
        style={{ height: `${height}px` }}
        viewBox={`0 0 ${totalWidth} ${height}`}
        fill="#000000"
        aria-hidden="true"
      >
        {bars.map((bar, idx) => {
          const x = currentX;
          currentX += bar.width * widthScale;
          if (bar.isSpace) return null;
          return (
            <rect
              key={idx}
              x={x}
              y={0}
              width={bar.width * widthScale}
              height={height}
            />
          );
        })}
      </svg>
      <span className="font-mono text-[11px] font-bold tracking-widest text-black mt-0.5">
        *{value}*
      </span>
    </div>
  );
}

// ── Primary Shipping Label Component ──────────────────────────────────────────
export const ShippingLabel = forwardRef<HTMLDivElement, ShippingLabelProps>(
  ({ order, options = {}, className = "" }, ref) => {
    const { settings } = useInvoiceSettings();
    const size = options.size ?? settings.defaultLabelSize ?? "A4";
    const showMerchantReturn = options.showMerchantReturn ?? settings.showMerchantReturn ?? true;
    const showItemsSummary = options.showItemsSummary ?? settings.showItemsSummary ?? true;
    const showBarcodes = options.showBarcodes ?? settings.showBarcodes ?? true;

    const merchantName = options.merchantName || settings.storeName || "NEXTGEN STORE";
    const merchantPhone = options.merchantPhone || settings.supportPhone || "+880 1876-346433";
    const merchantAddress = options.merchantAddress || settings.storeAddress || "Dhaka, Bangladesh";
    const merchantWebsite = options.merchantWebsite || settings.websiteUrl || "www.nextgen-shop.com";
    const customNote = options.customNote ?? settings.defaultDispatchNote;

    const shippingAddr =
      order.addresses?.find((a) => a.type === "SHIPPING") ??
      order.addresses?.[0];

    const recipientName =
      shippingAddr?.fullName || order.customerName || "Customer";
    const recipientPhone =
      shippingAddr?.phone || order.customerPhone || "N/A";

    const fullStreetAddress = [
      shippingAddr?.addressLine1,
      shippingAddr?.addressLine2,
      shippingAddr?.area,
    ]
      .filter(Boolean)
      .join(", ");

    const cityLocation = [
      shippingAddr?.upazila ? `${shippingAddr.upazila}` : null,
      shippingAddr?.district,
      shippingAddr?.postalCode ? `Postal: ${shippingAddr.postalCode}` : null,
      "Bangladesh",
    ]
      .filter(Boolean)
      .join(", ");

    const courierName =
      order.shipment?.courierName || order.shippingMethodName || "Steadfast Courier";
    const trackingNumber =
      order.shipment?.trackingNumber ||
      order.shipment?.consignmentId ||
      order.orderNumber;

    const placedDate = order.placedAt
      ? format(new Date(order.placedAt), "dd MMM yyyy, hh:mm a")
      : order.createdAt
      ? format(new Date(order.createdAt), "dd MMM yyyy")
      : "";

    const totalQuantity = (order.items || []).reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    const isPrepaid =
      order.paymentStatus === "PAID" ||
      Number(order.dueAmount ?? 0) <= 0;

    const codAmountToCollect = isPrepaid
      ? 0
      : Number(order.dueAmount || order.grandTotal || 0);

    const isA4 = size === "A4";
    const is4x6 = size === "4x6";

    return (
      <div
        ref={ref}
        className={`shipping-label-root bg-white text-black font-sans leading-tight print:shadow-none ${
          isA4
            ? "w-[130mm] max-w-[130mm] mx-auto p-[3.5mm] border-2 border-black"
            : is4x6
            ? "w-[100mm] max-w-[100mm] p-[2.5mm] border-2 border-black"
            : "w-[74mm] max-w-[74mm] p-[2mm] border-2 border-black"
        } ${className}`}
        style={{
          boxSizing: "border-box",
          color: "#000000",
          backgroundColor: "#ffffff",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          pageBreakInside: "avoid",
          breakInside: "avoid",
        }}
      >
        {/* ── HEADER: Merchant Return & Courier Routing ─────────────────────── */}
        <div className="border-b-2 border-black pb-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-sm font-black tracking-wider uppercase text-black">
                {merchantName}
              </h2>
              {showMerchantReturn && (
                <div className="text-[10px] text-black font-medium leading-tight mt-0.5">
                  <p>{merchantAddress}</p>
                  <p>Helpline: {merchantPhone}</p>
                </div>
              )}
            </div>

            <div className="text-right">
              <span className="inline-block border-2 border-black bg-black text-white px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-xs">
                {courierName}
              </span>
              <p className="text-[10px] font-bold text-black mt-1">
                ZONE: {order.shippingZoneName || "STANDARD"}
              </p>
            </div>
          </div>
        </div>

        {/* ── TRACKING / CONSIGNMENT BARCODE BLOCK ─────────────────────────── */}
        {showBarcodes && (
          <div className="border-b-2 border-black py-2 text-center bg-white">
            <p className="text-[10px] font-bold uppercase tracking-wider text-black mb-1">
              Tracking / Consignment ID
            </p>
            <ThermalBarcode value={trackingNumber} height={is4x6 ? 38 : 32} />
          </div>
        )}

        {/* ── RECIPIENT INFORMATION BLOCK (Crucial for Rider) ──────────────── */}
        <div className="border-b-2 border-black py-2.5">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest bg-black text-white px-1.5 py-0.5 rounded-xs">
              DELIVER TO (RECIPIENT)
            </span>
            <span className="text-[10px] font-mono font-bold text-black">
              DESTINATION HUB
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-base font-black text-black uppercase tracking-tight">
                {recipientName}
              </h3>
            </div>

            {/* Recipient Phone (Very prominent for delivery agent) */}
            <div className="border border-black bg-black/5 px-2 py-1 rounded-xs inline-flex items-center gap-2 w-full">
              <span className="text-[10px] font-bold uppercase text-black">
                MOBILE:
              </span>
              <span className="font-mono text-base font-black tracking-wide text-black">
                {recipientPhone}
              </span>
            </div>

            <div className="pt-0.5 text-xs text-black font-bold leading-snug">
              <p>{fullStreetAddress}</p>
              <p className="text-[11px] font-black text-black uppercase">
                {cityLocation}
              </p>
            </div>
          </div>
        </div>

        {/* ── COD / PAYMENT COLLECTION BLOCK (HIGHEST VISUAL EMPHASIS) ──────── */}
        <div className="border-b-2 border-black py-2">
          {isPrepaid ? (
            <div className="border-2 border-black bg-white p-2 text-center rounded-xs">
              <span className="block text-xs font-black uppercase tracking-wider text-black">
                ✓ PREPAID ORDER (PAID ONLINE)
              </span>
              <span className="block text-lg font-black text-black font-mono tracking-tight my-0.5">
                ৳ 0.00 TO COLLECT
              </span>
              <span className="block text-[10px] font-bold uppercase tracking-wide text-black">
                DO NOT COLLECT ANY CASH FROM CUSTOMER
              </span>
            </div>
          ) : (
            <div className="border-2 border-black bg-black text-white p-2 text-center rounded-xs">
              <span className="block text-xs font-black uppercase tracking-wider text-white">
                CASH ON DELIVERY (COD)
              </span>
              <span className="block text-2xl font-black text-white font-mono tracking-tight my-0.5">
                COLLECT: ৳ {codAmountToCollect.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
              </span>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-white">
                ★ PLEASE COLLECT EXACT CASH BEFORE HANDOVER ★
              </span>
            </div>
          )}
        </div>

        {/* ── ORDER REFERENCE & ITEM SUMMARY ──────────────────────────────── */}
        <div className="border-b-2 border-black py-2">
          <div className="flex items-center justify-between text-xs font-bold text-black border-b border-black/40 pb-1.5 mb-1.5">
            <div>
              <span className="text-[10px] text-black font-normal uppercase">Order: </span>
              <span className="font-mono font-black text-black">#{order.orderNumber}</span>
            </div>
            <div>
              <span className="text-[10px] text-black font-normal uppercase">Date: </span>
              <span className="text-[11px] text-black font-bold">{placedDate}</span>
            </div>
            <div>
              <span className="text-[10px] text-black font-normal uppercase">Items: </span>
              <span className="font-bold text-black">{totalQuantity} pcs</span>
            </div>
          </div>

          {/* Package items details */}
          {showItemsSummary && (
            <div className="space-y-1">
              <p className="text-[9px] font-black uppercase tracking-wider text-black">
                Package Contents ({order.items?.length || 0} product lines):
              </p>
              <div className="divide-y divide-black/20 text-[10px]">
                {((is4x6 || size === "80mm") && (order.items?.length || 0) > 4
                  ? order.items?.slice(0, 4)
                  : order.items
                )?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-1 py-1"
                  >
                    <div className="min-w-0 pr-1">
                      <p className="font-bold text-black truncate">
                        {item.productName}
                      </p>
                      {item.attributes && item.attributes.length > 0 && (
                        <p className="text-[9px] text-black font-medium">
                          {item.attributes
                            .map((a) => `${a.attributeName}: ${a.attributeValue}`)
                            .join(", ")}
                        </p>
                      )}
                      {item.sku && (
                        <p className="text-[8px] font-mono text-black font-medium">
                          SKU: {item.sku}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0 font-mono font-black">
                      Qty: {item.quantity}
                    </div>
                  </div>
                ))}

                {(is4x6 || size === "80mm") &&
                  (order.items?.length || 0) > 4 && (
                    <div className="py-1 text-[9px] font-bold text-black italic text-right">
                      + {(order.items?.length || 0) - 4} more item(s) (Total: {totalQuantity} pcs)
                    </div>
                  )}
              </div>
            </div>
          )}
        </div>

        {/* ── INSTRUCTIONS & SAFETY NOTICE ─────────────────────────────────── */}
        <div className="pt-2 text-[10px] text-black space-y-1">
          {order.customerNote && (
            <div className="border border-black bg-black/5 p-1 rounded-xs">
              <span className="font-bold uppercase text-[9px]">Customer Note: </span>
              <span className="italic">{order.customerNote}</span>
            </div>
          )}

          {options.customNote && (
            <div className="border border-black bg-black/5 p-1 rounded-xs">
              <span className="font-bold uppercase text-[9px]">Dispatch Note: </span>
              <span>{options.customNote}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-[9px] font-bold text-black pt-1 border-t border-black/30">
            <div className="flex items-center gap-1">
              <ShieldCheck className="size-3" />
              <span>FRAGILE - HANDLE WITH CARE</span>
            </div>
            <span>{merchantWebsite}</span>
          </div>

          <div className="text-center text-[8px] font-mono text-black/70 pt-0.5">
            Generated via NextGen Commerce Thermal Dispatch Engine
          </div>
        </div>
      </div>
    );
  }
);

ShippingLabel.displayName = "ShippingLabel";
