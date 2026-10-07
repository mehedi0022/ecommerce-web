"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  RotateCcw,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  AlertCircle,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useGetUserReturnsQuery } from "../../returnApi";
import type { Return, ReturnStatus } from "../../return.types";

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
    label: "Completed / Refunded",
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

interface CustomerReturnsListProps {
  hideHeader?: boolean;
}

export function CustomerReturnsList({ hideHeader = false }: CustomerReturnsListProps = {}) {
  const { data, isLoading, refetch } = useGetUserReturnsQuery();
  const [selectedReturn, setSelectedReturn] = useState<Return | null>(null);

  const returns = data?.data || [];

  return (
    <div className="space-y-6">
      {!hideHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <RotateCcw className="size-6 text-primary" />
              My Returns & Exchanges
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Track status and progress of your return requests and refund payouts.
            </p>
          </div>

          <Link href="/account/orders">
            <Button variant="outline" size="sm" className="text-xs gap-1.5">
              <Package className="size-3.5" />
              View Past Orders
            </Button>
          </Link>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-sm text-muted-foreground space-y-2">
          <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Loading your returns...</p>
        </div>
      ) : returns.length === 0 ? (
        <Card className="border-dashed bg-muted/20">
          <CardContent className="py-12 text-center space-y-3">
            <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <RotateCcw className="size-6" />
            </div>
            <h3 className="font-semibold text-base text-foreground">
              No Return Requests Found
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Have an issue with a delivered item? Open your delivered orders and click "Request Return" within the return window.
            </p>
            <Link href="/account/orders">
              <Button size="sm" className="mt-2 text-xs">
                Browse My Orders
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {returns.map((ret) => {
            const badge = STATUS_BADGE[ret.status] || {
              label: ret.status,
              className: "bg-muted text-foreground",
            };

            return (
              <Card
                key={ret.id}
                className="hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => setSelectedReturn(ret)}
              >
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-sm text-foreground">
                        {ret.returnNumber}
                      </span>
                      <Badge variant="outline" className={`text-[10px] ${badge.className}`}>
                        {badge.label}
                      </Badge>
                    </div>

                    <div className="text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                      {ret.order && (
                        <span>
                          Order: <strong>#{ret.order.orderNumber}</strong>
                        </span>
                      )}
                      <span>
                        Requested: {new Date(ret.requestedAt).toLocaleDateString()}
                      </span>
                      <span>
                        Items: {ret.items?.length || 0}
                      </span>
                    </div>

                    {ret.items && ret.items.length > 0 && (
                      <p className="text-xs text-foreground font-medium line-clamp-1">
                        {ret.items.map((i) => `${i.orderItem?.productName || "Product"} (${i.quantity}x)`).join(", ")}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs gap-1 h-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedReturn(ret);
                      }}
                    >
                      Details
                      <ChevronRight className="size-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Return Details Modal */}
      {selectedReturn && (
        <Dialog open={Boolean(selectedReturn)} onOpenChange={() => setSelectedReturn(null)}>
          <DialogContent className="w-full sm:max-w-xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between gap-2">
                <DialogTitle className="text-base font-bold font-mono">
                  {selectedReturn.returnNumber}
                </DialogTitle>
                <Badge
                  variant="outline"
                  className={`text-[10px] ${
                    (STATUS_BADGE[selectedReturn.status] || {}).className
                  }`}
                >
                  {STATUS_BADGE[selectedReturn.status]?.label || selectedReturn.status}
                </Badge>
              </div>
              <DialogDescription className="text-xs">
                Requested on {new Date(selectedReturn.requestedAt).toLocaleString()}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2 text-xs">
              {/* Items List */}
              <div className="space-y-2">
                <p className="font-semibold text-foreground">Returned Items</p>
                <div className="space-y-2">
                  {selectedReturn.items?.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-lg border bg-muted/20 space-y-1"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-semibold text-foreground">
                          {item.orderItem?.productName || "Product"}
                        </span>
                        <span className="font-bold text-foreground">
                          {item.quantity} units
                        </span>
                      </div>
                      <div className="flex justify-between text-muted-foreground text-[11px]">
                        <span>Reason: {item.reason.replace(/_/g, " ")}</span>
                        {item.condition && <span>Condition: {item.condition}</span>}
                      </div>
                      {item.customerNote && (
                        <p className="text-[11px] text-muted-foreground italic">
                          "{item.customerNote}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer & Admin notes */}
              {selectedReturn.adminNote && (
                <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 space-y-1">
                  <p className="font-semibold text-primary text-[11px]">Note from Support Team:</p>
                  <p className="text-foreground">{selectedReturn.adminNote}</p>
                </div>
              )}

              {/* Refunds if any */}
              {selectedReturn.refunds && selectedReturn.refunds.length > 0 && (
                <div className="space-y-2 pt-2 border-t">
                  <p className="font-semibold text-foreground">Refund Information</p>
                  {selectedReturn.refunds.map((rf) => (
                    <div
                      key={rf.id}
                      className="p-3 rounded-lg border bg-emerald-500/10 border-emerald-500/20 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-mono font-bold text-foreground">
                          #{rf.refundNumber}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Method: {rf.method || "Original Payment"} &bull; Status: {rf.status}
                        </p>
                      </div>
                      <span className="font-bold font-mono text-emerald-600 text-sm">
                        ৳{Number(rf.amount).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* History Timeline */}
              {selectedReturn.statusHistory && selectedReturn.statusHistory.length > 0 && (
                <div className="space-y-2 pt-2 border-t">
                  <p className="font-semibold text-foreground">Status History</p>
                  <div className="space-y-2">
                    {selectedReturn.statusHistory.map((h) => (
                      <div key={h.id} className="flex items-start gap-2 text-[11px]">
                        <Clock className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-foreground">
                            {h.toStatus}
                          </span>
                          <span className="text-muted-foreground ml-2">
                            {new Date(h.createdAt).toLocaleString()}
                          </span>
                          {h.note && (
                            <p className="text-muted-foreground mt-0.5 italic">
                              {h.note}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
