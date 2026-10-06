"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ArrowRight, Loader2, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useTransitionOrderStatusMutation } from "../../orderApi";
import type { OrderTransitionInput } from "../../order.types";

interface AdminOrderStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderNumber: string;
  currentStatus: string;
  targetStatus?: OrderTransitionInput["status"] | null;
}

const ALLOWED_TRANSITIONS: Record<string, OrderTransitionInput["status"][]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "CANCELLED"],
};

export function AdminOrderStatusDialog({
  open,
  onOpenChange,
  orderNumber,
  currentStatus,
  targetStatus: defaultTargetStatus,
}: AdminOrderStatusDialogProps) {
  const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
  const [selectedStatus, setSelectedStatus] =
    useState<OrderTransitionInput["status"]>(
      defaultTargetStatus || allowed[0] || "CONFIRMED"
    );
  const [note, setNote] = useState("");

  const [transitionStatus, { isLoading }] = useTransitionOrderStatusMutation();

  useEffect(() => {
    if (defaultTargetStatus && allowed.includes(defaultTargetStatus)) {
      setSelectedStatus(defaultTargetStatus);
    } else if (allowed.length > 0) {
      setSelectedStatus(allowed[0]);
    }
    setNote("");
  }, [open, defaultTargetStatus, currentStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStatus) return;

    try {
      await transitionStatus({
        orderNumber,
        data: {
          status: selectedStatus,
          note: note.trim() || undefined,
        },
      }).unwrap();

      toast.success(`Order #${orderNumber} marked as ${selectedStatus}`);
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update order status");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Order Status</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Status Flow Indicator */}
          <div className="flex items-center justify-between rounded-xl border bg-muted/30 p-3">
            <div>
              <p className="text-[11px] text-muted-foreground uppercase font-medium">
                Current Status
              </p>
              <Badge variant="outline" className="mt-1 font-semibold">
                {currentStatus}
              </Badge>
            </div>

            <ArrowRight className="size-4 text-muted-foreground" />

            <div>
              <p className="text-[11px] text-muted-foreground uppercase font-medium">
                New Status
              </p>
              <Badge
                variant="default"
                className={
                  selectedStatus === "CANCELLED"
                    ? "bg-destructive text-destructive-foreground mt-1"
                    : selectedStatus === "DELIVERED"
                    ? "bg-emerald-600 mt-1"
                    : "bg-primary mt-1"
                }
              >
                {selectedStatus}
              </Badge>
            </div>
          </div>

          {/* Select Target Status */}
          <div className="space-y-1.5">
            <Label htmlFor="next-status">Select Next Status</Label>
            <select
              id="next-status"
              value={selectedStatus}
              onChange={(e) =>
                setSelectedStatus(
                  e.target.value as OrderTransitionInput["status"]
                )
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {allowed.map((st) => (
                <option key={st} value={st}>
                  {st === "CANCELLED" ? "Cancel Order" : `Move to ${st}`}
                </option>
              ))}
            </select>
          </div>

          {selectedStatus === "CANCELLED" && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive flex items-start gap-2">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>
                Cancelling this order will release all reserved inventory stock back to the active catalog.
              </span>
            </div>
          )}

          {/* Transition Note */}
          <div className="space-y-1.5">
            <Label htmlFor="status-note">
              Transition Note {selectedStatus === "CANCELLED" ? "(Reason)" : "(Optional)"}
            </Label>
            <Textarea
              id="status-note"
              rows={2}
              placeholder={
                selectedStatus === "CANCELLED"
                  ? "e.g. Customer requested cancellation / unreachable phone..."
                  : "e.g. Order confirmed via phone call with customer..."
              }
              value={note}
              onChange={(e) => setNote(e.target.value)}
              required={selectedStatus === "CANCELLED"}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !selectedStatus}
              variant={selectedStatus === "CANCELLED" ? "destructive" : "default"}
            >
              {isLoading ? (
                <Loader2 className="size-4 animate-spin mr-1" />
              ) : null}
              Confirm Status Change
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
