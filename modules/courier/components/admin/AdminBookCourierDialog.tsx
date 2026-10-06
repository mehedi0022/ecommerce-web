"use client";

import React, { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Truck,
  Package,
  MapPin,
  Phone,
  User,
  CheckCircle2,
  ExternalLink,
  Loader2,
  AlertCircle,
  Coins,
} from "lucide-react";
import {
  useGetCourierProvidersQuery,
  useBookCourierOrderMutation,
} from "../../courierApi";
import type { Order } from "@/modules/order/order.types";
import type { BookCourierOrderResult } from "../../types";

interface AdminBookCourierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order;
  onBookingSuccess?: (result: BookCourierOrderResult) => void;
}

export function AdminBookCourierDialog({
  open,
  onOpenChange,
  order,
  onBookingSuccess,
}: AdminBookCourierDialogProps) {
  const { data: providersData, isLoading: isLoadingProviders } =
    useGetCourierProvidersQuery();
  const [bookCourier, { isLoading: isBooking }] = useBookCourierOrderMutation();

  const [selectedCourierCode, setSelectedCourierCode] = useState<string>("");
  const [weight, setWeight] = useState<number>(0.5);
  const [note, setNote] = useState<string>("");
  const [bookingSuccessResult, setBookingSuccessResult] =
    useState<BookCourierOrderResult | null>(null);

  const providers = (providersData?.data || []).filter((p) => p.isActive);

  // Set default provider if not chosen
  React.useEffect(() => {
    if (!selectedCourierCode && providers.length > 0) {
      const defaultProv = providers.find((p) => p.isDefault) || providers[0];
      setSelectedCourierCode(defaultProv.code);
    }
  }, [providers, selectedCourierCode]);

  const shippingAddress = order.addresses?.find((a) => a.type === "SHIPPING");

  // Determine COD calculation
  const rawCod = order?.dueAmount ?? order?.grandTotal ?? 0;
  const parsedCod = Number(rawCod);
  const codAmount = !isNaN(parsedCod) ? parsedCod : 0;
  const isZeroCod = codAmount === 0;

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourierCode) {
      toast.error("Please select an active courier provider");
      return;
    }

    try {
      const res = await bookCourier({
        orderNumber: order.orderNumber,
        data: {
          courierCode: selectedCourierCode,
          weight: Number(weight) || 0.5,
          itemWeightKg: Number(weight) || 0.5,
          note: note.trim() || undefined,
          customNote: note.trim() || undefined,
        },
      }).unwrap();

      if (res?.data) {
        const d = res.data;
        const rawResCod =
          d.codAmount ??
          d.booking?.codAmount ??
          d.shipment?.codAmount ??
          codAmount;
        const normalizedCod = !isNaN(Number(rawResCod)) ? Number(rawResCod) : codAmount;

        const normalizedResult: BookCourierOrderResult = {
          success: true,
          consignmentId: String(d.consignmentId || d.booking?.consignmentId || d.shipment?.consignmentId || ""),
          trackingCode: String(d.trackingCode || d.booking?.trackingCode || d.shipment?.trackingNumber || d.consignmentId || ""),
          trackingUrl: d.trackingUrl || d.booking?.trackingUrl || d.shipment?.trackingUrl,
          courierCode: (d.courierCode || d.shipment?.courierCode || selectedCourierCode || "").toUpperCase(),
          courierName: d.courierName || d.booking?.courierName || d.shipment?.courierName || selectedCourierCode.toUpperCase(),
          courierStatus: d.courierStatus || d.booking?.status || d.shipment?.courierStatus,
          codAmount: normalizedCod,
        };

        setBookingSuccessResult(normalizedResult);
        toast.success(
          `Booked with ${normalizedResult.courierName || normalizedResult.courierCode}! Consignment #${normalizedResult.consignmentId} (COD Collection: ৳${normalizedResult.codAmount.toLocaleString()})`
        );
        if (onBookingSuccess) {
          onBookingSuccess(normalizedResult);
        }
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to book parcel with courier");
    }
  };

  const handleClose = () => {
    setBookingSuccessResult(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-full sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Truck className="size-5" />
            </div>
            <div>
              <DialogTitle>Courier API Booking</DialogTitle>
              <DialogDescription>
                Dispatch order #{order.orderNumber} via automated courier gateway
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {bookingSuccessResult ? (
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
              <div className="size-10 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="size-6" />
              </div>
              <h3 className="font-bold text-base text-foreground">
                Parcel Booked Successfully!
              </h3>
              <p className="text-xs text-muted-foreground">
                Order status has been updated to <strong>SHIPPED</strong>.
              </p>
            </div>

            <div className="rounded-lg border p-3 bg-muted/20 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Courier:</span>
                <span className="font-semibold text-foreground">
                  {bookingSuccessResult.courierName || bookingSuccessResult.courierCode}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Consignment ID:</span>
                <span className="font-mono font-bold text-foreground">
                  {bookingSuccessResult.consignmentId}
                </span>
              </div>
              {bookingSuccessResult.trackingCode && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tracking Code:</span>
                  <span className="font-mono font-bold text-foreground">
                    {bookingSuccessResult.trackingCode}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">COD Collection:</span>
                <span className="font-mono font-bold text-primary">
                  ৳{(!isNaN(Number(bookingSuccessResult.codAmount)) ? Number(bookingSuccessResult.codAmount) : 0).toLocaleString()}
                </span>
              </div>
            </div>

            {bookingSuccessResult.trackingUrl && (
              <a
                href={bookingSuccessResult.trackingUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 py-2.5 px-4 bg-primary text-primary-foreground font-semibold rounded-md text-xs hover:bg-primary/90 transition-colors"
              >
                Open Live Courier Tracking
                <ExternalLink className="size-3.5" />
              </a>
            )}

            <DialogFooter className="pt-2">
              <Button type="button" onClick={handleClose} className="w-full">
                Close
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleBook} className="space-y-4 pt-1">
            {/* Courier Provider Picker */}
            <div className="space-y-1.5">
              <Label htmlFor="courier-provider">Select Courier Gateway</Label>
              {isLoadingProviders ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                  <Loader2 className="size-3.5 animate-spin" /> Loading active couriers...
                </div>
              ) : providers.length === 0 ? (
                <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs flex items-center gap-2">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>
                    No active courier providers configured. Please configure Steadfast or Pathao under{" "}
                    <strong>Settings &rarr; Courier Integration</strong>.
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {providers.map((p) => (
                    <button
                      key={p.code}
                      type="button"
                      onClick={() => setSelectedCourierCode(p.code)}
                      className={`flex flex-col items-start p-3 rounded-lg border text-left text-xs transition-all ${
                        selectedCourierCode === p.code
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-input hover:bg-muted/50"
                      }`}
                    >
                      <span className="font-bold text-foreground">{p.name}</span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Badge
                          variant="outline"
                          className="text-[9px] px-1 py-0 h-4 uppercase"
                        >
                          {p.isLive ? "Live" : "Sandbox"}
                        </Badge>
                        {p.isDefault && (
                          <Badge
                            variant="secondary"
                            className="text-[9px] px-1 py-0 h-4"
                          >
                            Default
                          </Badge>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Recipient Snapshot */}
            <div className="p-3 bg-muted/20 border rounded-lg space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-foreground border-b pb-1.5">
                <User className="size-3.5 text-primary" />
                <span>Recipient Details</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium text-foreground">{order.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone:</span>
                <span className="font-medium text-foreground">{order.customerPhone}</span>
              </div>
              {shippingAddress && (
                <div className="flex justify-between items-start gap-4">
                  <span className="text-muted-foreground shrink-0">Address:</span>
                  <span className="text-right text-muted-foreground">
                    {shippingAddress.addressLine1}, {shippingAddress.district}
                  </span>
                </div>
              )}
            </div>

            {/* Smart COD Amount Calculation Card */}
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-semibold text-foreground">
                  <Coins className="size-3.5 text-primary" />
                  COD Collection on Delivery:
                </span>
                <span className="font-mono text-sm font-bold text-primary">
                  ৳{codAmount.toLocaleString()}
                </span>
              </div>

              {isZeroCod ? (
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                  ✓ Full payment was received online. The courier will collect <strong>৳0</strong> from the customer.
                </p>
              ) : Number(order.advanceAmount || 0) > 0 ? (
                <p className="text-[11px] text-muted-foreground">
                  Due balance after customer advance payment of ৳{Number(order.advanceAmount).toLocaleString()}.
                </p>
              ) : (
                <p className="text-[11px] text-muted-foreground">
                  Standard Cash on Delivery for full order amount.
                </p>
              )}
            </div>

            {/* Package Weight & Note */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="pkg-weight" className="text-xs">
                  Package Weight (KG)
                </Label>
                <Input
                  id="pkg-weight"
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={weight}
                  onChange={(e) => setWeight(parseFloat(e.target.value) || 0.5)}
                  required
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="pkg-note" className="text-xs">
                  Courier Note / Instructions (Optional)
                </Label>
                <Textarea
                  id="pkg-note"
                  rows={2}
                  placeholder="e.g. Handle with care, fragile items inside..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isBooking || providers.length === 0}
                className="gap-1.5"
              >
                {isBooking ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Truck className="size-4" />
                )}
                Confirm & Book Consignment
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
