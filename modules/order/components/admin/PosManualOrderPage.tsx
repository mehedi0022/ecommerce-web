"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import {
  ScanBarcode,
  Search,
  Plus,
  Minus,
  Trash2,
  Printer,
  Receipt,
  ShoppingBag,
  Store,
  Truck,
  Phone,
  MessageCircle,
  Globe,
  User,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  DollarSign,
  Layers,
  X,
  ExternalLink,
  Percent,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CheckoutAddressForm } from "@/modules/checkout/components/CheckoutAddressForm";
import type { CheckoutAddress } from "@/modules/checkout/checkout.types";
import { mediaUrl } from "@/modules/catalog/catalog.utils";
import { OrderThermalReceiptModal } from "../invoice/OrderThermalReceiptModal";
import {
  useSearchPosProductsQuery,
  useSearchPosCustomersQuery,
  useCreateManualOrderMutation,
} from "../../orderApi";
import type {
  OrderSource,
  PosProduct,
  PosProductVariant,
  PosCustomer,
  ManualOrderItemInput,
  Order,
} from "../../order.types";

interface CartItem {
  productId: number;
  variantId: number;
  productName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  imageUrl?: string;
  attributeValuesSummary: string;
  availableStock: number;
}

const ORDER_SOURCES: Array<{
  value: OrderSource;
  label: string;
  icon: any;
  color: string;
}> = [
  { value: "OUTLET_POS", label: "Outlet POS", icon: Store, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  { value: "PHONE_CALL", label: "Phone Call", icon: Phone, color: "text-blue-600 bg-blue-50 border-blue-200" },
  { value: "WHATSAPP", label: "WhatsApp", icon: MessageCircle, color: "text-green-600 bg-green-50 border-green-200" },
  { value: "MESSENGER", label: "Messenger", icon: MessageCircle, color: "text-purple-600 bg-purple-50 border-purple-200" },
  { value: "WEBSITE", label: "Direct Website", icon: Globe, color: "text-indigo-600 bg-indigo-50 border-indigo-200" },
  { value: "MANUAL_OTHER", label: "Other Manual", icon: ShoppingBag, color: "text-gray-600 bg-gray-50 border-gray-200" },
];

export function PosManualOrderPage() {
  const router = useRouter();

  // Mode & Source state
  const [source, setSource] = useState<OrderSource>("OUTLET_POS");
  const [fulfillmentType, setFulfillmentType] = useState<"DELIVERY" | "STORE_PICKUP">("STORE_PICKUP");

  // Search states
  const [productSearch, setProductSearch] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);

  // Selected / active Customer state
  const [selectedCustomer, setSelectedCustomer] = useState<PosCustomer | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  // Delivery Address state
  const [shippingAddress, setShippingAddress] = useState<CheckoutAddress>({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    divisionId: "",
    districtId: "",
    upazilaId: "",
    unionId: "",
    division: "",
    district: "",
    upazila: "",
    thana: "",
    area: "",
    postalCode: "",
    countryCode: "BD",
  });

  // Financial adjustments
  const [shippingFee, setShippingFee] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [tenderedAmount, setTenderedAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<"CASH_ON_DELIVERY" | "ONLINE" | "PARTIAL_COD">("CASH_ON_DELIVERY");
  const [paymentMethodCode, setPaymentMethodCode] = useState<string>("CASH");
  const [customerNote, setCustomerNote] = useState("");
  const [adminNote, setAdminNote] = useState("");

  // Modal states
  const [variantModalProduct, setVariantModalProduct] = useState<PosProduct | null>(null);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isThermalReceiptModalOpen, setIsThermalReceiptModalOpen] = useState(false);

  // Audio synthesizer beep for POS scanner confirmation
  const playBeep = (freq = 880, duration = 0.08) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (_) {}
  };

  // Barcode input ref for fast keyboard scanning
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // API Queries
  const { data: productsData, isFetching: isSearchingProducts } = useSearchPosProductsQuery(productSearch, {
    refetchOnMountOrArgChange: true,
  });

  const { data: customerData, isFetching: isSearchingCustomers } = useSearchPosCustomersQuery(customerSearch, {
    skip: !customerSearch || customerSearch.trim().length < 2,
  });

  const [createManualOrder, { isLoading: isSubmitting }] = useCreateManualOrderMutation();

  const products = productsData?.data || [];
  const customers = customerData?.data || [];

  // When switching fulfillment type, update defaults
  useEffect(() => {
    if (fulfillmentType === "STORE_PICKUP") {
      setShippingFee(0);
      setPaymentMethod("ONLINE");
      setPaymentMethodCode("CASH");
    } else {
      if (shippingFee === 0) setShippingFee(60);
      setPaymentMethod("CASH_ON_DELIVERY");
      setPaymentMethodCode("COD");
    }
  }, [fulfillmentType]);

  // When selecting an order source
  const handleSelectSource = (s: OrderSource) => {
    setSource(s);
    if (s === "OUTLET_POS") {
      setFulfillmentType("STORE_PICKUP");
    } else {
      setFulfillmentType("DELIVERY");
    }
  };

  // Keyboard shortcut: F2 focuses Barcode Scanner
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F2") {
        e.preventDefault();
        barcodeInputRef.current?.focus();
        barcodeInputRef.current?.select();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Cart Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  }, [cart]);

  const effectiveShippingFee = fulfillmentType === "STORE_PICKUP" ? 0 : Number(shippingFee) || 0;
  const effectiveDiscount = Math.min(Number(discountAmount) || 0, subtotal);
  const grandTotal = Math.max(0, subtotal + effectiveShippingFee - effectiveDiscount);

  // Change / Due calculations
  const changeAmount = useMemo(() => {
    if (tenderedAmount > grandTotal) {
      return tenderedAmount - grandTotal;
    }
    return 0;
  }, [tenderedAmount, grandTotal]);

  const dueAmount = useMemo(() => {
    if (tenderedAmount < grandTotal) {
      return grandTotal - tenderedAmount;
    }
    return 0;
  }, [tenderedAmount, grandTotal]);

  // Set default tendered amount for outlet counter sales
  useEffect(() => {
    if (fulfillmentType === "STORE_PICKUP" && grandTotal > 0 && tenderedAmount === 0) {
      setTenderedAmount(grandTotal);
    }
  }, [fulfillmentType, grandTotal, tenderedAmount]);

  // Add Item to Cart
  const addToCart = (product: PosProduct, variant: PosProductVariant) => {
    if (!variant) {
      toast.error("No variant available for this product.");
      return;
    }
    const price = Number(variant.price) || 0;
    const availableStock = variant.inventory?.availableQuantity ?? 99;

    const summary = (variant.attributeValues || [])
      .map((av: any) => av.attributeValue?.value)
      .filter(Boolean)
      .join(" / ");

    setCart((prev) => {
      const existingIdx = prev.findIndex((item) => item.variantId === variant.id);
      if (existingIdx >= 0) {
        const updated = [...prev];
        const newQty = updated[existingIdx].quantity + 1;
        if (newQty > availableStock) {
          toast.warning(`Warning: Only ${availableStock} units available in stock.`);
        }
        updated[existingIdx].quantity = newQty;
        return updated;
      }

      const rawImg = product.images?.find((img) => img.isPrimary)?.imageUrl || product.images?.[0]?.imageUrl;
      const primaryImg = rawImg ? mediaUrl(rawImg) : undefined;

      return [
        ...prev,
        {
          productId: product.id,
          variantId: variant.id,
          productName: product.name,
          sku: variant.sku,
          unitPrice: price,
          quantity: 1,
          imageUrl: primaryImg,
          attributeValuesSummary: summary,
          availableStock,
        },
      ];
    });

    playBeep(920, 0.07);
    toast.success(`Added ${product.name} to order`);
  };

  // Barcode / SKU scan submit
  const handleBarcodeScan = (e: React.FormEvent) => {
    e.preventDefault();
    const barcode = barcodeInput.trim();
    if (!barcode) return;
    playBeep(1100, 0.05);

    // Search through currently loaded products or find matching SKU
    let foundProduct: PosProduct | null = null;
    let foundVariant: PosProductVariant | null = null;

    for (const p of products) {
      for (const v of p.variants) {
        const matchesSku = v.sku.toLowerCase() === barcode.toLowerCase();
        const matchesBarcode = Boolean(v.barcode && v.barcode.toLowerCase() === barcode.toLowerCase());
        if (matchesSku || matchesBarcode) {
          foundProduct = p;
          foundVariant = v;
          break;
        }
      }
      if (foundVariant) break;
    }

    if (foundProduct && foundVariant) {
      addToCart(foundProduct, foundVariant);
      setBarcodeInput("");
      barcodeInputRef.current?.focus();
    } else {
      // Trigger API query by setting productSearch to the barcode
      setProductSearch(barcode);
      toast.info(`Searching catalog for barcode/SKU: ${barcode}`);
    }
  };

  // Quantity adjustments
  const updateQuantity = (variantId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.variantId === variantId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const setDirectQuantity = (variantId: number, quantity: number) => {
    if (quantity < 1) return;
    setCart((prev) =>
      prev.map((item) => (item.variantId === variantId ? { ...item, quantity } : item))
    );
  };

  const updateItemPrice = (variantId: number, unitPrice: number) => {
    if (unitPrice < 0) return;
    setCart((prev) =>
      prev.map((item) => (item.variantId === variantId ? { ...item, unitPrice } : item))
    );
  };

  const removeFromCart = (variantId: number) => {
    setCart((prev) => prev.filter((item) => item.variantId !== variantId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscountAmount(0);
    setTenderedAmount(0);
    setCustomerNote("");
    setAdminNote("");
  };

  // Handle Customer Selection
  const handleSelectCustomer = (c: PosCustomer) => {
    setSelectedCustomer(c);
    setCustomerName(c.fullName || "");
    setCustomerPhone(c.phone || "");
    setCustomerEmail(c.email || "");

    const defaultAddr = c.addresses?.find((a) => a.isDefaultShipping) || c.addresses?.[0];
    if (defaultAddr) {
      setShippingAddress({
        fullName: defaultAddr.fullName || c.fullName || "",
        phone: defaultAddr.phone || c.phone || "",
        addressLine1: defaultAddr.addressLine1 || "",
        addressLine2: defaultAddr.addressLine2 || "",
        divisionId: defaultAddr.divisionId || "",
        districtId: defaultAddr.districtId || "",
        upazilaId: defaultAddr.upazilaId || "",
        unionId: defaultAddr.unionId || "",
        division: defaultAddr.division || "",
        district: defaultAddr.district || "",
        upazila: defaultAddr.upazila || "",
        thana: defaultAddr.thana || "",
        area: defaultAddr.area || "",
        postalCode: defaultAddr.postalCode || "",
        countryCode: defaultAddr.countryCode || "BD",
      });
    }

    setIsCustomerDropdownOpen(false);
    setCustomerSearch("");
    toast.success(`Selected customer: ${c.fullName} (${c.phone})`);
  };

  const handleClearCustomer = () => {
    setSelectedCustomer(null);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerEmail("");
  };

  // Reset entire form
  const handleResetForm = () => {
    clearCart();
    handleClearCustomer();
    setShippingAddress({
      fullName: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      divisionId: "",
      districtId: "",
      upazilaId: "",
      unionId: "",
      division: "",
      district: "",
      upazila: "",
      thana: "",
      area: "",
      postalCode: "",
      countryCode: "BD",
    });
    setSource("OUTLET_POS");
    setFulfillmentType("STORE_PICKUP");
    setShippingFee(0);
    toast.info("Order form reset");
  };

  // Submit Order Creation
  const handleCreateOrder = async () => {
    if (cart.length === 0) {
      toast.error("Please add at least one product to the order.");
      return;
    }

    const cName = customerName.trim() || (fulfillmentType === "STORE_PICKUP" ? "Counter Walk-in Customer" : "");
    const cPhone = customerPhone.trim() || (fulfillmentType === "STORE_PICKUP" ? "01000000000" : "");

    if (!cName) {
      toast.error("Customer name is required.");
      return;
    }

    if (!cPhone || cPhone.length < 6) {
      toast.error("Valid customer phone number is required.");
      return;
    }

    if (fulfillmentType === "DELIVERY") {
      if (!shippingAddress.addressLine1?.trim()) {
        toast.error("Street delivery address is required for courier delivery.");
        return;
      }
      if (!shippingAddress.district?.trim() && !shippingAddress.districtId) {
        toast.error("District selection is required for courier delivery.");
        return;
      }
    }

    const isStorePickup = fulfillmentType === "STORE_PICKUP";
    const advancePaid = isStorePickup ? grandTotal : Math.min(tenderedAmount, grandTotal);

    const itemsPayload: ManualOrderItemInput[] = cart.map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      productName: item.productName,
      sku: item.sku,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    }));

    try {
      const res = await createManualOrder({
        source,
        fulfillmentType,
        customerId: selectedCustomer?.id ?? null,
        customerName: cName,
        customerPhone: cPhone,
        customerEmail: customerEmail.trim() || null,
        shippingAddress: isStorePickup
          ? null
          : {
              ...shippingAddress,
              fullName: shippingAddress.fullName || cName,
              phone: shippingAddress.phone || cPhone,
            },
        items: itemsPayload,
        shippingFee: effectiveShippingFee,
        discountAmount: effectiveDiscount,
        advanceAmount: advancePaid,
        paymentMethod: isStorePickup ? "ONLINE" : paymentMethod,
        paymentMethodCode,
        paymentStatus:
          isStorePickup || advancePaid >= grandTotal
            ? "PAID"
            : advancePaid > 0
            ? "PARTIALLY_PAID"
            : "UNPAID",
        orderStatus: isStorePickup ? "DELIVERED" : "CONFIRMED",
        customerNote: customerNote.trim() || undefined,
        adminNote: adminNote.trim() || undefined,
      }).unwrap();

      if (res.success && res.data) {
        setCreatedOrder(res.data);
        setIsSuccessModalOpen(true);
        toast.success(`Order created successfully: ${res.data.orderNumber}`);
      }
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Failed to create order";
      toast.error(msg);
    }
  };

  // Thermal Receipt Printing Helper
  const handlePrintThermalReceipt = () => {
    if (!createdOrder) return;

    const printWindow = window.open("", "_blank", "width=400,height=600");
    if (!printWindow) {
      toast.error("Please allow popups to print the receipt.");
      return;
    }

    const itemsHtml = (createdOrder.items || [])
      .map(
        (it) => `
        <tr>
          <td style="padding: 4px 0; font-size: 11px;">
            ${it.productName}<br/>
            <span style="color: #666; font-size: 10px;">SKU: ${it.sku}</span>
          </td>
          <td style="text-align: center; padding: 4px 0; font-size: 11px;">${it.quantity}</td>
          <td style="text-align: right; padding: 4px 0; font-size: 11px;">৳${Number(it.unitPrice).toFixed(0)}</td>
          <td style="text-align: right; padding: 4px 0; font-size: 11px; font-weight: bold;">৳${Number(it.lineTotal).toFixed(0)}</td>
        </tr>
      `
      )
      .join("");

    const receiptHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt #${createdOrder.orderNumber}</title>
          <style>
            @page {
              size: 80mm auto;
              margin: 0;
            }
            body {
              font-family: 'Courier New', Courier, monospace, sans-serif;
              width: 76mm;
              margin: 2mm auto;
              padding: 4px;
              color: #000;
              font-size: 12px;
              line-height: 1.3;
            }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .bold { font-weight: bold; }
            .divider { border-top: 1px dashed #000; margin: 6px 0; }
            .divider-double { border-top: 2px solid #000; margin: 6px 0; }
            table { width: 100%; border-collapse: collapse; }
            th { border-bottom: 1px dashed #000; padding: 4px 0; font-size: 11px; }
            .summary-row { display: flex; justify-content: space-between; padding: 2px 0; font-size: 12px; }
            .barcode { letter-spacing: 4px; font-weight: bold; font-size: 16px; margin: 8px 0; }
          </style>
        </head>
        <body>
          <div class="text-center">
            <h2 style="margin: 0; font-size: 18px; text-transform: uppercase;">E-Commerce Store</h2>
            <p style="margin: 2px 0; font-size: 10px;">Counter POS & Sales Receipt</p>
            <p style="margin: 2px 0; font-size: 10px;">Date: ${new Date().toLocaleString()}</p>
            <div class="divider"></div>
            <div class="barcode">*${createdOrder.orderNumber}*</div>
            <p style="margin: 2px 0; font-size: 11px;">Order: <strong>${createdOrder.orderNumber}</strong></p>
            <p style="margin: 2px 0; font-size: 11px;">Customer: ${createdOrder.customerName}</p>
            <p style="margin: 2px 0; font-size: 11px;">Phone: ${createdOrder.customerPhone}</p>
            <p style="margin: 2px 0; font-size: 10px;">Channel: ${createdOrder.source || source}</p>
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
            <span>৳${Number(createdOrder.subtotal).toFixed(2)}</span>
          </div>
          ${
            Number(createdOrder.discountAmount) > 0
              ? `<div class="summary-row">
                  <span>Discount:</span>
                  <span>-৳${Number(createdOrder.discountAmount).toFixed(2)}</span>
                </div>`
              : ""
          }
          ${
            Number(createdOrder.shippingCharge) > 0
              ? `<div class="summary-row">
                  <span>Delivery Charge:</span>
                  <span>৳${Number(createdOrder.shippingCharge).toFixed(2)}</span>
                </div>`
              : ""
          }
          <div class="divider-double"></div>
          <div class="summary-row bold" style="font-size: 14px;">
            <span>GRAND TOTAL:</span>
            <span>৳${Number(createdOrder.grandTotal).toFixed(2)}</span>
          </div>
          <div class="summary-row">
            <span>Payment Method:</span>
            <span>${createdOrder.paymentMethod}</span>
          </div>
          <div class="summary-row">
            <span>Paid Amount:</span>
            <span>৳${Number(createdOrder.advanceAmount ?? createdOrder.grandTotal).toFixed(2)}</span>
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
            Number(createdOrder.dueAmount) > 0
              ? `<div class="summary-row bold" style="color: #d00;">
                  <span>Due on Delivery:</span>
                  <span>৳${Number(createdOrder.dueAmount).toFixed(2)}</span>
                </div>`
              : ""
          }

          <div class="divider"></div>
          <div class="text-center" style="margin-top: 10px; font-size: 10px;">
            <p style="margin: 2px 0;">Thank you for shopping with us!</p>
            <p style="margin: 2px 0;">Please retain this receipt for warranty/exchange.</p>
          </div>

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

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Store className="size-6 text-primary" />
            POS & Manual Order Entry
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create walk-in outlet counter orders, phone call bookings, WhatsApp/Messenger sales, or direct orders.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleResetForm} className="gap-1.5 text-xs h-9">
            <RotateCcw className="size-3.5" />
            Reset Form
          </Button>
          <Link href="/admin/orders">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-9">
              <ShoppingBag className="size-3.5" />
              All Orders
            </Button>
          </Link>
        </div>
      </div>

      {/* Channel / Order Source Selection */}
      <Card className="border shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Select Order Channel / Source:
              </span>
              <div className="flex flex-wrap gap-2 mt-2">
                {ORDER_SOURCES.map((s) => {
                  const Icon = s.icon;
                  const isSelected = source === s.value;
                  return (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => handleSelectSource(s.value)}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                        isSelected
                          ? `${s.color} ring-2 ring-primary/40 shadow-sm font-semibold`
                          : "bg-background border-zinc-200 hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fulfillment Toggle */}
            <div className="border-t md:border-t-0 md:border-l pt-3 md:pt-0 md:pl-6 flex flex-col justify-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Fulfillment Type:
              </span>
              <div className="inline-flex rounded-lg border p-1 bg-muted/40">
                <button
                  type="button"
                  onClick={() => setFulfillmentType("STORE_PICKUP")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    fulfillmentType === "STORE_PICKUP"
                      ? "bg-white dark:bg-zinc-800 shadow-sm text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Store className="h-3.5 w-3.5" />
                  Outlet POS / Counter Pickup
                </button>
                <button
                  type="button"
                  onClick={() => setFulfillmentType("DELIVERY")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    fulfillmentType === "DELIVERY"
                      ? "bg-white dark:bg-zinc-800 shadow-sm text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Truck className="h-3.5 w-3.5" />
                  Courier / Home Delivery
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Split Grid: Left Catalog (58%), Right Order / Cart (42%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Product Search & Catalog */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border shadow-sm">
            <CardHeader className="p-4 pb-2">
              <div className="flex flex-col sm:flex-row gap-2">
                {/* Barcode scanner direct input */}
                <form onSubmit={handleBarcodeScan} className="flex-1 relative">
                  <ScanBarcode className="absolute left-3 top-2.5 h-4 w-4 text-emerald-600" />
                  <Input
                    ref={barcodeInputRef}
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    placeholder="Scan Barcode / QR (Press F2 or Enter)..."
                    className="pl-9 pr-14 text-sm font-mono border-emerald-300 focus-visible:ring-emerald-500"
                  />
                  <Badge
                    variant="outline"
                    className="absolute right-2 top-2 text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200"
                  >
                    Enter ↵
                  </Badge>
                </form>

                {/* Name search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search product title or SKU..."
                    className="pl-9 pr-8 text-sm"
                  />
                  {productSearch && (
                    <button
                      type="button"
                      onClick={() => setProductSearch("")}
                      className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 pt-2">
              {isSearchingProducts ? (
                <div className="py-16 text-center text-sm text-muted-foreground">
                  Searching products catalog...
                </div>
              ) : products.length === 0 ? (
                <div className="py-16 text-center text-muted-foreground">
                  <ShoppingBag className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
                  <p className="text-sm font-medium">No products found</p>
                  <p className="text-xs text-muted-foreground">
                    Try searching by another title, SKU, or clear your query.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[620px] overflow-y-auto pr-1">
                  {products.map((p) => {
                    const rawImg =
                      p.images?.find((img) => img.isPrimary)?.imageUrl || p.images?.[0]?.imageUrl;
                    const primaryImg = rawImg ? mediaUrl(rawImg) : null;
                    const variants = p.variants || [];
                    const hasVariants = variants.length > 0;
                    const minPrice = hasVariants ? Math.min(...variants.map((v) => Number(v.price) || 0)) : 0;
                    const maxPrice = hasVariants ? Math.max(...variants.map((v) => Number(v.price) || 0)) : 0;
                    const totalStock = variants.reduce(
                      (sum, v) => sum + (v.inventory?.availableQuantity ?? 0),
                      0
                    );
                    const isMultiVariant = variants.length > 1;

                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          if (isMultiVariant) {
                            setVariantModalProduct(p);
                          } else if (hasVariants) {
                            addToCart(p, variants[0]);
                          } else {
                            toast.warning("This product has no variants configured.");
                          }
                        }}
                        className="group flex flex-col justify-between border rounded-lg p-2.5 hover:border-primary/60 hover:shadow-md transition-all bg-card text-left cursor-pointer select-none"
                      >
                        <div>
                          {/* Image */}
                          <div className="relative aspect-square w-full rounded-md overflow-hidden bg-muted mb-2">
                            {primaryImg ? (
                              <Image
                                src={primaryImg}
                                alt={p.name}
                                fill
                                unoptimized
                                sizes="(max-width: 768px) 150px, 200px"
                                className="object-cover group-hover:scale-105 transition-transform"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                                <ShoppingBag className="h-8 w-8" />
                              </div>
                            )}
                            <div className="absolute top-1.5 right-1.5">
                              {totalStock > 0 ? (
                                <Badge className="text-[10px] px-1.5 py-0 bg-emerald-600/90 text-white font-mono">
                                  {totalStock} in stock
                                </Badge>
                              ) : (
                                <Badge variant="destructive" className="text-[10px] px-1.5 py-0 font-mono">
                                  Out of stock
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Info */}
                          <h4 className="text-xs font-semibold line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                            {p.name}
                          </h4>
                        </div>

                        <div className="mt-2 pt-2 border-t flex items-center justify-between gap-1">
                          <div>
                            <div className="text-xs font-bold text-foreground">
                              ৳
                              {minPrice === maxPrice
                                ? minPrice.toFixed(0)
                                : `${minPrice.toFixed(0)} - ${maxPrice.toFixed(0)}`}
                            </div>
                            {isMultiVariant && (
                              <span className="text-[10px] text-muted-foreground">
                                {variants.length} variants
                              </span>
                            )}
                          </div>

                          {isMultiVariant ? (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={(e) => {
                                e.stopPropagation();
                                setVariantModalProduct(p);
                              }}
                              className="h-7 px-2 text-[11px] font-medium"
                            >
                              Options
                            </Button>
                          ) : hasVariants ? (
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart(p, variants[0]);
                              }}
                              className="h-7 px-2 text-[11px] font-medium gap-1"
                            >
                              <Plus className="h-3 w-3" />
                              Add
                            </Button>
                          ) : (
                            <Badge variant="outline" className="text-[10px]">No stock</Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Order Cart, Customer & Checkout */}
        <div className="lg:col-span-5 space-y-4">
          {/* Customer Lookup Card */}
          <Card className="border shadow-sm">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <User className="h-4 w-4 text-primary" />
                  Customer Information
                </CardTitle>
                {selectedCustomer && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearCustomer}
                    className="h-6 text-xs text-muted-foreground hover:text-destructive"
                  >
                    Clear Customer
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-4 pt-1 space-y-3">
              {/* Customer Search Bar */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={customerSearch}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value);
                    setIsCustomerDropdownOpen(true);
                  }}
                  onFocus={() => setIsCustomerDropdownOpen(true)}
                  placeholder="Search existing customer by phone or name..."
                  className="pl-8 text-xs h-8"
                />

                {/* Dropdown Results */}
                {isCustomerDropdownOpen && customerSearch.trim().length >= 2 && (
                  <div className="absolute z-30 left-0 right-0 top-9 bg-popover border rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {isSearchingCustomers ? (
                      <div className="p-3 text-xs text-muted-foreground text-center">Searching...</div>
                    ) : customers.length === 0 ? (
                      <div className="p-3 text-xs text-muted-foreground text-center">
                        No registered customer found. Enter details manually below.
                      </div>
                    ) : (
                      customers.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => handleSelectCustomer(c)}
                          className="w-full text-left p-2.5 hover:bg-muted border-b last:border-b-0 text-xs flex justify-between items-center transition-colors"
                        >
                          <div>
                            <div className="font-semibold text-foreground">{c.fullName}</div>
                            <div className="text-[11px] text-muted-foreground">{c.phone}</div>
                          </div>
                          <Badge variant="outline" className="text-[10px]">
                            Select
                          </Badge>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Customer Inputs */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[11px]">Customer Name *</Label>
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder={fulfillmentType === "STORE_PICKUP" ? "Counter Walk-in" : "Full Name"}
                    className="h-8 text-xs mt-1"
                  />
                </div>
                <div>
                  <Label className="text-[11px]">Customer Phone *</Label>
                  <Input
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder={fulfillmentType === "STORE_PICKUP" ? "Optional for cash" : "01XXXXXXXXX"}
                    className="h-8 text-xs mt-1"
                  />
                </div>
              </div>

              <div>
                <Label className="text-[11px]">Email Address (Optional)</Label>
                <Input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="customer@example.com"
                  className="h-8 text-xs mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Delivery Address (Only when Courier Delivery is selected) */}
          {fulfillmentType === "DELIVERY" && (
            <Card className="border shadow-sm">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <Truck className="h-4 w-4 text-primary" />
                  Delivery Address (Bangladesh Cascading)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-1">
                <CheckoutAddressForm
                  address={shippingAddress}
                  onChange={setShippingAddress}
                  showContactFields={false}
                />
              </CardContent>
            </Card>
          )}

          {/* Cart & Billing Section */}
          <Card className="border shadow-sm">
            <CardHeader className="p-4 pb-2 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <ShoppingBag className="h-4 w-4 text-primary" />
                  Order Items ({cart.length})
                </CardTitle>
                {cart.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearCart}
                    className="h-6 text-xs text-muted-foreground hover:text-destructive"
                  >
                    Clear All
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              {/* Item Rows */}
              {cart.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground border border-dashed rounded-lg">
                  <ShoppingBag className="h-8 w-8 mx-auto text-muted-foreground/30 mb-1" />
                  <p className="text-xs font-medium">Cart is empty</p>
                  <p className="text-[11px] text-muted-foreground">
                    Scan a barcode or click items on the left to add.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div
                      key={item.variantId}
                      className="flex items-center justify-between gap-2 p-2 border rounded-lg bg-card text-xs"
                    >
                      <div className="flex-1 min-w-0">
                        <h5 className="font-semibold truncate">{item.productName}</h5>
                        <div className="text-[10px] text-muted-foreground truncate">
                          SKU: {item.sku} {item.attributeValuesSummary && `| ${item.attributeValuesSummary}`}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] font-medium text-muted-foreground">Price: ৳</span>
                          <Input
                            type="number"
                            min="0"
                            value={item.unitPrice}
                            onChange={(e) => updateItemPrice(item.variantId, Number(e.target.value) || 0)}
                            className="h-6 w-16 text-xs px-1 text-right font-medium"
                          />
                        </div>
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center border rounded-md bg-muted/30">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.variantId, -1)}
                          className="p-1 hover:bg-muted text-muted-foreground transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => setDirectQuantity(item.variantId, parseInt(e.target.value) || 1)}
                          className="h-6 w-10 text-xs text-center border-0 p-0 font-bold bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.variantId, 1)}
                          className="p-1 hover:bg-muted text-muted-foreground transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Total & Delete */}
                      <div className="text-right pl-1">
                        <div className="font-bold text-foreground">
                          ৳{(item.unitPrice * item.quantity).toFixed(0)}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.variantId)}
                          className="text-muted-foreground hover:text-destructive mt-1 inline-block"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Financial Calculation Breakdown */}
              <div className="border-t pt-3 space-y-2 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Items Subtotal:</span>
                  <span className="font-semibold text-foreground">৳{subtotal.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Delivery / Shipping:</span>
                  <div className="flex items-center gap-1">
                    <span>৳</span>
                    <Input
                      type="number"
                      min="0"
                      disabled={fulfillmentType === "STORE_PICKUP"}
                      value={shippingFee}
                      onChange={(e) => setShippingFee(Number(e.target.value) || 0)}
                      className="h-6 w-20 text-xs text-right font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">Discount:</span>
                    <div className="flex items-center gap-1">
                      <span>৳</span>
                      <Input
                        type="number"
                        min="0"
                        value={discountAmount}
                        onChange={(e) => setDiscountAmount(Number(e.target.value) || 0)}
                        className="h-6 w-20 text-xs text-right font-medium text-emerald-600"
                      />
                    </div>
                  </div>
                  {subtotal > 0 && (
                    <div className="flex items-center justify-end gap-1">
                      {[5, 10, 15, 20].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setDiscountAmount(Math.round((subtotal * pct) / 100))}
                          className="px-1.5 py-0.5 rounded text-[10px] bg-muted hover:bg-muted/80 text-muted-foreground font-medium"
                        >
                          {pct}%
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setDiscountAmount(0)}
                        className="px-1.5 py-0.5 rounded text-[10px] text-muted-foreground hover:text-foreground font-medium"
                      >
                        Reset
                      </button>
                    </div>
                  )}
                </div>

                <div className="border-t pt-2 flex justify-between items-center text-sm font-bold">
                  <span>Grand Total:</span>
                  <span className="text-lg text-primary">৳{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Settlement Method */}
              <div className="border-t pt-3 space-y-2.5">
                <Label className="text-xs font-semibold">Payment Method & Settlement</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={paymentMethodCode === "CASH" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setPaymentMethodCode("CASH");
                      if (fulfillmentType === "STORE_PICKUP") setPaymentMethod("ONLINE");
                    }}
                    className="h-8 text-xs font-medium"
                  >
                    Cash / Counter POS
                  </Button>
                  <Button
                    type="button"
                    variant={paymentMethodCode === "MFS" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setPaymentMethodCode("MFS");
                      setPaymentMethod("ONLINE");
                    }}
                    className="h-8 text-xs font-medium"
                  >
                    bKash / Nagad / MFS
                  </Button>
                  <Button
                    type="button"
                    variant={paymentMethodCode === "CARD" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setPaymentMethodCode("CARD");
                      setPaymentMethod("ONLINE");
                    }}
                    className="h-8 text-xs font-medium"
                  >
                    Card Terminal POS
                  </Button>
                  <Button
                    type="button"
                    variant={paymentMethodCode === "COD" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setPaymentMethodCode("COD");
                      setPaymentMethod("CASH_ON_DELIVERY");
                      setTenderedAmount(0);
                    }}
                    className="h-8 text-xs font-medium"
                  >
                    Cash on Delivery
                  </Button>
                </div>

                {/* Amount Paid / Tendered */}
                <div className="bg-muted/40 p-2.5 rounded-lg border space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {fulfillmentType === "STORE_PICKUP" ? "Cash Tendered / Received:" : "Advance Amount Paid:"}
                    </span>
                    <div className="flex items-center gap-1">
                      <span>৳</span>
                      <Input
                        type="number"
                        min="0"
                        value={tenderedAmount}
                        onChange={(e) => setTenderedAmount(Number(e.target.value) || 0)}
                        className="h-7 w-24 text-xs text-right font-bold"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setTenderedAmount(grandTotal)}
                      className="px-2 py-0.5 rounded text-[10px] bg-background border hover:bg-muted font-medium transition-colors"
                    >
                      Exact (৳{grandTotal.toFixed(0)})
                    </button>
                    {[500, 1000, 1500, 2000, 5000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setTenderedAmount(amt)}
                        className="px-2 py-0.5 rounded text-[10px] bg-background border hover:bg-muted font-mono transition-colors"
                      >
                        ৳{amt}
                      </button>
                    ))}
                  </div>

                  {changeAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Change to Return:</span>
                      <span>৳{changeAmount.toFixed(2)}</span>
                    </div>
                  )}

                  {dueAmount > 0 && (
                    <div className="flex justify-between text-amber-600 font-bold">
                      <span>Due on Delivery:</span>
                      <span>৳{dueAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Notes */}
              <div className="space-y-2">
                <Textarea
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  placeholder="Customer note (e.g. delivery instructions)..."
                  className="text-xs h-14 resize-none"
                />
              </div>

              {/* Main Submit Button */}
              <Button
                type="button"
                onClick={handleCreateOrder}
                disabled={isSubmitting || cart.length === 0}
                className="w-full h-11 text-sm font-bold gap-2 shadow-md"
              >
                {isSubmitting ? (
                  "Processing Order..."
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    {fulfillmentType === "STORE_PICKUP"
                      ? `Complete POS Sale • ৳${grandTotal.toFixed(0)}`
                      : `Create Delivery Order • ৳${grandTotal.toFixed(0)}`}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Variant Selection Modal */}
      <Dialog
        open={Boolean(variantModalProduct)}
        onOpenChange={(open) => !open && setVariantModalProduct(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Select Variant</DialogTitle>
          </DialogHeader>

          {variantModalProduct && (
            <div className="space-y-3 py-2">
              <p className="text-xs text-muted-foreground font-medium">
                {variantModalProduct.name}
              </p>

              <div className="divide-y border rounded-lg max-h-72 overflow-y-auto">
                {variantModalProduct.variants.map((v) => {
                  const summary = (v.attributeValues || [])
                    .map((av) => av.attributeValue?.value)
                    .filter(Boolean)
                    .join(" / ");
                  const stock = v.inventory?.availableQuantity ?? 0;

                  return (
                    <div
                      key={v.id}
                      className="p-3 flex items-center justify-between gap-3 text-xs hover:bg-muted/40 transition-colors"
                    >
                      <div>
                        <div className="font-semibold text-foreground">
                          {summary || `SKU: ${v.sku}`}
                        </div>
                        <div className="text-[11px] text-muted-foreground font-mono flex items-center gap-2">
                          <span>SKU: {v.sku}</span>
                          {v.barcode && (
                            <span className="text-zinc-500">| Barcode: {v.barcode}</span>
                          )}
                        </div>
                        <div className="mt-0.5">
                          {stock > 0 ? (
                            <span className="text-[10px] text-emerald-600 font-medium">
                              {stock} in stock
                            </span>
                          ) : (
                            <span className="text-[10px] text-destructive font-medium">
                              Out of stock
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-bold text-foreground">৳{Number(v.price).toFixed(0)}</span>
                        <Button
                          size="sm"
                          onClick={() => {
                            addToCart(variantModalProduct, v);
                            setVariantModalProduct(null);
                          }}
                          className="h-7 text-xs px-2.5 font-medium"
                        >
                          Select
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Success & Thermal Receipt Modal */}
      <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto p-3 bg-emerald-100 text-emerald-600 rounded-full w-fit mb-2">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <DialogTitle className="text-center text-lg font-bold">
              Order Created Successfully!
            </DialogTitle>
          </DialogHeader>

          {createdOrder && (
            <div className="space-y-4 py-2 text-xs">
              <div className="bg-muted/40 border rounded-lg p-3 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Number:</span>
                  <span className="font-bold text-foreground text-sm">
                    {createdOrder.orderNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer:</span>
                  <span className="font-semibold text-foreground">
                    {createdOrder.customerName} ({createdOrder.customerPhone})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Source / Channel:</span>
                  <Badge variant="outline" className="text-[10px]">
                    {createdOrder.source || source}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Grand Total:</span>
                  <span className="font-bold text-primary text-sm">
                    ৳{Number(createdOrder.grandTotal).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Status:</span>
                  <Badge className="text-[10px] bg-emerald-600">
                    {createdOrder.status}
                  </Badge>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-2">
                <Button
                  onClick={() => setIsThermalReceiptModalOpen(true)}
                  className="w-full gap-2 font-bold bg-emerald-600 hover:bg-emerald-700"
                >
                  <Receipt className="h-4 w-4" />
                  View & Print Thermal Receipt (58/80mm)
                </Button>

                <Button
                  variant="outline"
                  onClick={() => router.push(`/admin/orders/${createdOrder.id || createdOrder.orderNumber}`)}
                  className="w-full gap-2 text-xs"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  View Full Order in Admin
                </Button>

                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsSuccessModalOpen(false);
                    handleResetForm();
                    barcodeInputRef.current?.focus();
                  }}
                  className="w-full text-xs font-semibold"
                >
                  Create Next Order / New Customer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* POS Thermal Receipt Modal */}
      <OrderThermalReceiptModal
        order={createdOrder}
        open={isThermalReceiptModalOpen}
        onOpenChange={setIsThermalReceiptModalOpen}
      />
    </div>
  );
}
