"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  Printer,
  Copy,
  Check,
  ExternalLink,
  AlertTriangle,
  RotateCcw,
  CreditCard,
  FileText,
  Save,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  useGetAdminOrderQuery,
  useTransitionOrderStatusMutation,
  useUpdateAdminOrderMutation,
} from "../../orderApi";
import { AdminOrderStatusDialog } from "./AdminOrderStatusDialog";
import { AdminOrderShipmentDialog } from "./AdminOrderShipmentDialog";
import { AdminPaymentVerificationCard } from "./AdminPaymentVerificationCard";
import { AdminBookCourierDialog } from "@/modules/courier/components/admin/AdminBookCourierDialog";
import { OrderInvoiceModal } from "../invoice/OrderInvoiceModal";
import { mediaUrl } from "@/modules/catalog/catalog.utils";

interface AdminOrderDetailsPageProps {
  orderNumber: string;
}

const statusStyle: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  CONFIRMED: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20",
  PROCESSING: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  SHIPPED: "bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20",
  DELIVERED: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  CANCELLED: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
};

export function AdminOrderDetailsPage({
  orderNumber,
}: AdminOrderDetailsPageProps) {
  const { data, isLoading, isError, refetch } =
    useGetAdminOrderQuery(orderNumber);

  const [transitionStatus, { isLoading: isTransitioning }] =
    useTransitionOrderStatusMutation();
  const [updateAdminOrder, { isLoading: isUpdatingAdmin }] =
    useUpdateAdminOrderMutation();

  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isShipmentDialogOpen, setIsShipmentDialogOpen] = useState(false);
  const [isBookCourierDialogOpen, setIsBookCourierDialogOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // Admin note state
  const [adminNoteInput, setAdminNoteInput] = useState<string | null>(null);

  const order = data?.data;

  const handleCopy = () => {
    navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    toast.success("Order number copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleQuickTransition = async (status: any, note?: string) => {
    try {
      await transitionStatus({
        orderNumber,
        data: { status, note },
      }).unwrap();
      toast.success(`Order #${orderNumber} updated to ${status}`);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update status");
    }
  };

  const handleMarkAsPaid = async () => {
    try {
      await updateAdminOrder({
        orderNumber,
        data: { paymentStatus: "PAID" },
      }).unwrap();
      toast.success("Payment marked as PAID");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update payment status");
    }
  };

  const handleSaveAdminNote = async () => {
    try {
      await updateAdminOrder({
        orderNumber,
        data: { adminNote: adminNoteInput },
      }).unwrap();
      toast.success("Admin note saved");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to save note");
    }
  };

  const handlePrint = () => {
    setIsInvoiceModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading order details...</p>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4 text-center">
        <AlertTriangle className="size-10 text-destructive" />
        <h2 className="text-xl font-bold">Order not found</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          The requested order #{orderNumber} could not be located in the database.
        </p>
        <Link href="/admin/orders">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="size-4" /> Back to Orders List
          </Button>
        </Link>
      </div>
    );
  }

  const shippingAddress = order.addresses?.find(
    (a) => a.type === "SHIPPING"
  );
  const billingAddress = order.addresses?.find((a) => a.type === "BILLING");

  const currentAdminNote =
    adminNoteInput !== null ? adminNoteInput : order.adminNote || "";

  return (
    <div className="space-y-6">
      {/* Top Navigation & Action Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div className="flex items-center gap-3">
          <Link href="/admin/orders">
            <Button variant="ghost" size="icon-sm">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">
                Order #{order.orderNumber}
              </h1>
              <button
                type="button"
                onClick={handleCopy}
                className="text-muted-foreground hover:text-foreground p-1"
                title="Copy Order #"
              >
                {copied ? (
                  <Check className="size-3.5 text-emerald-600" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </button>
              <Badge
                variant="outline"
                className={`text-xs font-bold ${
                  statusStyle[order.status] || ""
                }`}
              >
                {order.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Placed on{" "}
              {new Date(order.placedAt || order.createdAt).toLocaleDateString(
                "en-GB",
                {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }
              )}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="gap-1.5 h-8 text-xs"
          >
            <Printer className="size-3.5" />
            Print Order Slip
          </Button>

          {/* Quick status transitions depending on current state */}
          {order.status === "PENDING" && (
            <>
              <Button
                size="sm"
                className="gap-1.5 h-8 text-xs bg-emerald-600 hover:bg-emerald-700"
                onClick={() => handleQuickTransition("CONFIRMED", "Confirmed by admin")}
                disabled={isTransitioning}
              >
                <CheckCircle2 className="size-3.5" />
                Confirm Order
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="h-8 text-xs"
                onClick={() => {
                  setTargetStatus("CANCELLED");
                  setIsStatusDialogOpen(true);
                }}
              >
                Cancel Order
              </Button>
            </>
          )}

          {order.status === "CONFIRMED" && (
            <>
              <Button
                size="sm"
                className="gap-1.5 h-8 text-xs bg-blue-600 hover:bg-blue-700"
                onClick={() =>
                  handleQuickTransition("PROCESSING", "Moved to packing/processing")
                }
                disabled={isTransitioning}
              >
                <Package className="size-3.5" />
                Process Order
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="h-8 text-xs"
                onClick={() => {
                  setTargetStatus("CANCELLED");
                  setIsStatusDialogOpen(true);
                }}
              >
                Cancel Order
              </Button>
            </>
          )}

          {order.status === "PROCESSING" && (
            <>
              <Button
                size="sm"
                className="gap-1.5 h-8 text-xs bg-primary"
                onClick={() => setIsBookCourierDialogOpen(true)}
              >
                <Truck className="size-3.5" />
                Book via Courier API
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 h-8 text-xs"
                onClick={() => setIsShipmentDialogOpen(true)}
              >
                Manual Dispatch
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="h-8 text-xs"
                onClick={() => {
                  setTargetStatus("CANCELLED");
                  setIsStatusDialogOpen(true);
                }}
              >
                Cancel Order
              </Button>
            </>
          )}

          {order.status === "SHIPPED" && (
            <Button
              size="sm"
              className="gap-1.5 h-8 text-xs bg-emerald-600 hover:bg-emerald-700"
              onClick={() => handleQuickTransition("DELIVERED", "Delivered to customer")}
              disabled={isTransitioning}
            >
              <CheckCircle2 className="size-3.5" />
              Mark as Delivered
            </Button>
          )}

          {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => {
                setTargetStatus(null);
                setIsStatusDialogOpen(true);
              }}
            >
              Other Transition...
            </Button>
          )}
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column (2 Cols) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Ordered Items Card */}
          <Card className="shadow-none">
            <CardHeader className="flex flex-row items-center justify-between border-b py-3 px-5">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="size-4 text-primary" />
                Ordered Items ({order.items?.length || 0})
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b bg-muted/30 font-medium text-muted-foreground">
                    <tr>
                      <th className="p-3 pl-5">Product Details</th>
                      <th className="p-3">SKU</th>
                      <th className="p-3 text-right">Unit Price</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 pr-5 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {order.items?.map((item) => {
                      const itemImg =
                        item.product?.images?.find((img) => img.isPrimary)?.imageUrl ||
                        item.product?.images?.[0]?.imageUrl;

                      return (
                        <tr key={item.id} className="hover:bg-muted/20">
                          <td className="p-3 pl-5 align-middle">
                            <div className="flex items-center gap-3">
                              <div className="size-12 shrink-0 rounded-lg border bg-muted/30 overflow-hidden relative flex items-center justify-center">
                                {itemImg ? (
                                  <img
                                    src={mediaUrl(itemImg)}
                                    alt={item.productName}
                                    className="size-full object-cover"
                                  />
                                ) : (
                                  <Package className="size-5 text-muted-foreground/60" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-foreground text-sm">
                                  {item.productName}
                                </p>
                                {item.attributes && item.attributes.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5 mt-1">
                                    {item.attributes.map((attr) => (
                                      <Badge
                                        key={attr.id}
                                        variant="secondary"
                                        className="text-[10px] font-normal"
                                      >
                                        {attr.attributeName}: {attr.attributeValue}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                        <td className="p-3 align-middle font-mono text-muted-foreground">
                          {item.sku}
                        </td>

                        <td className="p-3 align-middle text-right font-mono font-medium">
                          ৳{Number(item.unitPrice).toLocaleString()}
                        </td>

                        <td className="p-3 align-middle text-center font-bold">
                          {item.quantity}
                        </td>

                        <td className="p-3 pr-5 align-middle text-right font-mono font-bold text-foreground">
                          ৳{Number(item.lineTotal).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                  </tbody>
                </table>
              </div>

              {/* Financial Calculation Summary */}
              <div className="flex justify-end border-t p-5 bg-muted/10">
                <div className="w-64 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Items Subtotal:</span>
                    <span className="font-mono font-medium">
                      ৳{Number(order.subtotal).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Delivery Charge ({order.shippingMethodName}):
                    </span>
                    <span className="font-mono font-medium">
                      ৳{Number(order.shippingCharge).toLocaleString()}
                    </span>
                  </div>

                  {Number(order.discountAmount) > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Discount ({order.couponCode || "Coupon"}):</span>
                      <span className="font-mono">
                        -৳{Number(order.discountAmount).toLocaleString()}
                      </span>
                    </div>
                  )}

                  {Number(order.taxAmount) > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Tax Amount:</span>
                      <span className="font-mono">
                        +৳{Number(order.taxAmount).toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between border-t pt-2 text-sm font-bold text-foreground">
                    <span>Grand Total:</span>
                    <span className="font-mono text-base text-primary">
                      ৳{Number(order.grandTotal).toLocaleString()}
                    </span>
                  </div>

                  {(order.isAdvanceRequired || Number(order.advanceAmount || 0) > 0) && (
                    <div className="pt-2 border-t border-dashed space-y-1">
                      <div className="flex justify-between text-amber-600 dark:text-amber-400 font-semibold">
                        <span>Advance Required:</span>
                        <span className="font-mono">৳{Number(order.advanceAmount || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-foreground font-semibold">
                        <span>Due on Delivery (COD):</span>
                        <span className="font-mono">৳{Number(order.dueAmount || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline & Status History */}
          <Card className="shadow-none">
            <CardHeader className="border-b py-3 px-5">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="size-4 text-primary" />
                Status History & Audit Trail
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              {order.statusHistory && order.statusHistory.length > 0 ? (
                <div className="space-y-4">
                  {order.statusHistory.map((h, i) => (
                    <div
                      key={h.id}
                      className="flex items-start gap-3 text-xs relative"
                    >
                      <div className="p-1 rounded-full bg-primary/10 text-primary shrink-0 mt-0.5">
                        <CheckCircle2 className="size-3.5" />
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-foreground">
                            Status changed to {h.toStatus}
                          </span>
                          {h.fromStatus && (
                            <span className="text-muted-foreground text-[11px]">
                              (from {h.fromStatus})
                            </span>
                          )}
                          <span className="text-muted-foreground text-[11px] ml-auto">
                            {new Date(h.createdAt).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        {h.note && (
                          <p className="text-muted-foreground italic bg-muted/40 p-2 rounded mt-1">
                            "{h.note}"
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Order placed at{" "}
                  {new Date(order.placedAt || order.createdAt).toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Admin Internal Note Editor */}
          <Card className="shadow-none">
            <CardHeader className="border-b py-3 px-5">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="size-4 text-primary" />
                Internal Admin Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              <Textarea
                placeholder="Internal memo visible only to store admins (e.g. Call customer before 3 PM, special packing requested)..."
                rows={3}
                value={currentAdminNote}
                onChange={(e) => setAdminNoteInput(e.target.value)}
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={handleSaveAdminNote}
                  disabled={isUpdatingAdmin}
                  className="gap-1.5 h-8 text-xs"
                >
                  <Save className="size-3.5" />
                  Save Admin Note
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (Sidebar Cards) */}
        <div className="space-y-6">
          {/* Customer Profile Card */}
          <Card className="shadow-none">
            <CardHeader className="border-b py-3 px-5">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="size-4 text-primary" />
                Customer Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3 text-xs">
              <div>
                <p className="font-semibold text-sm text-foreground">
                  {order.customerName}
                </p>
                <div className="mt-1 space-y-1 text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <Phone className="size-3 text-primary" />
                    {order.customerPhone}
                  </p>
                  {order.customerEmail && (
                    <p className="flex items-center gap-2">
                      <Mail className="size-3 text-primary" />
                      {order.customerEmail}
                    </p>
                  )}
                </div>
              </div>

              <div className="border-t pt-2.5">
                {order.userId ? (
                  <Badge variant="secondary" className="text-[10px]">
                    Registered Customer (User ID #{order.userId})
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px]">
                    Guest Checkout Order
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Delivery Address Card */}
          <Card className="shadow-none">
            <CardHeader className="border-b py-3 px-5">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="size-4 text-primary" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-2 text-xs">
              {shippingAddress ? (
                <div>
                  <p className="font-semibold text-foreground">
                    {shippingAddress.fullName}
                  </p>
                  <p className="text-muted-foreground">{shippingAddress.phone}</p>
                  <p className="mt-2 text-muted-foreground leading-relaxed">
                    {shippingAddress.addressLine1}
                    {shippingAddress.addressLine2 && `, ${shippingAddress.addressLine2}`}
                    <br />
                    {shippingAddress.upazila || shippingAddress.thana
                      ? `${shippingAddress.upazila || shippingAddress.thana}, `
                      : ""}
                    {shippingAddress.district}
                    {shippingAddress.division && `, ${shippingAddress.division}`}
                    {shippingAddress.postalCode && ` - ${shippingAddress.postalCode}`}
                    <br />
                    Bangladesh
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground italic">
                  No address snapshot available
                </p>
              )}
            </CardContent>
          </Card>

          {/* Payment Verification Card */}
          <AdminPaymentVerificationCard
            orderId={order.id}
            orderNumber={order.orderNumber}
            orderGrandTotal={order.grandTotal}
            currentPaymentStatus={order.paymentStatus}
          />

          {/* Payment & Shipping Method Card */}
          <Card className="shadow-none">
            <CardHeader className="border-b py-3 px-5">
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="size-4 text-primary" />
                Payment & Delivery Method
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b pb-2.5">
                <span className="text-muted-foreground">Payment Method:</span>
                <span className="font-medium text-foreground">
                  {order.paymentMethod === "PARTIAL_COD" || order.isAdvanceRequired
                    ? "Partial Advance + COD"
                    : order.paymentMethod === "CASH_ON_DELIVERY"
                    ? "Cash on Delivery"
                    : "Online Payment"}
                </span>
              </div>

              <div className="flex items-center justify-between border-b pb-2.5">
                <span className="text-muted-foreground">Payment Status:</span>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-bold ${
                      order.paymentStatus === "PAID"
                        ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
                        : order.paymentStatus === "PARTIALLY_PAID"
                        ? "bg-blue-500/10 text-blue-700 border-blue-500/20"
                        : "bg-amber-500/10 text-amber-700 border-amber-500/20"
                    }`}
                  >
                    {order.paymentStatus === "PARTIALLY_PAID"
                      ? "PARTIALLY PAID"
                      : order.paymentStatus}
                  </Badge>

                  {order.paymentStatus === "UNPAID" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 text-[10px] text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-1.5"
                      onClick={handleMarkAsPaid}
                      disabled={isUpdatingAdmin}
                    >
                      Mark Paid
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between border-b pb-2.5">
                <span className="text-muted-foreground">Shipping Zone:</span>
                <span className="font-medium text-foreground">
                  {order.shippingZoneName}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Selected Rate:</span>
                <span className="font-medium text-foreground">
                  {order.shippingMethodName} (৳{order.shippingCharge})
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Courier Shipment Card */}
          <Card className="shadow-none">
            <CardHeader className="flex flex-row items-center justify-between border-b py-3 px-5">
              <CardTitle className="text-base flex items-center gap-2">
                <Truck className="size-4 text-primary" />
                Courier Shipment
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3 text-xs">
              {order.shipment ? (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Courier Gateway:</span>
                    <span className="font-semibold text-foreground">
                      {order.shipment.courierName || "Standard Courier"}
                    </span>
                  </div>

                  {order.shipment.consignmentId && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Consignment ID:</span>
                      <span className="font-mono font-bold text-foreground">
                        {order.shipment.consignmentId}
                      </span>
                    </div>
                  )}

                  {order.shipment.trackingNumber && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Tracking ID:</span>
                      <span className="font-mono font-bold text-foreground">
                        {order.shipment.trackingNumber}
                      </span>
                    </div>
                  )}

                  {order.shipment.codAmount !== undefined &&
                    order.shipment.codAmount !== null && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">COD Collection:</span>
                        <span className="font-mono font-bold text-primary">
                          ৳{(!isNaN(Number(order.shipment.codAmount)) ? Number(order.shipment.codAmount) : 0).toLocaleString()}
                        </span>
                      </div>
                    )}

                  {order.shipment.courierStatus && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Courier Status:</span>
                      <Badge variant="secondary" className="text-[10px] uppercase font-semibold">
                        {order.shipment.courierStatus}
                      </Badge>
                    </div>
                  )}

                  {order.shipment.trackingUrl && (
                    <div className="pt-1">
                      <a
                        href={order.shipment.trackingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-primary hover:underline font-semibold"
                      >
                        Open Live Courier Tracking
                        <ExternalLink className="size-3" />
                      </a>
                    </div>
                  )}

                  <div className="border-t pt-2.5 mt-2 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-8 text-xs gap-1"
                      onClick={() => setIsBookCourierDialogOpen(true)}
                    >
                      <Truck className="size-3" />
                      Re-book API
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 text-xs text-muted-foreground"
                      onClick={() => setIsShipmentDialogOpen(true)}
                    >
                      Manual Edit
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-2 space-y-2.5">
                  <p className="text-muted-foreground">
                    No courier has been assigned to this order yet.
                  </p>
                  <Button
                    size="sm"
                    className="w-full gap-1.5 h-8 text-xs bg-primary"
                    onClick={() => setIsBookCourierDialogOpen(true)}
                  >
                    <Truck className="size-3.5" />
                    Book Courier (Steadfast / Pathao)
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full gap-1.5 h-8 text-xs"
                    onClick={() => setIsShipmentDialogOpen(true)}
                  >
                    Manual Assign Courier
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Order Note */}
          {order.customerNote && (
            <Card className="shadow-none">
              <CardHeader className="border-b py-3 px-5">
                <CardTitle className="text-sm font-semibold">
                  Customer's Order Note
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 text-xs text-muted-foreground italic">
                "{order.customerNote}"
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modals */}
      {isStatusDialogOpen && (
        <AdminOrderStatusDialog
          open={isStatusDialogOpen}
          onOpenChange={setIsStatusDialogOpen}
          orderNumber={order.orderNumber}
          currentStatus={order.status}
          targetStatus={targetStatus}
        />
      )}

      {isShipmentDialogOpen && (
        <AdminOrderShipmentDialog
          open={isShipmentDialogOpen}
          onOpenChange={setIsShipmentDialogOpen}
          orderNumber={order.orderNumber}
        />
      )}

      {isBookCourierDialogOpen && (
        <AdminBookCourierDialog
          open={isBookCourierDialogOpen}
          onOpenChange={setIsBookCourierDialogOpen}
          order={order}
          onBookingSuccess={() => {
            void refetch();
          }}
        />
      )}

      <OrderInvoiceModal
        order={order}
        open={isInvoiceModalOpen}
        onOpenChange={setIsInvoiceModalOpen}
      />
    </div>
  );
}
