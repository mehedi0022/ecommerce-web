"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  RefreshCw,
  SlidersHorizontal,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  useGetAdminRefundsQuery,
  useTransitionAdminRefundMutation,
} from "../../refundApi";
import type { Refund, RefundStatus } from "../../refund.types";

const STATUS_BADGE: Record<RefundStatus, { label: string; className: string }> = {
  PENDING: {
    label: "Pending Payout",
    className: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  },
  PROCESSING: {
    label: "Processing",
    className: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  },
  COMPLETED: {
    label: "Paid / Completed",
    className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  },
  FAILED: {
    label: "Payout Failed",
    className: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-muted text-muted-foreground border-border",
  },
};

const STATUS_TABS = [
  { key: "ALL", label: "All Refunds" },
  { key: "PENDING", label: "Pending" },
  { key: "PROCESSING", label: "Processing" },
  { key: "COMPLETED", label: "Completed" },
  { key: "FAILED", label: "Failed" },
];

export function AdminRefundsListPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, refetch } = useGetAdminRefundsQuery(
    selectedStatus !== "ALL" ? { status: selectedStatus } : undefined
  );
  const [transitionRefund, { isLoading: isTransitioning }] =
    useTransitionAdminRefundMutation();

  const [activeRefundForTransition, setActiveRefundForTransition] = useState<{
    refund: Refund;
    targetStatus: RefundStatus;
  } | null>(null);
  const [transitionNote, setTransitionNote] = useState("");

  const refunds = data?.data || [];

  const filteredRefunds = refunds.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.refundNumber.toLowerCase().includes(q) ||
      r.order?.orderNumber?.toLowerCase().includes(q) ||
      r.return?.returnNumber?.toLowerCase().includes(q) ||
      r.order?.customerName?.toLowerCase().includes(q)
    );
  });

  const totalRefundAmount = refunds
    .filter((r) => r.status === "COMPLETED")
    .reduce((sum, r) => sum + Number(r.amount || 0), 0);

  const pendingCount = refunds.filter((r) => r.status === "PENDING" || r.status === "PROCESSING").length;
  const completedCount = refunds.filter((r) => r.status === "COMPLETED").length;

  const handleConfirmTransition = async () => {
    if (!activeRefundForTransition) return;
    try {
      await transitionRefund({
        refundNumber: activeRefundForTransition.refund.refundNumber,
        data: {
          status: activeRefundForTransition.targetStatus,
          note: transitionNote.trim() || undefined,
        },
      }).unwrap();

      toast.success(
        `Refund #${activeRefundForTransition.refund.refundNumber} updated to ${activeRefundForTransition.targetStatus}`
      );
      setActiveRefundForTransition(null);
      void refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update refund status");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <DollarSign className="size-6 text-emerald-600" />
            Customer Refunds Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track customer refunds, approve payouts, and verify bank/MFS payment settlements.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 self-start sm:self-auto"
          onClick={() => refetch()}
        >
          <RefreshCw className="size-3.5" />
          Refresh
        </Button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="bg-emerald-500/5 border-emerald-500/20 shadow-none">
          <CardContent className="p-4 space-y-1">
            <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold uppercase">
              Total Settled Refunds
            </p>
            <p className="text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-400">
              ৳{totalRefundAmount.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-amber-500/5 border-amber-500/20 shadow-none">
          <CardContent className="p-4 space-y-1">
            <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold uppercase">
              Pending Payouts
            </p>
            <p className="text-2xl font-bold font-mono text-amber-700 dark:text-amber-400">
              {pendingCount}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-none">
          <CardContent className="p-4 space-y-1">
            <p className="text-xs text-muted-foreground font-semibold uppercase">
              Completed Refunds
            </p>
            <p className="text-2xl font-bold font-mono text-foreground">
              {completedCount}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs & Search */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {STATUS_TABS.map((tab) => (
              <Button
                key={tab.key}
                size="sm"
                variant={selectedStatus === tab.key ? "default" : "outline"}
                className="h-8 text-xs shrink-0"
                onClick={() => setSelectedStatus(tab.key)}
              >
                {tab.label}
              </Button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search refund, order, or return #..."
              className="pl-8 h-8 text-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="py-16 text-center text-xs text-muted-foreground space-y-2">
                <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p>Loading refund records...</p>
              </div>
            ) : filteredRefunds.length === 0 ? (
              <div className="py-16 text-center text-xs text-muted-foreground space-y-2">
                <DollarSign className="size-8 mx-auto text-muted-foreground/50" />
                <p className="font-semibold text-foreground">No refund records found</p>
                <p>No refunds matching the current filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider border-b">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Refund ID</th>
                      <th className="py-3 px-4 font-semibold">Order</th>
                      <th className="py-3 px-4 font-semibold">Return</th>
                      <th className="py-3 px-4 font-semibold">Amount</th>
                      <th className="py-3 px-4 font-semibold">Method</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold">Created Date</th>
                      <th className="py-3 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredRefunds.map((rf) => {
                      const badge = STATUS_BADGE[rf.status] || {
                        label: rf.status,
                        className: "bg-muted text-foreground",
                      };

                      return (
                        <tr key={rf.id} className="hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-foreground">
                            {rf.refundNumber}
                          </td>
                          <td className="py-3 px-4 font-mono text-primary font-semibold">
                            {rf.order ? (
                              <Link
                                href={`/admin/orders/${rf.order.orderNumber}`}
                                className="hover:underline"
                              >
                                #{rf.order.orderNumber}
                              </Link>
                            ) : (
                              "N/A"
                            )}
                          </td>
                          <td className="py-3 px-4 font-mono text-muted-foreground">
                            {rf.return ? (
                              <Link
                                href={`/admin/returns/${rf.return.returnNumber}`}
                                className="text-primary hover:underline"
                              >
                                {rf.return.returnNumber}
                              </Link>
                            ) : (
                              "Direct"
                            )}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-emerald-600 text-sm">
                            ৳{Number(rf.amount).toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium text-foreground">
                              {rf.method ? rf.method.replace(/_/g, " ") : "Original Payment"}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              variant="outline"
                              className={`text-[10px] ${badge.className}`}
                            >
                              {badge.label}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {new Date(rf.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {rf.status === "PENDING" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs"
                                onClick={() => {
                                  setActiveRefundForTransition({
                                    refund: rf,
                                    targetStatus: "PROCESSING",
                                  });
                                  setTransitionNote("");
                                }}
                              >
                                Process
                              </Button>
                            )}

                            {rf.status === "PROCESSING" && (
                              <Button
                                size="sm"
                                className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                                onClick={() => {
                                  setActiveRefundForTransition({
                                    refund: rf,
                                    targetStatus: "COMPLETED",
                                  });
                                  setTransitionNote("");
                                }}
                              >
                                Mark Paid
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transition Dialog */}
      {activeRefundForTransition && (
        <Dialog
          open={Boolean(activeRefundForTransition)}
          onOpenChange={(open) => !open && setActiveRefundForTransition(null)}
        >
          <DialogContent className="w-full sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base">
                Transition Refund #{activeRefundForTransition.refund.refundNumber}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Update status to <strong>{activeRefundForTransition.targetStatus}</strong> for ৳
                {Number(activeRefundForTransition.refund.amount).toLocaleString()}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              <div className="space-y-1.5">
                <Label htmlFor="rf-trans-note">Payment Reference / TrxID (Optional)</Label>
                <Textarea
                  id="rf-trans-note"
                  rows={3}
                  placeholder="e.g. Bank Reference #99281, bKash TrxID: 9X29A..."
                  value={transitionNote}
                  onChange={(e) => setTransitionNote(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setActiveRefundForTransition(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmTransition}
                disabled={isTransitioning}
                className="gap-1.5 bg-primary text-primary-foreground"
              >
                {isTransitioning && <Loader2 className="size-4 animate-spin" />}
                Confirm Status
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
