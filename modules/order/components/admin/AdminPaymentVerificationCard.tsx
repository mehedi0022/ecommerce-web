"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Clock,
  AlertCircle,
  Building2,
  Smartphone,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  useGetOrderTransactionsQuery,
  useVerifyPaymentTransactionMutation,
} from "@/modules/payment/paymentApi";
import type { OrderPaymentTransaction } from "@/modules/payment/types";

interface AdminPaymentVerificationCardProps {
  orderId: number;
  orderNumber: string;
  orderGrandTotal: string | number;
  currentPaymentStatus: string;
}

export function AdminPaymentVerificationCard({
  orderId,
  orderNumber,
  orderGrandTotal,
  currentPaymentStatus,
}: AdminPaymentVerificationCardProps) {
  const { data, isLoading, refetch } = useGetOrderTransactionsQuery(orderId);
  const [verifyPayment, { isLoading: isVerifying }] =
    useVerifyPaymentTransactionMutation();

  const [copiedTrxId, setCopiedTrxId] = useState<number | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTx, setRejectTx] = useState<OrderPaymentTransaction | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const transactions = data?.data || [];

  const handleCopy = (text: string, txId: number) => {
    navigator.clipboard.writeText(text);
    setCopiedTrxId(txId);
    toast.success("Transaction ID copied to clipboard!");
    setTimeout(() => setCopiedTrxId(null), 2000);
  };

  const handleApprove = async (tx: OrderPaymentTransaction) => {
    try {
      await verifyPayment({
        transactionId: tx.id,
        orderId,
        body: {
          status: "VERIFIED",
          adminNote: "Verified manually by admin",
        },
      }).unwrap();
      toast.success(`Transaction verified! Order marked as PAID.`);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to verify transaction");
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectTx) return;
    try {
      await verifyPayment({
        transactionId: rejectTx.id,
        orderId,
        body: {
          status: "REJECTED",
          adminNote: rejectReason || "Invalid or unverifiable Transaction ID",
        },
      }).unwrap();
      toast.error(`Transaction rejected. Order marked as FAILED.`);
      setRejectModalOpen(false);
      setRejectReason("");
      setRejectTx(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to reject transaction");
    }
  };

  const openRejectDialog = (tx: OrderPaymentTransaction) => {
    setRejectTx(tx);
    setRejectReason("");
    setRejectModalOpen(true);
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 text-[10px]">
            <CheckCircle2 className="size-3 mr-1 inline" /> VERIFIED
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className="bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20 text-[10px]">
            <XCircle className="size-3 mr-1 inline" /> REJECTED
          </Badge>
        );
      case "PENDING_VERIFICATION":
      default:
        return (
          <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 text-[10px] animate-pulse">
            <Clock className="size-3 mr-1 inline" /> PENDING VERIFY
          </Badge>
        );
    }
  };

  return (
    <>
      <Card className="shadow-none border-primary/20 bg-card">
        <CardHeader className="border-b py-3 px-5 flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="size-4 text-primary" />
            Payment Verification
          </CardTitle>
          <Badge
            variant="outline"
            className={`text-[10px] font-bold ${
              currentPaymentStatus === "PAID"
                ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
                : currentPaymentStatus === "FAILED"
                ? "bg-rose-500/10 text-rose-700 border-rose-500/20"
                : "bg-amber-500/10 text-amber-700 border-amber-500/20"
            }`}
          >
            Order Payment: {currentPaymentStatus}
          </Badge>
        </CardHeader>

        <CardContent className="p-5 space-y-4 text-xs">
          {isLoading ? (
            <div className="py-6 text-center text-muted-foreground">
              Loading payment transaction records...
            </div>
          ) : transactions.length === 0 ? (
            <div className="rounded-lg border border-dashed p-4 text-center text-muted-foreground bg-muted/20">
              <AlertCircle className="size-5 mx-auto mb-1 text-muted-foreground/60" />
              <p className="font-medium text-foreground text-xs">
                No manual transaction recorded
              </p>
              <p className="text-[11px] mt-0.5">
                Customer selected Cash on Delivery or automated checkout.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((tx) => {
                const isPending = tx.status === "PENDING_VERIFICATION";
                const isVerified = tx.status === "VERIFIED";
                const isRejected = tx.status === "REJECTED";

                return (
                  <div
                    key={tx.id}
                    className={`rounded-lg border p-4 transition-all ${
                      isPending
                        ? "border-amber-400/50 bg-amber-50/30 dark:bg-amber-950/10"
                        : isVerified
                        ? "border-emerald-400/40 bg-emerald-50/20 dark:bg-emerald-950/10"
                        : "border-rose-400/40 bg-rose-50/20 dark:bg-rose-950/10"
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2.5 border-b mb-3">
                      <div className="flex items-center gap-2">
                        {tx.type === "MANUAL_BANK" ? (
                          <Building2 className="size-4 text-primary" />
                        ) : (
                          <Smartphone className="size-4 text-primary" />
                        )}
                        <span className="font-bold text-foreground text-sm uppercase">
                          {tx.paymentMethodCode.replace(/_/g, " ")}
                        </span>
                      </div>
                      <div>{statusBadge(tx.status)}</div>
                    </div>

                    <div className="space-y-2.5">
                      {/* Sender Number */}
                      {tx.senderNumber && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">
                            Sender Phone / Acc:
                          </span>
                          <span className="font-mono font-semibold text-foreground text-xs select-all">
                            {tx.senderNumber}
                          </span>
                        </div>
                      )}

                      {/* Transaction ID */}
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Transaction ID (TrxID):
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-foreground text-sm bg-muted/60 px-2 py-0.5 rounded select-all">
                            {tx.transactionId || "N/A"}
                          </span>
                          {tx.transactionId && (
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="size-6 text-muted-foreground hover:text-foreground"
                              onClick={() => handleCopy(tx.transactionId!, tx.id)}
                            >
                              {copiedTrxId === tx.id ? (
                                <Check className="size-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="size-3.5" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Bank Transfer Reference if applicable */}
                      {tx.bankTransferReference && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Bank Ref / Slip:</span>
                          <span className="font-mono text-foreground">
                            {tx.bankTransferReference}
                          </span>
                        </div>
                      )}

                      {/* Transaction Amount */}
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Paid Amount:</span>
                        <span className="font-mono font-bold text-foreground text-sm">
                          ৳{Number(tx.amount).toLocaleString()}
                        </span>
                      </div>

                      {/* Submission Timestamp */}
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t">
                        <span>Submitted At:</span>
                        <span>
                          {new Date(tx.createdAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      {/* Admin Note / Rejection Reason */}
                      {tx.adminNote && (
                        <div className="mt-2 p-2 rounded bg-muted/50 text-[11px] text-muted-foreground">
                          <span className="font-semibold text-foreground">
                            Note:{" "}
                          </span>
                          {tx.adminNote}
                        </div>
                      )}

                      {/* Verification Audit Info */}
                      {tx.verifiedAt && tx.verifiedByUser && (
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground pt-1">
                          <UserCheck className="size-3 text-emerald-600" />
                          <span>
                            Verified by {tx.verifiedByUser.fullName || tx.verifiedByUser.email} on{" "}
                            {new Date(tx.verifiedAt).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      )}

                      {/* Action Buttons */}
                      {isPending && (
                        <div className="flex gap-2 pt-3">
                          <Button
                            type="button"
                            size="sm"
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 h-8 text-xs font-semibold"
                            onClick={() => handleApprove(tx)}
                            disabled={isVerifying}
                          >
                            <ShieldCheck className="size-3.5" />
                            Approve & Mark Paid
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            className="gap-1.5 h-8 text-xs font-semibold"
                            onClick={() => openRejectDialog(tx)}
                            disabled={isVerifying}
                          >
                            <XCircle className="size-3.5" />
                            Reject TrxID
                          </Button>
                        </div>
                      )}

                      {/* Allow Re-verification if rejected */}
                      {isRejected && (
                        <div className="flex justify-end pt-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="text-xs h-7 gap-1 border-emerald-500/40 text-emerald-700 hover:bg-emerald-50"
                            onClick={() => handleApprove(tx)}
                            disabled={isVerifying}
                          >
                            <ShieldCheck className="size-3" />
                            Re-verify & Approve
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reject Reason Dialog */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base text-destructive flex items-center gap-2">
              <XCircle className="size-5" />
              Reject Payment Transaction
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <p className="text-muted-foreground">
              Please provide a reason why this Transaction ID was rejected.
              This will be saved in the order timeline and the order payment status will be marked as <strong>FAILED</strong>.
            </p>

            <div className="bg-muted/40 p-3 rounded space-y-1">
              <p>
                <strong className="text-foreground">Method:</strong>{" "}
                {rejectTx?.paymentMethodCode}
              </p>
              <p>
                <strong className="text-foreground">TrxID:</strong>{" "}
                <span className="font-mono font-bold text-destructive">
                  {rejectTx?.transactionId || "N/A"}
                </span>
              </p>
              <p>
                <strong className="text-foreground">Sender:</strong>{" "}
                {rejectTx?.senderNumber || "N/A"}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="font-medium text-foreground">
                Reason / Note for Customer:
              </label>
              <Input
                placeholder="e.g. Transaction ID not found in bKash statement, incorrect amount"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRejectModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRejectSubmit}
              disabled={isVerifying}
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
