"use client";

import React, { useState } from "react";
import {
  Banknote,
  CreditCard,
  Building2,
  Smartphone,
  Check,
  ShieldCheck,
  Copy,
  Info,
  QrCode,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useGetPublicPaymentMethodsQuery } from "@/modules/payment/paymentApi";
import type { PaymentMethodConfig } from "@/modules/payment/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CheckoutPaymentMethodProps {
  selectedCode: string;
  onSelectMethod: (code: string, type: "CASH_ON_DELIVERY" | "ONLINE", methodType?: string) => void;
  senderNumber: string;
  onChangeSenderNumber: (val: string) => void;
  transactionId: string;
  onChangeTransactionId: (val: string) => void;
  totalAmount?: number | string;
}

export function CheckoutPaymentMethod({
  selectedCode,
  onSelectMethod,
  senderNumber,
  onChangeSenderNumber,
  transactionId,
  onChangeTransactionId,
  totalAmount,
}: CheckoutPaymentMethodProps) {
  const { data, isLoading } = useGetPublicPaymentMethodsQuery();
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const methods = data?.data || [];

  const handleCopy = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Account number copied!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-20 w-full animate-pulse rounded-xl border border-border/60 bg-muted/30"
          />
        ))}
      </div>
    );
  }

  // Fallback if no methods are returned
  const displayMethods: PaymentMethodConfig[] = methods.length
    ? methods
    : [
        {
          id: 1,
          code: "cod",
          name: "Cash on Delivery (COD)",
          type: "COD",
          accountType: "PERSONAL",
          instructions: "Pay with cash upon delivery",
          chargePercentage: 0,
          chargeFlat: 0,
          isActive: true,
          isLive: false,
          sortOrder: 1,
          createdAt: "",
          updatedAt: "",
        },
      ];

  const getMethodIcon = (method: PaymentMethodConfig) => {
    if (method.type === "COD") {
      return <Banknote className="size-5" />;
    }
    if (method.type === "MANUAL_BANK") {
      return <Building2 className="size-5" />;
    }
    if (method.type === "AUTOMATED_GATEWAY") {
      return <CreditCard className="size-5" />;
    }
    return <Smartphone className="size-5" />;
  };

  const getBrandColors = (method: PaymentMethodConfig) => {
    const code = method.code.toLowerCase();
    if (code.includes("bkash")) {
      return {
        bg: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
        border: "border-pink-500/30",
        badge: "bg-pink-500/10 text-pink-600",
      };
    }
    if (code.includes("nagad")) {
      return {
        bg: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
        border: "border-orange-500/30",
        badge: "bg-orange-500/10 text-orange-600",
      };
    }
    if (code.includes("rocket")) {
      return {
        bg: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
        border: "border-purple-500/30",
        badge: "bg-purple-500/10 text-purple-600",
      };
    }
    if (method.type === "COD") {
      return {
        bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        border: "border-emerald-500/30",
        badge: "bg-emerald-500/10 text-emerald-600",
      };
    }
    return {
      bg: "bg-primary/10 text-primary",
      border: "border-primary/30",
      badge: "bg-primary/10 text-primary",
    };
  };

  return (
    <div className="space-y-3.5">
      {displayMethods.map((method) => {
        const isSelected = selectedCode === method.code;
        const isManual =
          method.type === "MANUAL_MFS" || method.type === "MANUAL_BANK";
        const isCOD = method.type === "COD";
        const colors = getBrandColors(method);

        return (
          <div
            key={method.id}
            className={cn(
              "overflow-hidden rounded-xl border transition-all duration-200",
              isSelected
                ? "border-primary bg-primary/[0.03] shadow-xs"
                : "border-border bg-card hover:border-foreground/30"
            )}
          >
            {/* ── Method Select Header ── */}
            <div
              role="button"
              tabIndex={0}
              onClick={() =>
                onSelectMethod(
                  method.code,
                  isCOD ? "CASH_ON_DELIVERY" : "ONLINE",
                  method.type
                )
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  onSelectMethod(
                    method.code,
                    isCOD ? "CASH_ON_DELIVERY" : "ONLINE",
                    method.type
                  );
                }
              }}
              className="flex cursor-pointer items-start justify-between p-4"
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-lg mt-0.5",
                    colors.bg
                  )}
                >
                  {getMethodIcon(method)}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-foreground text-sm">
                      {method.name}
                    </span>

                    {isCOD && (
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        Recommended
                      </span>
                    )}

                    {isManual && (
                      <Badge variant="outline" className="text-[10px] py-0 h-4">
                        {method.accountType === "PERSONAL"
                          ? "Send Money"
                          : method.accountType === "AGENT"
                          ? "Cash Out"
                          : "Merchant"}
                      </Badge>
                    )}

                    {(Number(method.chargePercentage) > 0 || Number(method.chargeFlat) > 0) && (
                      <Badge
                        variant="outline"
                        className="text-[10px] py-0 h-4 border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10 font-mono"
                      >
                        {Number(method.chargePercentage) > 0 && `+${method.chargePercentage}%`}
                        {Number(method.chargePercentage) > 0 && Number(method.chargeFlat) > 0 && " "}
                        {Number(method.chargeFlat) > 0 && `+৳${method.chargeFlat}`} Fee
                      </Badge>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {isCOD
                      ? "Pay with cash when your package is delivered at your doorstep."
                      : isManual && method.accountNumber
                      ? `Send payment to: ${method.accountNumber} (${method.accountType.toLowerCase()})`
                      : method.instructions || "Safe and secure online checkout."}
                  </p>
                </div>
              </div>

              <div
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors mt-1 ml-2",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground/30"
                )}
              >
                {isSelected && <Check className="size-3 stroke-[3]" />}
              </div>
            </div>

            {/* ── Expanded Payment Guidance & Input Box for Manual Methods ── */}
            {isSelected && isManual && (
              <div className="border-t border-border/80 bg-muted/20 p-4 space-y-4 animate-in fade-in-50 duration-200">
                {/* Account details box with 1-click copy */}
                {method.accountNumber && (
                  <div className="rounded-xl border bg-card p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-medium">
                        প্রাপক নম্বর ({method.name}):
                      </span>
                      <span className="text-[11px] font-semibold text-primary">
                        {method.accountType === "PERSONAL"
                          ? "Send Money করুন"
                          : method.accountType === "AGENT"
                          ? "Cash Out করুন"
                          : "Payment করুন"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2">
                      <span className="font-mono text-base font-bold tracking-wider text-foreground">
                        {method.accountNumber}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(method.accountNumber!, method.id);
                        }}
                        className="flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                      >
                        {copiedId === method.id ? (
                          <>
                            <Check className="size-3.5 text-emerald-500" />
                            <span className="text-emerald-500">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="size-3.5" />
                            <span>Copy Number</span>
                          </>
                        )}
                      </button>
                    </div>

                    {totalAmount && (() => {
                      const baseTotal = Number(totalAmount);
                      const pctFee = Number(method.chargePercentage) > 0 ? (baseTotal * Number(method.chargePercentage)) / 100 : 0;
                      const flatFee = Number(method.chargeFlat) || 0;
                      const fee = Math.round((pctFee + flatFee) * 100) / 100;
                      const payableTotal = baseTotal + fee;

                      return (
                        <div className="pt-1.5 space-y-1 text-[11px] border-t border-border/60">
                          {fee > 0 && (
                            <div className="flex justify-between text-muted-foreground">
                              <span>
                                গেটওয়ে / ট্রানজেকশন ফি
                                {Number(method.chargePercentage) > 0 && ` (${method.chargePercentage}%)`}
                                {Number(method.chargeFlat) > 0 && ` (+৳${method.chargeFlat})`}:
                              </span>
                              <span className="font-mono text-amber-600 dark:text-amber-400 font-medium">
                                +৳{fee.toFixed(2)}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between items-center text-foreground font-semibold">
                            <span>পরিশোধের মোট পরিমাণ:</span>
                            <span className="font-mono text-sm font-bold text-primary">
                              ৳{payableTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Bank details if Bank transfer */}
                {method.type === "MANUAL_BANK" && method.bankName && (
                  <div className="rounded-xl border bg-card p-3 text-xs space-y-1">
                    <p className="font-bold text-foreground">{method.bankName}</p>
                    {method.branchName && (
                      <p className="text-muted-foreground">শাখা: {method.branchName}</p>
                    )}
                    {method.routingNumber && (
                      <p className="text-muted-foreground font-mono">
                        রাউটিং নম্বর: {method.routingNumber}
                      </p>
                    )}
                  </div>
                )}

                {/* Instructions */}
                {method.instructions && (
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-foreground space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-primary">
                      <Info className="size-3.5" />
                      <span>পেমেন্ট নির্দেশনাবলী:</span>
                    </div>
                    <p className="whitespace-pre-line text-muted-foreground leading-relaxed">
                      {method.instructions}
                    </p>
                  </div>
                )}

                {/* QR Code preview if uploaded */}
                {method.qrCodeUrl && (
                  <div className="flex items-center gap-3 rounded-lg border bg-card p-2.5">
                    <img
                      src={method.qrCodeUrl}
                      alt="Payment QR Code"
                      className="size-16 rounded border object-contain"
                    />
                    <div className="text-xs">
                      <span className="font-semibold block text-foreground">
                        QR কোড স্ক্যান করুন
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        অ্যাপ থেকে দ্রুত স্ক্যান করে টাকা পাঠানোর জন্য
                      </span>
                    </div>
                  </div>
                )}

                {/* ── Inputs: Sender Phone + Transaction ID (TrxID) ── */}
                <div className="space-y-3 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">
                        যে নম্বর থেকে টাকা পাঠিয়েছেন *
                      </Label>
                      <Input
                        placeholder="e.g. 017XXXXXXXX"
                        value={senderNumber}
                        onChange={(e) => onChangeSenderNumber(e.target.value)}
                        className="bg-background text-xs font-mono h-9"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">
                        Transaction ID (TrxID) *
                      </Label>
                      <Input
                        placeholder="e.g. BLM98X41K"
                        value={transactionId}
                        onChange={(e) =>
                          onChangeTransactionId(e.target.value.toUpperCase())
                        }
                        className="bg-background text-xs font-mono font-bold tracking-wider h-9"
                        required
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <ShieldCheck className="size-3.5 text-emerald-500 shrink-0" />
                    <span>
                      টাকা পাঠানোর পর বিকাশ/নগদ থেকে প্রাপ্ত TrxID লিখুন। আমাদের টিম যাচাই করে অর্ডার নিশ্চিত করবে।
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* ── Expanded Guidance for Automated Gateways ── */}
            {isSelected && method.type === "AUTOMATED_GATEWAY" && (
                <div className="border-t border-border/80 bg-muted/20 p-4 space-y-3 animate-in fade-in-50 duration-200">
                  <div className="flex items-start gap-2.5 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-foreground">
                    <ShieldCheck className="size-4 text-primary shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-semibold text-primary">
                        Instant Online Gateway Checkout
                      </p>
                      <p className="text-muted-foreground leading-relaxed">
                        {method.instructions ||
                          "Place Order বাটনে ক্লিক করলে আপনি সরাসরি সুরক্ষিত পেমেন্ট গেটওয়েতে রিডাইরেক্ট হবেন। পেমেন্ট সম্পন্ন হলে আপনার অর্ডারটি ইনস্ট্যান্ট কনফার্ম হয়ে যাবে।"}
                      </p>
                    </div>
                  </div>

                  {totalAmount && (() => {
                    const baseTotal = Number(totalAmount);
                    const pctFee =
                      Number(method.chargePercentage) > 0
                        ? (baseTotal * Number(method.chargePercentage)) / 100
                        : 0;
                    const flatFee = Number(method.chargeFlat) || 0;
                    const fee = Math.round((pctFee + flatFee) * 100) / 100;
                    const payableTotal = baseTotal + fee;

                    return (
                      <div className="rounded-xl border bg-card p-3 text-xs space-y-1.5">
                        {fee > 0 && (
                          <div className="flex justify-between text-muted-foreground">
                            <span>
                              গেটওয়ে ফি
                              {Number(method.chargePercentage) > 0 && ` (${method.chargePercentage}%)`}:
                            </span>
                            <span className="font-mono text-amber-600 dark:text-amber-400 font-medium">
                              +৳{fee.toFixed(2)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between items-center text-foreground font-semibold">
                          <span>পরিশোধের মোট পরিমাণ:</span>
                          <span className="font-mono text-base font-bold text-primary">
                            ৳{payableTotal.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          );
        })}

      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
        <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>Your order is protected by our 100% genuine product guarantee.</span>
      </div>
    </div>
  );
}
