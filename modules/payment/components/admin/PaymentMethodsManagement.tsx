"use client";

import React, { useState } from "react";
import {
  useGetAdminPaymentMethodsQuery,
  useUpdatePaymentMethodMutation,
  useDeletePaymentMethodMutation,
} from "../../paymentApi";
import type { PaymentMethodConfig } from "../../types";
import { PaymentMethodModal } from "./PaymentMethodModal";
import { GatewayConfigModal } from "./GatewayConfigModal";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  CreditCard,
  Plus,
  Settings2,
  Building2,
  Banknote,
  Smartphone,
  Copy,
  Check,
  Trash2,
  Edit,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function PaymentMethodsManagement() {
  const { data, isLoading, refetch, isFetching } = useGetAdminPaymentMethodsQuery();
  const [updateMethod] = useUpdatePaymentMethodMutation();
  const [deleteMethod] = useDeletePaymentMethodMutation();

  const [activeTab, setActiveTab] = useState<"MANUAL" | "GATEWAY" | "COD">("MANUAL");
  const [editingMethod, setEditingMethod] = useState<PaymentMethodConfig | null>(null);
  const [isMethodModalOpen, setIsMethodModalOpen] = useState(false);
  const [configuringGateway, setConfiguringGateway] = useState<PaymentMethodConfig | null>(null);
  const [isGatewayModalOpen, setIsGatewayModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const methods = data?.data || [];

  const manualMethods = methods.filter(
    (m) => m.type === "MANUAL_MFS" || m.type === "MANUAL_BANK"
  );
  const gatewayMethods = methods.filter((m) => m.type === "AUTOMATED_GATEWAY");
  const codMethods = methods.filter((m) => m.type === "COD");

  const handleToggleActive = async (method: PaymentMethodConfig, checked: boolean) => {
    try {
      await updateMethod({
        id: method.id,
        body: { isActive: checked },
      }).unwrap();
      toast.success(
        `${method.name} is now ${checked ? "active in storefront" : "disabled"}`
      );
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (method: PaymentMethodConfig) => {
    if (!confirm(`Are you sure you want to delete ${method.name}?`)) return;
    try {
      await deleteMethod(method.id).unwrap();
      toast.success(`${method.name} deleted successfully`);
    } catch {
      toast.error("Failed to delete payment method");
    }
  };

  const handleCopy = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Account number copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* ── Top Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Payment Methods & Gateways
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Configure manual MFS (bKash, Nagad, Rocket), Bank transfer, and automated gateways.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="cursor-pointer"
          >
            <RefreshCw className={cn("size-3.5", isFetching && "animate-spin")} />
            <span>Refresh</span>
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setEditingMethod(null);
              setIsMethodModalOpen(true);
            }}
            className="cursor-pointer font-semibold shadow-xs"
          >
            <Plus className="size-4" />
            <span>Add Payment Method</span>
          </Button>
        </div>
      </div>

      {/* ── Quick Summary Cards ─────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Manual Accounts</span>
            <Smartphone className="size-4 text-primary" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">
              {manualMethods.filter((m) => m.isActive).length}
            </span>
            <span className="text-xs text-muted-foreground">
              active of {manualMethods.length} accounts
            </span>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Automated Gateways</span>
            <CreditCard className="size-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">
              {gatewayMethods.filter((m) => m.isActive).length}
            </span>
            <span className="text-xs text-muted-foreground">
              active of {gatewayMethods.length} gateways
            </span>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Cash on Delivery</span>
            <Banknote className="size-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">
              {codMethods.some((m) => m.isActive) ? "Active" : "Disabled"}
            </span>
            <span className="text-xs text-muted-foreground">Standard Doorstep COD</span>
          </div>
        </div>
      </div>

      {/* ── Navigation Tabs ─────────────────────────────────────────── */}
      <div className="flex border-b border-border/80">
        <button
          type="button"
          onClick={() => setActiveTab("MANUAL")}
          className={cn(
            "flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors cursor-pointer",
            activeTab === "MANUAL"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Smartphone className="size-4" />
          <span>Manual MFS & Bank ({manualMethods.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("GATEWAY")}
          className={cn(
            "flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors cursor-pointer",
            activeTab === "GATEWAY"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <CreditCard className="size-4" />
          <span>Automated Gateways ({gatewayMethods.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("COD")}
          className={cn(
            "flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors cursor-pointer",
            activeTab === "COD"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Banknote className="size-4" />
          <span>Cash on Delivery</span>
        </button>
      </div>

      {/* ── Tab 1: Manual Accounts ───────────────────────────────────── */}
      {activeTab === "MANUAL" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg border">
            <div className="flex items-center gap-2">
              <AlertCircle className="size-4 text-primary shrink-0" />
              <span>
                কাস্টমার চেকআউট পেজে এই নম্বরগুলোতে Send Money বা Cash Out করে Transaction ID (TrxID) প্রদান করবে। অ্যাডমিন অর্ডারের সময় তা ভেরিফাই করবে।
              </span>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {manualMethods.map((method) => {
              const isMFS = method.type === "MANUAL_MFS";

              return (
                <div
                  key={method.id}
                  className={cn(
                    "flex flex-col justify-between rounded-xl border p-4.5 transition-all shadow-xs",
                    method.isActive
                      ? "border-border bg-card"
                      : "border-border/60 bg-muted/20 opacity-75"
                  )}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={cn(
                            "flex size-10 shrink-0 items-center justify-center rounded-lg font-bold text-xs",
                            method.code.includes("bkash")
                              ? "bg-pink-500/10 text-pink-600 dark:text-pink-400"
                              : method.code.includes("nagad")
                              ? "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                              : method.code.includes("rocket")
                              ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                              : "bg-primary/10 text-primary"
                          )}
                        >
                          {isMFS ? (
                            <Smartphone className="size-5" />
                          ) : (
                            <Building2 className="size-5" />
                          )}
                        </div>

                        <div>
                          <h3 className="font-semibold text-foreground text-sm flex items-center gap-2 flex-wrap">
                            {method.name}
                            <Badge
                              variant={method.isActive ? "default" : "secondary"}
                              className="text-[10px] px-1.5 py-0 h-4"
                            >
                              {method.accountType}
                            </Badge>
                            {(Number(method.chargePercentage) > 0 || Number(method.chargeFlat) > 0) && (
                              <Badge
                                variant="outline"
                                className="text-[10px] px-1.5 py-0 h-4 border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10 font-mono"
                              >
                                {Number(method.chargePercentage) > 0 && `+${method.chargePercentage}%`}
                                {Number(method.chargePercentage) > 0 && Number(method.chargeFlat) > 0 && " "}
                                {Number(method.chargeFlat) > 0 && `+৳${method.chargeFlat}`} Fee
                              </Badge>
                            )}
                          </h3>
                          <span className="text-xs text-muted-foreground font-mono">
                            {method.code}
                          </span>
                        </div>
                      </div>

                      <Switch
                        checked={method.isActive}
                        onCheckedChange={(checked) =>
                          handleToggleActive(method, checked)
                        }
                      />
                    </div>

                    {/* Account details */}
                    {method.accountNumber && (
                      <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-xs font-mono">
                        <span className="text-foreground font-semibold tracking-wide">
                          {method.accountNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleCopy(method.accountNumber!, method.id)
                          }
                          className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground cursor-pointer font-sans"
                        >
                          {copiedId === method.id ? (
                            <>
                              <Check className="size-3 text-emerald-500" />
                              <span className="text-emerald-500 font-semibold">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="size-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Bank specific info */}
                    {method.bankName && (
                      <div className="text-xs text-muted-foreground space-y-0.5 border-l-2 border-primary/40 pl-2">
                        <p className="font-medium text-foreground">{method.bankName}</p>
                        {method.branchName && <p>Branch: {method.branchName}</p>}
                        {method.routingNumber && <p>Routing: {method.routingNumber}</p>}
                      </div>
                    )}

                    {/* Instructions preview */}
                    {method.instructions && (
                      <p className="text-xs text-muted-foreground line-clamp-2 bg-muted/20 p-2 rounded">
                        {method.instructions}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t pt-3">
                    <span className="text-[11px] text-muted-foreground">
                      {method.isActive ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                          ● Active on checkout
                        </span>
                      ) : (
                        "Disabled in checkout"
                      )}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingMethod(method);
                          setIsMethodModalOpen(true);
                        }}
                        className="h-8 text-xs cursor-pointer"
                      >
                        <Edit className="size-3.5 mr-1" />
                        Edit
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(method)}
                        className="h-8 text-xs text-destructive hover:text-destructive cursor-pointer"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Tab 2: Automated Gateways ────────────────────────────────── */}
      {activeTab === "GATEWAY" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg border">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-500 shrink-0" />
              <span>
                ভবিষ্যতে মার্চেন্ট অ্যাকাউন্ট পাওয়ার পর এখান থেকে সরাসরি API Credentials দিয়ে লাইভ পেমেন্ট চালু করতে পারবেন।
              </span>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {gatewayMethods.map((method) => {
              const hasCredentials = Boolean(
                method.credentials && Object.keys(method.credentials).length > 0
              );

              return (
                <div
                  key={method.id}
                  className={cn(
                    "flex flex-col justify-between rounded-xl border p-4.5 transition-all shadow-xs",
                    method.isActive
                      ? "border-border bg-card"
                      : "border-border/60 bg-muted/20 opacity-80"
                  )}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={cn(
                            "flex size-10 shrink-0 items-center justify-center rounded-lg font-bold",
                            method.code.includes("bkash")
                              ? "bg-pink-500/10 text-pink-600 dark:text-pink-400"
                              : method.code.includes("stripe")
                              ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          )}
                        >
                          <CreditCard className="size-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground text-sm flex items-center gap-2 flex-wrap">
                            {method.name}
                            <Badge
                              variant={method.isLive ? "default" : "outline"}
                              className={cn(
                                "text-[10px] px-1.5 py-0 h-4",
                                method.isLive
                                  ? "bg-emerald-600"
                                  : "text-amber-600 border-amber-500/40"
                              )}
                            >
                              {method.isLive ? "LIVE" : "SANDBOX"}
                            </Badge>
                            {(Number(method.chargePercentage) > 0 || Number(method.chargeFlat) > 0) && (
                              <Badge
                                variant="outline"
                                className="text-[10px] px-1.5 py-0 h-4 border-primary/40 text-primary bg-primary/10 font-mono"
                              >
                                {Number(method.chargePercentage) > 0 && `+${method.chargePercentage}%`}
                                {Number(method.chargePercentage) > 0 && Number(method.chargeFlat) > 0 && " "}
                                {Number(method.chargeFlat) > 0 && `+৳${method.chargeFlat}`} Fee
                              </Badge>
                            )}
                          </h3>
                          <span className="text-xs text-muted-foreground font-mono">
                            {method.code}
                          </span>
                        </div>
                      </div>

                      <Switch
                        checked={method.isActive}
                        onCheckedChange={(checked) =>
                          handleToggleActive(method, checked)
                        }
                      />
                    </div>

                    <p className="text-xs text-muted-foreground">
                      {method.instructions ||
                        "Instant automated payment with cards, mobile banking, and webhooks."}
                    </p>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground">Credentials:</span>
                      {hasCredentials ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                          <Check className="size-3" /> Configured
                        </span>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 font-medium">
                          Not configured
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t pt-3">
                    <span className="text-[11px] text-muted-foreground">
                      {method.isActive ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          ● Enabled in checkout
                        </span>
                      ) : (
                        "Disabled in checkout"
                      )}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setConfiguringGateway(method);
                        setIsGatewayModalOpen(true);
                      }}
                      className="h-8 text-xs cursor-pointer font-semibold"
                    >
                      <Settings2 className="size-3.5 mr-1" />
                      Configure API
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Tab 3: COD ──────────────────────────────────────────────── */}
      {activeTab === "COD" && (
        <div className="space-y-4">
          {codMethods.map((method) => (
            <div
              key={method.id}
              className="rounded-xl border bg-card p-5 max-w-2xl shadow-xs space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Banknote className="size-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-base">
                      {method.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Doorstep cash payment upon package delivery
                    </p>
                  </div>
                </div>

                <Switch
                  checked={method.isActive}
                  onCheckedChange={(checked) =>
                    handleToggleActive(method, checked)
                  }
                />
              </div>

              <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground space-y-1">
                <span className="font-semibold text-foreground block">
                  Customer Instructions:
                </span>
                <p>{method.instructions}</p>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingMethod(method);
                    setIsMethodModalOpen(true);
                  }}
                  className="cursor-pointer text-xs"
                >
                  <Edit className="size-3.5 mr-1" />
                  Edit Instructions
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modals ──────────────────────────────────────────────────── */}
      <PaymentMethodModal
        open={isMethodModalOpen}
        onOpenChange={setIsMethodModalOpen}
        method={editingMethod}
      />

      <GatewayConfigModal
        open={isGatewayModalOpen}
        onOpenChange={setIsGatewayModalOpen}
        method={configuringGateway}
      />
    </div>
  );
}
