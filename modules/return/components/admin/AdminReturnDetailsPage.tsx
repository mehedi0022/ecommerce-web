"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Package,
  User,
  Phone,
  Mail,
  Truck,
  ExternalLink,
  DollarSign,
  AlertCircle,
  FileCheck2,
  Boxes,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  useGetAdminReturnByNumberQuery,
  useTransitionAdminReturnMutation,
  useInspectAdminReturnItemMutation,
} from "../../returnApi";
import { AdminCreateRefundModal } from "@/modules/refund/components/admin/AdminCreateRefundModal";
import { mediaUrl } from "@/modules/catalog/catalog.utils";
import type {
  ReturnStatus,
  ReturnItem,
  ReturnItemCondition,
} from "../../return.types";

interface AdminReturnDetailsPageProps {
  returnNumber: string;
}

const STATUS_BADGE: Record<ReturnStatus, { label: string; className: string }> = {
  REQUESTED: {
    label: "Under Review",
    className: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  },
  APPROVED: {
    label: "Approved",
    className: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  },
  IN_TRANSIT: {
    label: "In Transit",
    className: "bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20",
  },
  RECEIVED: {
    label: "Received for Inspection",
    className: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-muted text-muted-foreground border-border",
  },
};

export function AdminReturnDetailsPage({ returnNumber }: AdminReturnDetailsPageProps) {
  const { data, isLoading, isError, refetch } =
    useGetAdminReturnByNumberQuery(returnNumber);
  const [transitionReturn, { isLoading: isTransitioning }] =
    useTransitionAdminReturnMutation();
  const [inspectItem, { isLoading: isInspecting }] =
    useInspectAdminReturnItemMutation();

  // Dialog states
  const [transitionNoteDialog, setTransitionNoteDialog] = useState<{
    open: boolean;
    targetStatus: ReturnStatus;
    title: string;
  }>({
    open: false,
    targetStatus: "APPROVED",
    title: "",
  });
  const [transitionNote, setTransitionNote] = useState("");

  const [inspectingItem, setInspectingItem] = useState<ReturnItem | null>(null);
  const [itemCondition, setItemCondition] = useState<ReturnItemCondition>("GOOD");
  const [restockQty, setRestockQty] = useState<number>(0);
  const [inspectAdminNote, setInspectAdminNote] = useState<string>("");

  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);

  const ret = data?.data;

  if (isLoading) {
    return (
      <div className="text-center py-24 space-y-3">
        <div className="size-7 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-muted-foreground">Loading return details...</p>
      </div>
    );
  }

  if (isError || !ret) {
    return (
      <div className="text-center py-24 space-y-3">
        <AlertCircle className="size-8 text-destructive mx-auto" />
        <h2 className="text-lg font-bold">Return Request Not Found</h2>
        <p className="text-xs text-muted-foreground">
          Could not find return details for #{returnNumber}.
        </p>
        <Link href="/admin/returns">
          <Button variant="outline" size="sm" className="mt-2 text-xs">
            Back to Returns
          </Button>
        </Link>
      </div>
    );
  }

  const badge = STATUS_BADGE[ret.status] || {
    label: ret.status,
    className: "bg-muted text-foreground",
  };

  const handleOpenTransition = (targetStatus: ReturnStatus, title: string) => {
    setTransitionNoteDialog({
      open: true,
      targetStatus,
      title,
    });
    setTransitionNote("");
  };

  const handleConfirmTransition = async () => {
    try {
      await transitionReturn({
        returnNumber,
        data: {
          status: transitionNoteDialog.targetStatus,
          note: transitionNote.trim() || undefined,
        },
      }).unwrap();

      toast.success(`Return status updated to ${transitionNoteDialog.targetStatus}`);
      setTransitionNoteDialog((prev) => ({ ...prev, open: false }));
      void refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update return status");
    }
  };

  const handleOpenInspect = (item: ReturnItem) => {
    setInspectingItem(item);
    setItemCondition("GOOD");
    setRestockQty(item.quantity);
    setInspectAdminNote("");
  };

  const handleConfirmInspect = async () => {
    if (!inspectingItem) return;
    try {
      await inspectItem({
        returnNumber,
        itemId: inspectingItem.id,
        data: {
          condition: itemCondition,
          restockQuantity: Number(restockQty),
          adminNote: inspectAdminNote.trim() || undefined,
        },
      }).unwrap();

      toast.success(
        `Item inspected! Restocked ${restockQty} unit(s) into inventory.`
      );
      setInspectingItem(null);
      void refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to inspect item");
    }
  };

  // Calculate total returned value
  const totalReturnValue = (ret.items || []).reduce(
    (sum, item) => sum + Number(item.orderItem?.unitPrice || 0) * item.quantity,
    0
  );

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/returns">
            <Button variant="outline" size="icon" className="size-8">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight font-mono">
                {ret.returnNumber}
              </h1>
              <Badge variant="outline" className={`text-xs ${badge.className}`}>
                {badge.label}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Requested on {new Date(ret.requestedAt).toLocaleString()}
              {ret.order && ` \u2022 Order #${ret.order.orderNumber}`}
            </p>
          </div>
        </div>

        {/* Action Buttons based on status */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {ret.status === "REQUESTED" && (
            <>
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs h-8"
                onClick={() => handleOpenTransition("APPROVED", "Approve Return Request")}
              >
                <CheckCircle2 className="size-3.5" />
                Approve Return
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="gap-1.5 text-xs h-8"
                onClick={() => handleOpenTransition("REJECTED", "Reject Return Request")}
              >
                <XCircle className="size-3.5" />
                Reject
              </Button>
            </>
          )}

          {ret.status === "APPROVED" && (
            <Button
              size="sm"
              className="bg-violet-600 hover:bg-violet-700 text-white gap-1.5 text-xs h-8"
              onClick={() => handleOpenTransition("IN_TRANSIT", "Mark as In-Transit")}
            >
              <Truck className="size-3.5" />
              Mark In-Transit
            </Button>
          )}

          {ret.status === "IN_TRANSIT" && (
            <Button
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 text-xs h-8"
              onClick={() => handleOpenTransition("RECEIVED", "Confirm Arrival / Received")}
            >
              <Package className="size-3.5" />
              Mark Received for Inspection
            </Button>
          )}

          {ret.status === "RECEIVED" && (
            <>
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs h-8"
                onClick={() => handleOpenTransition("COMPLETED", "Finalize & Complete Return")}
                disabled={ret.items?.some((i) => i.restockStatus === "PENDING")}
                title={
                  ret.items?.some((i) => i.restockStatus === "PENDING")
                    ? "Please inspect all return items before completing"
                    : "Complete Return"
                }
              >
                <FileCheck2 className="size-3.5" />
                Complete Return
              </Button>
            </>
          )}

          {["RECEIVED", "COMPLETED"].includes(ret.status) && (
            <Button
              size="sm"
              variant="outline"
              className="border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 gap-1.5 text-xs h-8"
              onClick={() => setIsRefundModalOpen(true)}
            >
              <DollarSign className="size-3.5" />
              Issue Refund
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Items & Refund Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Returned Items Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Boxes className="size-4 text-primary" />
                    Returned Items ({ret.items?.length || 0})
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Inspect physical items and restock verified units back to stock
                  </CardDescription>
                </div>
                <span className="font-mono font-bold text-sm text-foreground">
                  Est. ৳{totalReturnValue.toLocaleString()}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div className="divide-y rounded-lg border bg-muted/10">
                {ret.items?.map((item) => (
                  <div key={item.id} className="p-3.5 space-y-2 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        {(() => {
                          const img =
                            item.orderItem?.product?.images?.find((i: any) => i.isPrimary)
                              ?.imageUrl ||
                            item.orderItem?.product?.images?.[0]?.imageUrl;

                          return (
                            <div className="size-12 shrink-0 rounded-lg border bg-background overflow-hidden flex items-center justify-center relative">
                              {img ? (
                                <img
                                  src={mediaUrl(img)}
                                  alt={item.orderItem?.productName || "Product"}
                                  className="size-full object-cover"
                                />
                              ) : (
                                <Package className="size-5 text-muted-foreground/60" />
                              )}
                            </div>
                          );
                        })()}
                        <div>
                          <p className="font-semibold text-foreground text-sm">
                            {item.orderItem?.productName || "Product"}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            SKU: {item.orderItem?.sku || "N/A"} &bull; Unit Price: ৳
                            {Number(item.orderItem?.unitPrice || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">
                          {item.quantity} units requested
                        </span>

                        {ret.status === "RECEIVED" && item.restockStatus === "PENDING" && (
                          <Button
                            size="sm"
                            variant="default"
                            className="h-7 text-xs px-2.5 gap-1"
                            onClick={() => handleOpenInspect(item)}
                          >
                            <FileCheck2 className="size-3" />
                            Inspect & Restock
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Reasons & Notes */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                      <div className="p-2 rounded bg-muted/40">
                        <span className="text-muted-foreground">Reason: </span>
                        <strong className="text-foreground">
                          {item.reason.replace(/_/g, " ")}
                        </strong>
                        {item.customerNote && (
                          <p className="text-muted-foreground mt-0.5 italic">
                            "{item.customerNote}"
                          </p>
                        )}
                      </div>

                      <div className="p-2 rounded bg-muted/40 flex flex-col justify-between">
                        <div>
                          <span className="text-muted-foreground">Restock Status: </span>
                          <Badge
                            variant={
                              item.restockStatus === "RESTOCKED"
                                ? "default"
                                : item.restockStatus === "PENDING"
                                ? "outline"
                                : "secondary"
                            }
                            className="text-[10px] ml-1 uppercase"
                          >
                            {item.restockStatus}
                          </Badge>
                        </div>
                        {item.condition && (
                          <p className="text-muted-foreground mt-0.5">
                            Condition: <strong>{item.condition}</strong> (Restocked: {item.restockQuantity}x)
                          </p>
                        )}
                        {item.adminNote && (
                          <p className="text-muted-foreground italic mt-0.5">
                            Inspector note: {item.adminNote}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Refund Records Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <DollarSign className="size-4 text-emerald-600" />
                    Refund Payouts ({ret.refunds?.length || 0})
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Customer refund transactions associated with this return
                  </CardDescription>
                </div>

                {["RECEIVED", "COMPLETED"].includes(ret.status) && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs gap-1 border-emerald-500/30 text-emerald-600"
                    onClick={() => setIsRefundModalOpen(true)}
                  >
                    <DollarSign className="size-3" />
                    Issue Refund
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {(!ret.refunds || ret.refunds.length === 0) ? (
                <div className="text-center py-6 text-xs text-muted-foreground border border-dashed rounded-lg bg-muted/10">
                  No refunds issued yet for this return.
                </div>
              ) : (
                <div className="space-y-2">
                  {ret.refunds.map((rf) => (
                    <div
                      key={rf.id}
                      className="p-3 rounded-lg border bg-muted/20 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-foreground">
                            #{rf.refundNumber}
                          </span>
                          <Badge variant="outline" className="text-[10px] uppercase">
                            {rf.status}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Method: {rf.method || "Original Payment"} &bull;{" "}
                          {new Date(rf.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <span className="font-mono font-bold text-sm text-emerald-600">
                        ৳{Number(rf.amount).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Order, Customer & Timeline */}
        <div className="space-y-6">
          {/* Order Snapshot Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Package className="size-4 text-primary" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs pt-0">
              {ret.order ? (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Order Number:</span>
                    <Link
                      href={`/admin/orders/${ret.order.orderNumber}`}
                      className="font-mono font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      {ret.order.orderNumber}
                      <ExternalLink className="size-3" />
                    </Link>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order Total:</span>
                    <span className="font-mono font-bold text-foreground">
                      ৳{Number(ret.order.grandTotal).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment:</span>
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {ret.order.paymentMethod}
                    </Badge>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">Order info not available</p>
              )}
            </CardContent>
          </Card>

          {/* Customer Snapshot */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <User className="size-4 text-primary" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs pt-0">
              {ret.order && (
                <>
                  <div className="flex items-center gap-2">
                    <User className="size-3.5 text-muted-foreground" />
                    <span className="font-medium text-foreground">
                      {ret.order.customerName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="size-3.5 text-muted-foreground" />
                    <span className="text-foreground">{ret.order.customerPhone}</span>
                  </div>
                  {ret.order.customerEmail && (
                    <div className="flex items-center gap-2">
                      <Mail className="size-3.5 text-muted-foreground" />
                      <span className="text-foreground">{ret.order.customerEmail}</span>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Timeline History Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Clock className="size-4 text-primary" />
                Status Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs pt-0">
              {ret.statusHistory?.map((h) => (
                <div key={h.id} className="flex items-start gap-2 text-[11px] pb-2 border-b last:border-b-0">
                  <div className="size-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-foreground">
                      {h.toStatus}
                    </span>
                    <span className="text-muted-foreground ml-2">
                      {new Date(h.createdAt).toLocaleDateString()} {new Date(h.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {h.note && (
                      <p className="text-muted-foreground mt-0.5 italic">
                        {h.note}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Transition Note Dialog */}
      <Dialog
        open={transitionNoteDialog.open}
        onOpenChange={(open) =>
          setTransitionNoteDialog((prev) => ({ ...prev, open }))
        }
      >
        <DialogContent className="w-full sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">{transitionNoteDialog.title}</DialogTitle>
            <DialogDescription className="text-xs">
              Transition return #{returnNumber} to status{" "}
              <strong>{transitionNoteDialog.targetStatus}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="space-y-1.5">
              <Label htmlFor="trans-note">Internal / Customer Note (Optional)</Label>
              <Textarea
                id="trans-note"
                rows={3}
                placeholder="e.g. Item approved, rider will collect parcel on Wednesday..."
                value={transitionNote}
                onChange={(e) => setTransitionNote(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setTransitionNoteDialog((prev) => ({ ...prev, open: false }))
              }
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmTransition}
              disabled={isTransitioning}
              className="gap-1.5"
            >
              {isTransitioning && <Loader2 className="size-4 animate-spin" />}
              Confirm Status Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Inspect Item Modal */}
      {inspectingItem && (
        <Dialog
          open={Boolean(inspectingItem)}
          onOpenChange={(open) => !open && setInspectingItem(null)}
        >
          <DialogContent className="w-full sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base">Inspect Returned Item</DialogTitle>
              <DialogDescription className="text-xs">
                {inspectingItem.orderItem?.productName} ({inspectingItem.quantity} unit(s))
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              <div className="space-y-1.5">
                <Label>Item Physical Condition *</Label>
                <Select
                  value={itemCondition}
                  onValueChange={(val) => setItemCondition(val as ReturnItemCondition)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select Condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UNOPENED">Unopened / Brand New</SelectItem>
                    <SelectItem value="GOOD">Good / Open Box</SelectItem>
                    <SelectItem value="USED">Used / Minor Signs</SelectItem>
                    <SelectItem value="DAMAGED">Damaged</SelectItem>
                    <SelectItem value="DEFECTIVE">Defective / Non-functional</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="restock-qty">
                  Quantity to Restock into Inventory (Max {inspectingItem.quantity})
                </Label>
                <Input
                  id="restock-qty"
                  type="number"
                  min="0"
                  max={inspectingItem.quantity}
                  value={restockQty}
                  onChange={(e) =>
                    setRestockQty(
                      Math.min(inspectingItem.quantity, Math.max(0, parseInt(e.target.value) || 0))
                    )
                  }
                />
                <p className="text-[11px] text-muted-foreground">
                  Setting &gt; 0 will automatically increase inventory stock for this product variant.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="inspect-note">Inspection Note</Label>
                <Textarea
                  id="inspect-note"
                  rows={2}
                  placeholder="e.g. Verified intact with accessories, eligible for restock."
                  value={inspectAdminNote}
                  onChange={(e) => setInspectAdminNote(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setInspectingItem(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmInspect}
                disabled={isInspecting}
                className="gap-1.5 bg-primary text-primary-foreground"
              >
                {isInspecting && <Loader2 className="size-4 animate-spin" />}
                Save & Restock Stock
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Refund Modal */}
      {isRefundModalOpen && (
        <AdminCreateRefundModal
          open={isRefundModalOpen}
          onOpenChange={setIsRefundModalOpen}
          returnNumber={returnNumber}
          orderNumber={ret.order?.orderNumber}
          suggestedAmount={totalReturnValue}
          onSuccess={() => {
            void refetch();
          }}
        />
      )}
    </div>
  );
}
