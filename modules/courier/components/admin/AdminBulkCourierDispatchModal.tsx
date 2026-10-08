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
  CheckCircle2,
  XCircle,
  ExternalLink,
  Loader2,
  AlertCircle,
  Package,
} from "lucide-react";
import {
  useGetCourierProvidersQuery,
  useBulkBookCourierOrdersMutation,
} from "../../courierApi";
import type { Order } from "@/modules/order/order.types";
import type { BulkBookCourierResult } from "../../types";

interface AdminBulkCourierDispatchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedOrders: Order[];
  onDispatchComplete?: () => void;
}

export function AdminBulkCourierDispatchModal({
  open,
  onOpenChange,
  selectedOrders,
  onDispatchComplete,
}: AdminBulkCourierDispatchModalProps) {
  const { data: providersData, isLoading: isLoadingProviders } =
    useGetCourierProvidersQuery();
  const [bulkBook, { isLoading: isBooking }] =
    useBulkBookCourierOrdersMutation();

  const [selectedCourierCode, setSelectedCourierCode] = useState<string>("");
  const [weight, setWeight] = useState<number>(0.5);
  const [customNote, setCustomNote] = useState<string>("");
  const [dispatchReport, setDispatchReport] =
    useState<BulkBookCourierResult | null>(null);

  const providers = (providersData?.data || []).filter((p) => p.isActive);

  React.useEffect(() => {
    if (!selectedCourierCode && providers.length > 0) {
      const defaultProv = providers.find((p) => p.isDefault) || providers[0];
      setSelectedCourierCode(defaultProv.code);
    }
  }, [providers, selectedCourierCode]);

  const handleStartBulkDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourierCode) {
      toast.error("Please select a courier provider");
      return;
    }

    const orderNumbers = selectedOrders.map((o) => o.orderNumber);

    try {
      const res = await bulkBook({
        orderNumbers,
        courierCode: selectedCourierCode,
        customNote: customNote.trim() || undefined,
        itemWeightKg: Number(weight) || 0.5,
      }).unwrap();

      if (res?.data) {
        setDispatchReport(res.data);
        if (res.data.succeeded > 0) {
          toast.success(
            `Dispatched ${res.data.succeeded} of ${res.data.total} orders to courier`
          );
        } else {
          toast.error("All orders in the batch failed to dispatch");
        }
        if (onDispatchComplete) {
          onDispatchComplete();
        }
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to process bulk dispatch");
    }
  };

  const handleClose = () => {
    setDispatchReport(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Truck className="size-5" />
            </div>
            <div>
              <DialogTitle>Bulk Courier Dispatch</DialogTitle>
              <DialogDescription>
                Dispatch {selectedOrders.length} selected orders to courier (Steadfast / Pathao)
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {dispatchReport ? (
          <div className="space-y-4 py-2">
            {/* Summary Banner */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-lg border bg-muted/30">
                <p className="text-xs text-muted-foreground font-medium">Total Batch</p>
                <p className="text-xl font-bold text-foreground">{dispatchReport.total}</p>
              </div>
              <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10">
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Succeeded</p>
                <p className="text-xl font-bold text-emerald-600">{dispatchReport.succeeded}</p>
              </div>
              <div className="p-3 rounded-lg border border-rose-500/20 bg-rose-500/10">
                <p className="text-xs text-rose-700 dark:text-rose-400 font-medium">Failed</p>
                <p className="text-xl font-bold text-rose-600">{dispatchReport.failed}</p>
              </div>
            </div>

            {/* Detailed per-order list */}
            <div className="rounded-lg border divide-y max-h-72 overflow-y-auto text-xs">
              {dispatchReport.results.map((r) => (
                <div key={r.orderNumber} className="p-3 flex items-center justify-between gap-3">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">#{r.orderNumber}</span>
                      {r.success ? (
                        <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-700 border-emerald-500/20">
                          Dispatched
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] bg-rose-500/10 text-rose-700 border-rose-500/20">
                          Failed
                        </Badge>
                      )}
                    </div>
                    {r.success ? (
                      <p className="text-muted-foreground font-mono text-[11px]">
                        Consignment: {r.consignmentId} | Tracking: {r.trackingCode}
                      </p>
                    ) : (
                      <p className="text-rose-600 dark:text-rose-400 text-[11px]">
                        {r.error}
                      </p>
                    )}
                  </div>

                  {r.trackingUrl && (
                    <a
                      href={r.trackingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline flex items-center gap-1 font-semibold shrink-0"
                    >
                      Track
                      <ExternalLink className="size-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" onClick={handleClose} className="w-full">
                Close Report
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleStartBulkDispatch} className="space-y-4 pt-1">
            {/* Courier Selection */}
            <div className="space-y-1.5">
              <Label>Select Courier Partner</Label>
              {isLoadingProviders ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                  <Loader2 className="size-3.5 animate-spin" /> Loading providers...
                </div>
              ) : providers.length === 0 ? (
                <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs flex items-center gap-2">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>No active courier configured in Settings.</span>
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
                        <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 uppercase">
                          {p.isLive ? "Live" : "Sandbox"}
                        </Badge>
                        {p.isDefault && (
                          <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">
                            Default
                          </Badge>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Orders Snapshot */}
            <div className="rounded-lg border p-3 bg-muted/20 space-y-2 text-xs">
              <div className="flex justify-between items-center border-b pb-1.5">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Package className="size-3.5 text-primary" />
                  Selected Orders Batch ({selectedOrders.length})
                </span>
                <span className="font-medium text-muted-foreground">
                  Total COD: ৳
                  {selectedOrders
                    .reduce((sum, o) => sum + Number(o.dueAmount ?? o.grandTotal ?? 0), 0)
                    .toLocaleString()}
                </span>
              </div>
              <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                {selectedOrders.map((o) => (
                  <div key={o.id} className="flex justify-between text-[11px] text-muted-foreground">
                    <span>
                      #{o.orderNumber} ({o.customerName})
                    </span>
                    <span className="font-mono">
                      ৳{Number(o.dueAmount ?? o.grandTotal ?? 0).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Weight and Custom Note */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="bulk-weight" className="text-xs">
                  Estimated Weight Per Parcel (KG)
                </Label>
                <Input
                  id="bulk-weight"
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={weight}
                  onChange={(e) => setWeight(parseFloat(e.target.value) || 0.5)}
                  required
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="bulk-note" className="text-xs">
                  Batch Dispatch Instruction / Note (Optional)
                </Label>
                <Textarea
                  id="bulk-note"
                  rows={2}
                  placeholder="e.g. Handle with care, verified customer..."
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
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
                Dispatch {selectedOrders.length} Orders
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
