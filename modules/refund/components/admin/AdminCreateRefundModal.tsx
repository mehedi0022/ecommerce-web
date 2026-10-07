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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { DollarSign, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useCreateRefundForReturnMutation } from "../../refundApi";
import type { RefundMethod } from "../../refund.types";

interface AdminCreateRefundModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  returnNumber: string;
  orderNumber?: string;
  suggestedAmount?: number;
  onSuccess?: () => void;
}

export function AdminCreateRefundModal({
  open,
  onOpenChange,
  returnNumber,
  orderNumber,
  suggestedAmount = 0,
  onSuccess,
}: AdminCreateRefundModalProps) {
  const [createRefund, { isLoading }] = useCreateRefundForReturnMutation();

  const [amount, setAmount] = useState<number>(suggestedAmount);
  const [method, setMethod] = useState<RefundMethod>("ORIGINAL_PAYMENT_METHOD");
  const [reason, setReason] = useState<string>("Return item accepted & verified");
  const [note, setNote] = useState<string>("");

  React.useEffect(() => {
    if (suggestedAmount > 0) {
      setAmount(suggestedAmount);
    }
  }, [suggestedAmount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      toast.error("Refund amount must be greater than 0");
      return;
    }

    try {
      const res = await createRefund({
        returnNumber,
        data: {
          amount: Number(amount),
          method,
          reason: reason.trim() || undefined,
          note: note.trim() || undefined,
        },
      }).unwrap();

      toast.success(
        `Refund #${res.data.refundNumber} created successfully! (Amount: ৳${Number(res.data.amount).toLocaleString()})`
      );
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create refund");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
              <DollarSign className="size-5" />
            </div>
            <div>
              <DialogTitle>Issue Refund Payout</DialogTitle>
              <DialogDescription>
                Create refund record for return #{returnNumber}
                {orderNumber && ` (Order #${orderNumber})`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1 text-xs">
          {/* Refund Amount */}
          <div className="space-y-1.5">
            <Label htmlFor="refund-amount">Refund Amount (BDT) *</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 font-bold text-muted-foreground">
                ৳
              </span>
              <Input
                id="refund-amount"
                type="number"
                step="0.01"
                min="1"
                className="pl-7 font-mono font-bold"
                value={amount || ""}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                required
              />
            </div>
            {suggestedAmount > 0 && (
              <p className="text-[11px] text-muted-foreground">
                Estimated returned item value: ৳{suggestedAmount.toLocaleString()}
              </p>
            )}
          </div>

          {/* Refund Method */}
          <div className="space-y-1.5">
            <Label>Refund Payout Method *</Label>
            <Select
              value={method}
              onValueChange={(val) => setMethod(val as RefundMethod)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ORIGINAL_PAYMENT_METHOD">
                  Original Payment Gateway (bKash / Nagad / Card)
                </SelectItem>
                <SelectItem value="MOBILE_BANKING">
                  Direct Mobile Banking (bKash / Nagad Manual)
                </SelectItem>
                <SelectItem value="BANK_TRANSFER">Bank EFT / Wire Transfer</SelectItem>
                <SelectItem value="CASH">Cash Payment</SelectItem>
                <SelectItem value="OTHER">Other / Store Credit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reason */}
          <div className="space-y-1.5">
            <Label htmlFor="refund-reason">Refund Reason</Label>
            <Input
              id="refund-reason"
              placeholder="e.g. Return inspected, damaged item approved..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <Label htmlFor="refund-note">Transaction Ref / Customer Payout Note (Optional)</Label>
            <Textarea
              id="refund-note"
              rows={2}
              placeholder="e.g. bKash TrxID: 9X29A..., Bank Account: 102..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
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
              disabled={isLoading || amount <= 0}
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CheckCircle2 className="size-4" />
              )}
              Confirm & Issue ৳{Number(amount || 0).toLocaleString()}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
