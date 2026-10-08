"use client";

import React, { useState, useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  useUpdateCourierProviderMutation,
  useLazyGetCourierStoresQuery,
} from "../../courierApi";
import type { CourierProviderConfig } from "../../types";
import {
  Truck,
  ShieldCheck,
  Info,
  KeyRound,
  Lock,
  Store,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Loader2,
  RefreshCw,
  Webhook,
  Copy,
  Check,
} from "lucide-react";

interface CourierConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: CourierProviderConfig | null;
}

export function CourierConfigModal({
  isOpen,
  onClose,
  provider,
}: CourierConfigModalProps) {
  const [updateProvider, { isLoading: isUpdating }] =
    useUpdateCourierProviderMutation();
  const [triggerGetStores, { isFetching: isFetchingStores }] =
    useLazyGetCourierStoresQuery();

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [pathaoStores, setPathaoStores] = useState<any[]>([]);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const [form, setForm] = useState({
    name: "",
    apiKey: "",
    apiSecret: "",
    apiUrl: "",
    isActive: false,
    isDefault: false,
    isLive: true,
    // Pathao specific settings
    username: "",
    password: "",
    storeId: "",
    // Webhook settings (Steadfast & Pathao)
    webhookSecret: "",
    webhookIntegrationSecret: "",
  });

  const handleFetchStores = async () => {
    try {
      const res = await triggerGetStores("pathao").unwrap();
      if (res?.data && res.data.length > 0) {
        setPathaoStores(res.data);
        toast.success(`Found ${res.data.length} stores from Pathao!`);
        if (!form.storeId) {
          setForm((prev) => ({ ...prev, storeId: String(res.data[0].store_id) }));
        }
      } else {
        toast.info("No stores found in Pathao account. Please verify credentials.");
      }
    } catch (err: any) {
      toast.error(
        err?.data?.message || "Failed to fetch stores. Make sure credentials are saved first."
      );
    }
  };

  useEffect(() => {
    if (provider) {
      setForm({
        name: provider.name || "",
        apiKey: "",
        apiSecret: "",
        apiUrl: provider.apiUrl || "",
        isActive: Boolean(provider.isActive),
        isDefault: Boolean(provider.isDefault),
        isLive: Boolean(provider.isLive),
        username: provider.settings?.username || "",
        password: "",
        storeId: provider.settings?.storeId != null ? String(provider.settings.storeId) : "",
        webhookSecret: provider.settings?.webhookSecret || "",
        webhookIntegrationSecret: provider.settings?.webhookIntegrationSecret || "",
      });
      setShowAdvanced(Boolean(provider.apiUrl));
    }
  }, [provider, isOpen]);

  if (!provider) return null;

  const normalizedCode = (provider.code || "").toLowerCase().trim();
  const isSteadfast = normalizedCode === "steadfast";
  const isPathao = normalizedCode === "pathao";

  const webhookUrl =
    typeof window !== "undefined" && provider
      ? `${window.location.origin}/api/v1/courier/webhooks/${provider.code.toLowerCase()}`
      : `/api/v1/courier/webhooks/${provider.code.toLowerCase()}`;

  const handleCopyWebhookUrl = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(webhookUrl);
      setCopiedUrl(true);
      toast.success("Webhook URL copied to clipboard!");
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error("Courier provider name is required");
      return;
    }

    try {
      const settingsPayload: Record<string, any> = {
        ...(provider.settings || {}),
      };

      if (isSteadfast) {
        if (form.webhookSecret.trim()) {
          settingsPayload.webhookSecret = form.webhookSecret.trim();
        } else if (provider.settings?.webhookSecret && form.webhookSecret === "") {
          delete settingsPayload.webhookSecret;
        }
      }

      if (isPathao) {
        if (form.username.trim()) settingsPayload.username = form.username.trim();
        if (form.password.trim()) settingsPayload.password = form.password.trim();
        if (form.storeId.trim()) settingsPayload.storeId = form.storeId.trim();

        if (form.webhookSecret.trim()) {
          settingsPayload.webhookSecret = form.webhookSecret.trim();
        } else if (provider.settings?.webhookSecret && form.webhookSecret === "") {
          delete settingsPayload.webhookSecret;
        }

        if (form.webhookIntegrationSecret.trim()) {
          settingsPayload.webhookIntegrationSecret = form.webhookIntegrationSecret.trim();
        } else if (
          provider.settings?.webhookIntegrationSecret &&
          form.webhookIntegrationSecret === ""
        ) {
          delete settingsPayload.webhookIntegrationSecret;
        }
      }

      const updatePayload: Record<string, any> = {
        name: form.name.trim(),
        apiUrl: form.apiUrl.trim() || null,
        isActive: form.isActive,
        isDefault: form.isDefault,
        isLive: form.isLive,
        settings: settingsPayload,
      };

      // Only send apiKey and apiSecret if admin explicitly typed new values
      if (form.apiKey.trim()) {
        updatePayload.apiKey = form.apiKey.trim();
      }
      if (form.apiSecret.trim()) {
        updatePayload.apiSecret = form.apiSecret.trim();
      }

      await updateProvider({
        id: provider.id,
        data: updatePayload,
      }).unwrap();

      toast.success(`${provider.name} credentials updated successfully!`);
      onClose();
    } catch (err: any) {
      console.error("Failed to update courier provider:", err);
      toast.error(
        err?.data?.message || err?.message || "Failed to save courier configuration"
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2.5">
              <div
                className={`p-2 rounded-lg ${
                  isSteadfast
                    ? "bg-blue-500/10 text-blue-600"
                    : isPathao
                    ? "bg-rose-500/10 text-rose-600"
                    : "bg-primary/10 text-primary"
                }`}
              >
                <Truck className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-lg">
                    {isSteadfast
                      ? "Steadfast Courier Integration"
                      : isPathao
                      ? "Pathao Courier Integration"
                      : `Configure ${provider.name}`}
                  </DialogTitle>
                  <Badge
                    variant="outline"
                    className={`text-[10px] uppercase font-bold ${
                      isSteadfast
                        ? "border-blue-500/30 text-blue-600 bg-blue-500/5"
                        : isPathao
                        ? "border-rose-500/30 text-rose-600 bg-rose-500/5"
                        : "border-primary/30 text-primary bg-primary/5"
                    }`}
                  >
                    {provider.code.toUpperCase()}
                  </Badge>
                </div>
                <DialogDescription className="text-xs mt-0.5">
                  {isSteadfast
                    ? "Configure Steadfast API credentials for 1-click booking and live tracking"
                    : isPathao
                    ? "Configure Pathao OAuth app, merchant account credentials & store ID"
                    : "Configure API credentials and fulfillment settings"}
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* ════════════════ STEADFAST SPECIFIC FORM ════════════════ */}
          {isSteadfast && (
            <div className="space-y-4">
              {/* Steadfast Helper Notice */}
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-800 dark:text-blue-300">
                <Info className="size-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
                <div className="space-y-1">
                  <p className="font-semibold">How to get Steadfast API Credentials:</p>
                  <p className="leading-relaxed">
                    Login to{" "}
                    <a
                      href="https://steadfast.com.bd"
                      target="_blank"
                      rel="noreferrer"
                      className="underline font-semibold inline-flex items-center gap-1"
                    >
                      steadfast.com.bd
                      <ExternalLink className="size-3" />
                    </a>{" "}
                    &rarr; go to <strong>Settings &rarr; API Credentials</strong>. Copy your{" "}
                    <strong>API Key</strong> and <strong>Secret Key</strong> below.
                  </p>
                </div>
              </div>

              {/* Steadfast Display Name */}
              <div className="space-y-1.5">
                <Label htmlFor="st-name" className="text-xs">
                  Gateway Display Name
                </Label>
                <Input
                  id="st-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              {/* Steadfast API Key */}
              <div className="space-y-1.5">
                <Label htmlFor="st-apiKey" className="text-xs flex items-center gap-1">
                  <KeyRound className="size-3.5 text-primary" />
                  Steadfast API Key
                </Label>
                <Input
                  id="st-apiKey"
                  placeholder={
                    provider.apiKey
                      ? "•••••••••••••••••••• (Leave blank to keep existing)"
                      : "Enter Steadfast API Key"
                  }
                  value={form.apiKey}
                  onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
                />
              </div>

              {/* Steadfast Secret Key */}
              <div className="space-y-1.5">
                <Label htmlFor="st-apiSecret" className="text-xs flex items-center gap-1">
                  <Lock className="size-3.5 text-primary" />
                  Steadfast Secret Key
                </Label>
                <Input
                  id="st-apiSecret"
                  type="password"
                  placeholder={
                    provider.apiSecret
                      ? "•••••••••••••••••••• (Leave blank to keep existing)"
                      : "Enter Steadfast Secret Key"
                  }
                  value={form.apiSecret}
                  onChange={(e) => setForm({ ...form, apiSecret: e.target.value })}
                />
              </div>

              {/* Steadfast Webhook Configuration */}
              <div className="p-3 bg-muted/20 border rounded-lg space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <Webhook className="size-3.5 text-blue-600" />
                  Steadfast Webhook Integration & Security
                </div>

                {/* Webhook Listener URL */}
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Webhook Listener URL</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      readOnly
                      value={webhookUrl}
                      className="bg-muted/50 font-mono text-[11px]"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-9 px-3 shrink-0 text-xs gap-1"
                      onClick={handleCopyWebhookUrl}
                    >
                      {copiedUrl ? <Check className="size-3.5 text-green-600" /> : <Copy className="size-3.5" />}
                      {copiedUrl ? "Copied" : "Copy"}
                    </Button>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Copy and save this URL in your Steadfast merchant dashboard under Webhook settings.
                  </p>
                </div>

                {/* Webhook Secret Token */}
                <div className="space-y-1">
                  <Label htmlFor="st-webhookSecret" className="text-xs flex items-center gap-1">
                    <Lock className="size-3.5 text-primary" />
                    Webhook Secret Token (Bearer Token)
                  </Label>
                  <Input
                    id="st-webhookSecret"
                    placeholder="Enter webhook secret token (or fallback to STEADFAST_WEBHOOK_SECRET env)"
                    value={form.webhookSecret}
                    onChange={(e) => setForm({ ...form, webhookSecret: e.target.value })}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Steadfast sends this token in <code>Authorization: Bearer &lt;token&gt;</code> on delivery updates.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════ PATHAO SPECIFIC FORM ════════════════ */}
          {isPathao && (
            <div className="space-y-4">
              {/* Pathao Helper Notice */}
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-800 dark:text-rose-300">
                <Info className="size-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                <div className="space-y-1">
                  <p className="font-semibold">How to get Pathao Credentials:</p>
                  <p className="leading-relaxed">
                    Login to{" "}
                    <a
                      href="https://merchant.pathao.com"
                      target="_blank"
                      rel="noreferrer"
                      className="underline font-semibold inline-flex items-center gap-1"
                    >
                      merchant.pathao.com
                      <ExternalLink className="size-3" />
                    </a>{" "}
                    &rarr; go to <strong>Developers &rarr; API Credentials</strong> to create an app.
                    Provide Client ID & Secret along with your login account and Store ID.
                  </p>
                </div>
              </div>

              {/* Pathao Display Name */}
              <div className="space-y-1.5">
                <Label htmlFor="pt-name" className="text-xs">
                  Gateway Display Name
                </Label>
                <Input
                  id="pt-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              {/* Section 1: OAuth App Credentials */}
              <div className="p-3 bg-muted/20 border rounded-lg space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <ShieldCheck className="size-3.5 text-primary" />
                  1. Pathao Developer App (OAuth 2.0)
                </div>

                <div className="space-y-2">
                  <div className="space-y-1">
                    <Label htmlFor="pt-clientId" className="text-xs">
                      Client ID
                    </Label>
                    <Input
                      id="pt-clientId"
                      placeholder={
                        provider.apiKey
                          ? "•••••••••••• (Leave blank to keep existing)"
                          : "Enter Pathao Client ID"
                      }
                      value={form.apiKey}
                      onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="pt-clientSecret" className="text-xs">
                      Client Secret
                    </Label>
                    <Input
                      id="pt-clientSecret"
                      type="password"
                      placeholder={
                        provider.apiSecret
                          ? "•••••••••••• (Leave blank to keep existing)"
                          : "Enter Pathao Client Secret"
                      }
                      value={form.apiSecret}
                      onChange={(e) => setForm({ ...form, apiSecret: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Account Login Credentials */}
              <div className="p-3 bg-muted/20 border rounded-lg space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <KeyRound className="size-3.5 text-primary" />
                  2. Pathao Merchant Account Credentials
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <Label htmlFor="pt-user" className="text-xs">
                      Account Email / Username
                    </Label>
                    <Input
                      id="pt-user"
                      placeholder="merchant@example.com"
                      value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="pt-pass" className="text-xs">
                      Account Password
                    </Label>
                    <Input
                      id="pt-pass"
                      type="password"
                      placeholder={
                        provider.settings?.password
                          ? "•••••••• (Leave blank to keep existing)"
                          : "Pathao account password"
                      }
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Default Store ID */}
              <div className="p-3.5 bg-muted/20 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <Store className="size-3.5 text-primary" />
                    3. Default Pickup Store ID
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-[11px] gap-1.5"
                    onClick={handleFetchStores}
                    disabled={isFetchingStores}
                  >
                    <RefreshCw
                      className={`size-3 ${isFetchingStores ? "animate-spin" : ""}`}
                    />
                    {isFetchingStores ? "Fetching..." : "Fetch Stores from Pathao"}
                  </Button>
                </div>

                {pathaoStores.length > 0 && (
                  <div className="space-y-1">
                    <Label htmlFor="pt-store-select" className="text-xs">
                      Select Store from Your Pathao Account
                    </Label>
                    <select
                      id="pt-store-select"
                      value={form.storeId}
                      onChange={(e) => setForm({ ...form, storeId: e.target.value })}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="">-- Choose a Store --</option>
                      {pathaoStores.map((s: any) => (
                        <option key={s.store_id} value={s.store_id}>
                          {s.store_name} (ID: {s.store_id}) — {s.store_address}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-1">
                  <Label htmlFor="pt-store" className="text-xs">
                    Store ID Number
                  </Label>
                  <Input
                    id="pt-store"
                    placeholder="e.g. 148668"
                    value={form.storeId}
                    onChange={(e) => setForm({ ...form, storeId: e.target.value })}
                    required
                  />
                </div>

                {/* Pathao Store Guidance */}
                <div className="p-2.5 rounded bg-muted/40 border border-dashed text-[11px] space-y-1 text-muted-foreground">
                  <p className="font-semibold text-foreground">
                    Where to find your Store ID in Pathao:
                  </p>
                  <ul className="list-disc list-inside space-y-0.5 leading-relaxed">
                    <li>
                      <strong>Automatic:</strong> Click <em>"Fetch Stores from Pathao"</em> above to load all your account's stores.
                    </li>
                    <li>
                      <strong>Manual:</strong> Login to{" "}
                      <a
                        href="https://merchant.pathao.com"
                        target="_blank"
                        rel="noreferrer"
                        className="underline font-medium text-foreground"
                      >
                        merchant.pathao.com
                      </a>{" "}
                      &rarr; <strong>Settings / Stores</strong> (or <strong>Manage Stores</strong>). Copy the numeric Store ID.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Section 4: Webhook Integration & Secrets */}
              <div className="p-3.5 bg-muted/20 border rounded-lg space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <Webhook className="size-3.5 text-rose-600" />
                  4. Pathao Webhook Integration & Secrets
                </div>

                {/* Webhook Listener URL */}
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Webhook Listener URL</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      readOnly
                      value={webhookUrl}
                      className="bg-muted/50 font-mono text-[11px]"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-9 px-3 shrink-0 text-xs gap-1"
                      onClick={handleCopyWebhookUrl}
                    >
                      {copiedUrl ? <Check className="size-3.5 text-green-600" /> : <Copy className="size-3.5" />}
                      {copiedUrl ? "Copied" : "Copy"}
                    </Button>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Enter this URL in Pathao Merchant Developer portal &rarr; Webhook Integration.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <Label htmlFor="pt-webhookSecret" className="text-xs flex items-center gap-1">
                      <Lock className="size-3.5 text-primary" />
                      Webhook Secret (Signature)
                    </Label>
                    <Input
                      id="pt-webhookSecret"
                      placeholder="Enter webhook secret (or PATHAO_WEBHOOK_SECRET env)"
                      value={form.webhookSecret}
                      onChange={(e) => setForm({ ...form, webhookSecret: e.target.value })}
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Verified against <code>X-Pathao-Signature</code> on status events.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="pt-webhookIntegrationSecret" className="text-xs flex items-center gap-1">
                      <KeyRound className="size-3.5 text-primary" />
                      Integration Secret (Handshake)
                    </Label>
                    <Input
                      id="pt-webhookIntegrationSecret"
                      placeholder="Enter integration secret (or PATHAO_WEBHOOK_INTEGRATION_SECRET env)"
                      value={form.webhookIntegrationSecret}
                      onChange={(e) => setForm({ ...form, webhookIntegrationSecret: e.target.value })}
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Returned in <code>X-Pathao-Merchant-Webhook-Integration-Secret</code> on handshake.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════ FALLBACK / GENERIC COURIER FORM ════════════════ */}
          {!isSteadfast && !isPathao && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="gen-name" className="text-xs">
                  Provider Name
                </Label>
                <Input
                  id="gen-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="gen-apiKey" className="text-xs">
                  API Key / Client ID
                </Label>
                <Input
                  id="gen-apiKey"
                  value={form.apiKey}
                  placeholder="Enter API Key"
                  onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="gen-apiSecret" className="text-xs">
                  API Secret
                </Label>
                <Input
                  id="gen-apiSecret"
                  type="password"
                  value={form.apiSecret}
                  placeholder="Enter API Secret"
                  onChange={(e) => setForm({ ...form, apiSecret: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* ════════════════ COMMON TOGGLES ════════════════ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-muted/30 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="isActive" className="cursor-pointer font-medium text-xs">
                  Enable Gateway
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Make available for booking
                </p>
              </div>
              <Switch
                id="isActive"
                checked={form.isActive}
                onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="isDefault" className="cursor-pointer font-medium text-xs">
                  Default Courier
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Pre-selected in admin booking
                </p>
              </div>
              <Switch
                id="isDefault"
                checked={form.isDefault}
                onCheckedChange={(checked) => setForm({ ...form, isDefault: checked })}
              />
            </div>

            <div className="flex items-center justify-between col-span-full border-t pt-2.5">
              <div>
                <Label htmlFor="isLive" className="cursor-pointer font-medium text-xs">
                  Live Production Mode
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  {form.isLive
                    ? "Dispatching to live courier system"
                    : "Using Sandbox / Staging endpoints"}
                </p>
              </div>
              <Switch
                id="isLive"
                checked={form.isLive}
                onCheckedChange={(checked) => setForm({ ...form, isLive: checked })}
              />
            </div>
          </div>

          {/* Collapsible Advanced Settings (Custom API URL) */}
          <div className="border rounded-lg p-2.5 bg-muted/10">
            <button
              type="button"
              className="flex items-center justify-between w-full text-xs font-medium text-muted-foreground hover:text-foreground"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <span>Advanced API Endpoint Settings</span>
              {showAdvanced ? (
                <ChevronUp className="size-3.5" />
              ) : (
                <ChevronDown className="size-3.5" />
              )}
            </button>

            {showAdvanced && (
              <div className="pt-2.5 space-y-1.5">
                <Label htmlFor="apiUrl" className="text-xs">
                  Custom Base API URL
                </Label>
                <Input
                  id="apiUrl"
                  placeholder={
                    isSteadfast
                      ? "https://portal.steadfast.com.bd/api/v1"
                      : "https://api-hermes.pathao.com/aladdin/api/v1"
                  }
                  value={form.apiUrl}
                  onChange={(e) => setForm({ ...form, apiUrl: e.target.value })}
                />
                <p className="text-[11px] text-muted-foreground">
                  Leave empty to automatically use the official {form.isLive ? "Production (api-hermes.pathao.com)" : "Sandbox (courier-api-sandbox.pathao.com)"} endpoint.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating} className="gap-1.5">
              {isUpdating && <Loader2 className="size-3.5 animate-spin" />}
              {isUpdating ? "Saving..." : `Save ${provider.name} Settings`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
