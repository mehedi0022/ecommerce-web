"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Truck, ExternalLink, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateOrderShipmentMutation,
  useTransitionOrderStatusMutation,
} from "../../orderApi";

interface AdminOrderShipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderNumber: string;
}

const COMMON_COURIERS = [
  "Pathao Courier",
  "Steadfast Courier",
  "RedX Logistics",
  "Paperfly",
  "eCourier",
  "Sundarban Courier",
  "SA Paribahan",
];

export function AdminOrderShipmentDialog({
  open,
  onOpenChange,
  orderNumber,
}: AdminOrderShipmentDialogProps) {
  const [courierName, setCourierName] = useState("Pathao Courier");
  const [customCourier, setCustomCourier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [note, setNote] = useState("");
  const [autoDispatch, setAutoDispatch] = useState(true);

  const [createShipment, { isLoading: isCreating }] =
    useCreateOrderShipmentMutation();
  const [transitionStatus, { isLoading: isTransitioning }] =
    useTransitionOrderStatusMutation();
  const isLoading = isCreating || isTransitioning;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedCourier =
      courierName === "OTHER" ? customCourier.trim() : courierName;

    if (!selectedCourier) {
      toast.error("Courier name is required");
      return;
    }

    try {
      await createShipment({
        orderNumber,
        data: {
          courierName: selectedCourier,
          trackingNumber: trackingNumber.trim() || null,
          trackingUrl: trackingUrl.trim() || null,
          note: note.trim() || null,
        },
      }).unwrap();

      if (autoDispatch) {
        try {
          await transitionStatus({
            orderNumber,
            data: {
              status: "SHIPPED",
              note: `Assigned to ${selectedCourier}${
                trackingNumber.trim() ? ` (${trackingNumber.trim()})` : ""
              }`,
            },
          }).unwrap();
        } catch (dispatchErr: any) {
          console.warn("Auto-dispatch transition warning:", dispatchErr);
        }
      }

      toast.success(
        autoDispatch
          ? `Shipment created and order #${orderNumber} marked as Shipped!`
          : `Shipment created successfully for order #${orderNumber}`
      );
      onOpenChange(false);
      setTrackingNumber("");
      setTrackingUrl("");
      setNote("");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create shipment");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Truck className="size-5" />
            </div>
            <div>
              <DialogTitle>Create Courier Shipment</DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Assign a delivery courier and tracking number for #{orderNumber}
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Courier Selector */}
          <div className="space-y-1.5">
            <Label htmlFor="courier-select">Courier Partner</Label>
            <select
              id="courier-select"
              value={courierName}
              onChange={(e) => setCourierName(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {COMMON_COURIERS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              <option value="OTHER">Other Courier (Custom Name)</option>
            </select>
          </div>

          {courierName === "OTHER" && (
            <div className="space-y-1.5">
              <Label htmlFor="custom-courier">Custom Courier Name</Label>
              <Input
                id="custom-courier"
                placeholder="Enter courier name"
                value={customCourier}
                onChange={(e) => setCustomCourier(e.target.value)}
                required
              />
            </div>
          )}

          {/* Tracking Number */}
          <div className="space-y-1.5">
            <Label htmlFor="tracking-num">Tracking / Consignment ID</Label>
            <Input
              id="tracking-num"
              placeholder="e.g. PT-889104, ST-33921"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
            />
          </div>

          {/* Tracking URL */}
          <div className="space-y-1.5">
            <Label htmlFor="tracking-url">Live Tracking URL (Optional)</Label>
            <Input
              id="tracking-url"
              type="url"
              placeholder="https://merchant.pathao.com/tracking/..."
              value={trackingUrl}
              onChange={(e) => setTrackingUrl(e.target.value)}
            />
          </div>

          {/* Fulfillment Note */}
          <div className="space-y-1.5">
            <Label htmlFor="shipment-note">Fulfillment Note (Optional)</Label>
            <Textarea
              id="shipment-note"
              rows={2}
              placeholder="Internal packing notes or package weight..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {/* Auto-dispatch option */}
          <div className="flex items-center space-x-2 rounded-lg border bg-muted/30 p-2.5">
            <input
              type="checkbox"
              id="auto-dispatch"
              checked={autoDispatch}
              onChange={(e) => setAutoDispatch(e.target.checked)}
              className="size-4 rounded border-gray-300 text-primary accent-primary focus:ring-primary cursor-pointer"
            />
            <Label
              htmlFor="auto-dispatch"
              className="text-xs text-muted-foreground cursor-pointer font-normal"
            >
              Automatically update order status to{" "}
              <strong className="text-foreground font-semibold">SHIPPED</strong>
            </Label>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="gap-1.5">
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Truck className="size-4" />
              )}
              Create & Assign Shipment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
