"use client";

import React, { useState, useEffect } from "react";
import {
  Truck,
  Settings,
  CheckCircle2,
  XCircle,
  Wallet,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Zap,
  Globe,
  Loader2,
  Webhook,
  Copy,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  useGetCourierProvidersQuery,
  useLazyCheckCourierBalanceQuery,
  useSyncActiveCourierShipmentsMutation,
} from "../../courierApi";
import { CourierConfigModal } from "./CourierConfigModal";
import type { CourierProviderConfig } from "../../types";

export function CourierSettingsManagement() {
  const { data, isLoading, refetch } = useGetCourierProvidersQuery();
  const [triggerCheckBalance, { isFetching: isCheckingBalance }] =
    useLazyCheckCourierBalanceQuery();
  const [syncActiveShipments, { isLoading: isSyncingActive }] =
    useSyncActiveCourierShipmentsMutation();

  const [selectedProvider, setSelectedProvider] =
    useState<CourierProviderConfig | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [origin, setOrigin] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  // Balance cache per provider code
  const [balances, setBalances] = useState<Record<string, { balance: number; currency: string }>>({});

  const providers = data?.data || [];

  const handleOpenConfig = (provider: CourierProviderConfig) => {
    setSelectedProvider(provider);
    setIsConfigModalOpen(true);
  };

  const handleCheckBalance = async (code: string) => {
    try {
      const res = await triggerCheckBalance(code).unwrap();
      if (res?.data) {
        setBalances((prev) => ({
          ...prev,
          [code]: { balance: res.data.balance, currency: res.data.currency || "BDT" },
        }));
        toast.success(
          `${code} Balance: ৳${Number(res.data.balance).toLocaleString()}`
        );
      }
    } catch (err: any) {
      toast.error(
        err?.data?.message || `Failed to fetch balance for ${code}. Verify API credentials.`
      );
    }
  };

  const handleSyncAllActive = async () => {
    try {
      const res = await syncActiveShipments().unwrap();
      if (res?.data) {
        toast.success(
          `Synced ${res.data.totalChecked} active shipments (${res.data.updatedCount} updated)`
        );
        void refetch();
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to sync active shipments");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Truck className="size-6 text-primary" />
            Courier Logistics Integration
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Automate parcel fulfillment, dispatch, COD collection, and live tracking with Steadfast and Pathao.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="default"
            size="sm"
            className="gap-1.5"
            disabled={isSyncingActive}
            onClick={handleSyncAllActive}
            title="Poll live delivery statuses from courier APIs for all pending parcels"
          >
            <RefreshCw className={`size-3.5 ${isSyncingActive ? "animate-spin" : ""}`} />
            {isSyncingActive ? "Syncing..." : "Sync Active Shipments"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Info Notice Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary/5 border-primary/20 shadow-none">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary shrink-0">
              <Zap className="size-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">One-Click Dispatch</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Book consignments directly from the order page without opening external portals.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-emerald-500/5 border-emerald-500/20 shadow-none">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 shrink-0">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">Smart COD Precision</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Auto-collects exact remaining order balance (৳0 on full advance; due amount on partial COD).
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-sky-500/5 border-sky-500/20 shadow-none">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-600 shrink-0">
              <Globe className="size-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">Live Tracking Links</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Instantly generates customer-facing tracking URLs and status synchronization.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Provider List Cards */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {providers.map((provider) => {
            const isConfigured = Boolean(provider.apiKey);
            const currentBalance = balances[provider.code];

            return (
              <Card key={provider.id} className="relative overflow-hidden shadow-none border">
                <CardHeader className="border-b bg-muted/20 pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base font-bold">
                          {provider.name}
                        </CardTitle>
                        {provider.isDefault && (
                          <Badge variant="secondary" className="text-[10px]">
                            Default
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-xs mt-1">
                        Code: <span className="font-mono font-semibold">{provider.code}</span>
                      </CardDescription>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          provider.isLive
                            ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-700 border-amber-500/20"
                        }`}
                      >
                        {provider.isLive ? "LIVE" : "SANDBOX"}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          provider.isActive
                            ? "bg-sky-500/10 text-sky-700 border-sky-500/20"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {provider.isActive ? "ACTIVE" : "INACTIVE"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-5 space-y-4">
                  {/* Status checklist */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">API Credentials:</span>
                      <span className="flex items-center gap-1 font-medium">
                        {isConfigured ? (
                          <>
                            <CheckCircle2 className="size-3.5 text-emerald-600" />
                            <span className="text-emerald-700 dark:text-emerald-400">Configured</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="size-3.5 text-amber-500" />
                            <span className="text-amber-600 dark:text-amber-400">Missing API Key</span>
                          </>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Endpoint:</span>
                      <span className="font-mono text-[11px] truncate max-w-[200px] text-muted-foreground">
                        {provider.apiUrl || "Default Official API"}
                      </span>
                    </div>

                    {provider.code?.toLowerCase() === "pathao" && provider.settings?.storeId && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Store ID:</span>
                        <span className="font-mono font-medium">
                          {provider.settings.storeId}
                        </span>
                      </div>
                    )}

                    {/* Live Balance Row */}
                    <div className="flex items-center justify-between pt-1 border-t">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Wallet className="size-3 text-primary" />
                        Merchant Balance:
                      </span>
                      <div className="flex items-center gap-2">
                        {currentBalance ? (
                          <span className="font-mono font-bold text-foreground">
                            ৳{Number(currentBalance.balance).toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-muted-foreground italic text-[11px]">
                            Not checked
                          </span>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-1.5 text-[10px] text-primary hover:bg-primary/10"
                          onClick={() => handleCheckBalance(provider.code)}
                          disabled={!isConfigured || isCheckingBalance}
                          title="Check current balance"
                        >
                          <RefreshCw
                            className={`size-2.5 mr-1 ${
                              isCheckingBalance ? "animate-spin" : ""
                            }`}
                          />
                          Check
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* External Merchant Portal Link & Configure Button */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <a
                      href={
                        provider.code?.toLowerCase() === "steadfast"
                          ? "https://steadfast.com.bd"
                          : "https://merchant.pathao.com"
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground hover:underline"
                    >
                      Portal Link
                      <ExternalLink className="size-3" />
                    </a>

                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-xs h-8"
                      onClick={() => handleOpenConfig(provider)}
                    >
                      <Settings className="size-3.5" />
                      Configure API
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Webhook Endpoints & Automated Sync Card */}
      <Card className="border bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
              <Webhook className="size-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">Courier Webhook Endpoints (Auto Delivery Sync)</CardTitle>
              <CardDescription className="text-xs">
                Provide these public webhook URLs in your Pathao or Steadfast developer portal to receive instant status updates upon delivery or return.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg border bg-muted/20 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-red-500 inline-block" />
                  Pathao Webhook URL
                </span>
                <Badge variant="outline" className="text-[10px] uppercase">POST</Badge>
              </div>
              <div className="flex items-center gap-2">
                <code className="text-[11px] font-mono bg-background border px-2 py-1 rounded flex-1 truncate">
                  {origin ? `${origin}/api/v1/courier/webhooks/pathao` : "/api/v1/courier/webhooks/pathao"}
                </code>
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-7 text-xs px-2.5"
                  onClick={() => {
                    const url = `${window.location.origin}/api/v1/courier/webhooks/pathao`;
                    navigator.clipboard.writeText(url);
                    toast.success("Pathao webhook URL copied!");
                  }}
                >
                  <Copy className="size-3 mr-1" /> Copy
                </Button>
              </div>
            </div>

            <div className="p-3 rounded-lg border bg-muted/20 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-emerald-500 inline-block" />
                  Steadfast Webhook URL
                </span>
                <Badge variant="outline" className="text-[10px] uppercase">POST</Badge>
              </div>
              <div className="flex items-center gap-2">
                <code className="text-[11px] font-mono bg-background border px-2 py-1 rounded flex-1 truncate">
                  {origin ? `${origin}/api/v1/courier/webhooks/steadfast` : "/api/v1/courier/webhooks/steadfast"}
                </code>
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-7 text-xs px-2.5"
                  onClick={() => {
                    const url = `${window.location.origin}/api/v1/courier/webhooks/steadfast`;
                    navigator.clipboard.writeText(url);
                    toast.success("Steadfast webhook URL copied!");
                  }}
                >
                  <Copy className="size-3 mr-1" /> Copy
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Extensible Architecture Note */}
      <Card className="bg-muted/30 border-dashed shadow-none">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div>
            <p className="font-semibold text-foreground">
              Modular Adapter Architecture (RedX, Paperfly, eCourier Ready)
            </p>
            <p className="text-muted-foreground mt-0.5">
              The backend utilizes an extensible <code className="bg-muted px-1 py-0.5 rounded font-mono text-[11px]">CourierAdapter</code> registry. Additional couriers can be plugged in seamlessly with zero disruption to existing fulfillment pipelines.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Modal */}
      <CourierConfigModal
        key={selectedProvider?.code || "none"}
        isOpen={isConfigModalOpen}
        onClose={() => {
          setIsConfigModalOpen(false);
          setSelectedProvider(null);
        }}
        provider={selectedProvider}
      />
    </div>
  );
}
