"use client";

import React, { useState, useEffect } from "react";
import {
  Save,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Activity,
  Send,
  Loader2,
  Eye,
  EyeOff,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import {
  useGetMarketingSettingsQuery,
  useUpdateMarketingSettingsMutation,
  useTestMetaCapiMutation,
  type MarketingSettings,
} from "../../marketingApi";

export function MarketingSettingsManagement() {
  const { data, isLoading, refetch } = useGetMarketingSettingsQuery();
  const [updateSettings, { isLoading: isSaving }] = useUpdateMarketingSettingsMutation();
  const [testMetaCapi, { isLoading: isTestingMeta }] = useTestMetaCapiMutation();

  const [form, setForm] = useState<MarketingSettings | null>(null);
  const [showMetaToken, setShowMetaToken] = useState(false);
  const [showTikTokToken, setShowTikTokToken] = useState(false);
  const [metaTestResult, setMetaTestResult] = useState<{
    success: boolean;
    message: string;
    traceId?: string;
  } | null>(null);

  useEffect(() => {
    if (data?.data) {
      setForm(data.data);
    }
  }, [data]);

  if (isLoading || !form) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
        <Loader2 className="size-5 animate-spin mr-2" /> Loading marketing and pixel settings...
      </div>
    );
  }

  const handleSave = async () => {
    try {
      await updateSettings(form).unwrap();
      toast.success("Marketing and pixel settings updated successfully!");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update marketing settings.");
    }
  };

  const handleRunMetaTest = async () => {
    if (!form.facebook.pixelId.trim()) {
      toast.error("Please enter your Meta Pixel ID first.");
      return;
    }
    if (!form.facebook.accessToken.trim()) {
      toast.error("Please enter your Meta Conversions API Access Token first.");
      return;
    }
    if (!form.facebook.testEventCode?.trim()) {
      toast.error("Please enter a Meta Test Event Code (e.g. TEST12345) from your Meta Events Manager.");
      return;
    }

    setMetaTestResult(null);
    try {
      const res = await testMetaCapi({
        pixelId: form.facebook.pixelId.trim(),
        accessToken: form.facebook.accessToken.trim(),
        testEventCode: form.facebook.testEventCode.trim(),
      }).unwrap();

      setMetaTestResult({
        success: true,
        message: "Test event successfully received by Meta Conversions API!",
        traceId: res.data?.fbtrace_id,
      });
      toast.success("Test event delivered to Meta! Check your Events Manager Test Events tab.");
    } catch (err: any) {
      setMetaTestResult({
        success: false,
        message: err?.data?.message || err?.message || "Meta API test failed.",
      });
      toast.error(err?.data?.message || "Meta test failed.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Save */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Activity className="size-6 text-primary" />
            Marketing & Tracking Pixels
            <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 ml-1">
              CAPI Deduplication Active
            </Badge>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure Facebook Pixel, Conversions API (CAPI), Google Tag Manager, GA4, and TikTok Ads with 100% duplicate purchase protection.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="h-9 gap-1.5 text-xs"
          >
            <RefreshCw className="size-3.5" />
            Reload
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="h-9 gap-1.5 text-xs font-semibold bg-primary shadow-xs"
          >
            {isSaving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
            Save Settings
          </Button>
        </div>
      </div>

      {/* Deduplication & Purchase Integrity Guarantee Card */}
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 sm:p-5 space-y-2.5">
        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold text-sm">
          <ShieldCheck className="size-5" />
          Zero-Duplicate Purchase Tracking Guarantee (Deduplication Protection)
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          One of the biggest issues in advertising is seeing <strong>2 purchases in Ads Manager when only 1 order was placed</strong>.
          Our system solves this with three layers of protection:
        </p>
        <div className="grid gap-2 sm:grid-cols-3 text-xs pt-1">
          <div className="bg-background/80 rounded-xl p-3 border">
            <span className="font-bold text-foreground block mb-1">1. Exact `event_id` Match</span>
            Browser Pixel and Server CAPI share the exact same deterministic ID (<code>order_123</code>). Meta automatically merges them into 1 single purchase.
          </div>
          <div className="bg-background/80 rounded-xl p-3 border">
            <span className="font-bold text-foreground block mb-1">2. Refresh-Safe Success Page</span>
            Customers reloading the order confirmation page will <strong>never</strong> trigger a second purchase event. Reloads are blocked via session guards.
          </div>
          <div className="bg-background/80 rounded-xl p-3 border">
            <span className="font-bold text-foreground block mb-1">3. Database-Confirmed Only</span>
            Purchase events only fire <em>after</em> the order is committed into the database, never on button clicks that might fail validation.
          </div>
        </div>
      </div>

      {/* ─── Facebook / Meta Card ────────────────────────────────────────── */}
      <Card className="rounded-2xl border shadow-xs overflow-hidden">
        <CardHeader className="bg-muted/30 border-b pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-base">
                f
              </div>
              <div>
                <CardTitle className="text-base font-bold">Meta / Facebook Pixel & Conversions API (CAPI)</CardTitle>
                <CardDescription className="text-xs">
                  Combines browser events with server-to-server CAPI to overcome ad-blockers and iOS restrictions.
                </CardDescription>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.facebook.enabled}
                onChange={(e) =>
                  setForm({
                    ...form,
                    facebook: { ...form.facebook, enabled: e.target.checked },
                  })
                }
                className="size-4 rounded border-input text-primary"
              />
              <span className="text-xs font-bold text-foreground">Enabled</span>
            </label>
          </div>
        </CardHeader>

        <CardContent className="p-5 sm:p-6 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Pixel ID */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Meta Pixel ID (Browser Pixel)</Label>
              <Input
                placeholder="e.g. 123456789012345"
                value={form.facebook.pixelId}
                onChange={(e) =>
                  setForm({
                    ...form,
                    facebook: { ...form.facebook, pixelId: e.target.value.trim() },
                  })
                }
                className="h-9 font-mono text-xs"
              />
              <p className="text-[11px] text-muted-foreground">
                Found in Meta Events Manager &gt; Data Sources &gt; Settings &gt; Pixel ID.
              </p>
            </div>

            {/* Test Event Code */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Test Event Code (Optional)</Label>
                <a
                  href="https://business.facebook.com/events_manager2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-primary hover:underline inline-flex items-center gap-1"
                >
                  Meta Events Manager <ExternalLink className="size-2.5" />
                </a>
              </div>
              <Input
                placeholder="e.g. TEST12345"
                value={form.facebook.testEventCode || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    facebook: { ...form.facebook, testEventCode: e.target.value.trim() },
                  })
                }
                className="h-9 font-mono text-xs"
              />
              <p className="text-[11px] text-muted-foreground">
                Found under Meta Events Manager &gt; Test Events tab. Leave empty in production.
              </p>
            </div>
          </div>

          {/* Conversions API (CAPI) */}
          <div className="pt-3 border-t space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-foreground block">
                  Server-Side Conversions API (CAPI)
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Direct server-to-server tracking directly from our backend node to Meta's Graph API.
                </span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.facebook.capiEnabled}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      facebook: { ...form.facebook, capiEnabled: e.target.checked },
                    })
                  }
                  className="size-4 rounded border-input text-primary"
                />
                <span className="text-xs font-semibold">Enable CAPI</span>
              </label>
            </div>

            {form.facebook.capiEnabled && (
              <div className="space-y-3 bg-muted/20 border rounded-xl p-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Meta System User Access Token</Label>
                  <div className="relative">
                    <Input
                      type={showMetaToken ? "text" : "password"}
                      placeholder="e.g. EAAB..."
                      value={form.facebook.accessToken}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          facebook: { ...form.facebook, accessToken: e.target.value.trim() },
                        })
                      }
                      className="h-9 font-mono text-xs pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowMetaToken(!showMetaToken)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showMetaToken ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Generated in Meta Events Manager &gt; Settings &gt; Conversions API &gt; "Generate access token".
                  </p>
                </div>

                {/* Test Event Button */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs text-muted-foreground">
                    Send a diagnostic ping to verify your token and pixel with Meta right now:
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRunMetaTest}
                    disabled={isTestingMeta}
                    className="h-8 gap-1.5 text-xs font-semibold rounded-lg bg-background"
                  >
                    {isTestingMeta ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Send className="size-3.5 text-blue-600" />
                    )}
                    Send Test Event to Meta
                  </Button>
                </div>

                {metaTestResult && (
                  <div
                    className={`rounded-xl p-3 text-xs border ${
                      metaTestResult.success
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300"
                        : "bg-destructive/10 border-destructive/20 text-destructive"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold">
                      {metaTestResult.success ? (
                        <CheckCircle2 className="size-4 text-emerald-600" />
                      ) : (
                        <AlertCircle className="size-4 text-destructive" />
                      )}
                      {metaTestResult.message}
                    </div>
                    {metaTestResult.traceId && (
                      <div className="text-[10px] mt-1 font-mono opacity-80">
                        Meta Trace ID: {metaTestResult.traceId}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ─── Google Tag Manager & GA4 Card ───────────────────────────────── */}
      <Card className="rounded-2xl border shadow-xs overflow-hidden">
        <CardHeader className="bg-muted/30 border-b pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-base">
                G
              </div>
              <div>
                <CardTitle className="text-base font-bold">Google Tag Manager (GTM) & Google Analytics 4 (GA4)</CardTitle>
                <CardDescription className="text-xs">
                  Automated eCommerce dataLayer events (`view_item`, `add_to_cart`, `begin_checkout`, `purchase`).
                </CardDescription>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.google.enabled}
                onChange={(e) =>
                  setForm({
                    ...form,
                    google: { ...form.google, enabled: e.target.checked },
                  })
                }
                className="size-4 rounded border-input text-primary"
              />
              <span className="text-xs font-bold text-foreground">Enabled</span>
            </label>
          </div>
        </CardHeader>

        <CardContent className="p-5 sm:p-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Google Tag Manager (GTM) Container ID</Label>
              <Input
                placeholder="GTM-XXXXXXX"
                value={form.google.gtmContainerId}
                onChange={(e) =>
                  setForm({
                    ...form,
                    google: { ...form.google, gtmContainerId: e.target.value.trim() },
                  })
                }
                className="h-9 font-mono text-xs"
              />
              <p className="text-[11px] text-muted-foreground">
                Injects standard GTM container script across storefront.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Google Analytics 4 (GA4) Measurement ID</Label>
              <Input
                placeholder="G-XXXXXXXXXX"
                value={form.google.ga4MeasurementId}
                onChange={(e) =>
                  setForm({
                    ...form,
                    google: { ...form.google, ga4MeasurementId: e.target.value.trim() },
                  })
                }
                className="h-9 font-mono text-xs"
              />
              <p className="text-[11px] text-muted-foreground">
                Optional if GTM is already firing GA4.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Google Ads Conversion ID (Optional)</Label>
              <Input
                placeholder="AW-XXXXXXXXX"
                value={form.google.googleAdsConversionId || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    google: { ...form.google, googleAdsConversionId: e.target.value.trim() },
                  })
                }
                className="h-9 font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Google Ads Conversion Label (Optional)</Label>
              <Input
                placeholder="e.g. AbC-D_efGhIjKlMn"
                value={form.google.googleAdsConversionLabel || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    google: { ...form.google, googleAdsConversionLabel: e.target.value.trim() },
                  })
                }
                className="h-9 font-mono text-xs"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── TikTok Pixel & Events API Card ──────────────────────────────── */}
      <Card className="rounded-2xl border shadow-xs overflow-hidden">
        <CardHeader className="bg-muted/30 border-b pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-black text-white flex items-center justify-center font-bold text-sm">
                TT
              </div>
              <div>
                <CardTitle className="text-base font-bold">TikTok Pixel & Events API</CardTitle>
                <CardDescription className="text-xs">
                  Tracks conversions for TikTok For Business ads.
                </CardDescription>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.tiktok.enabled}
                onChange={(e) =>
                  setForm({
                    ...form,
                    tiktok: { ...form.tiktok, enabled: e.target.checked },
                  })
                }
                className="size-4 rounded border-input text-primary"
              />
              <span className="text-xs font-bold text-foreground">Enabled</span>
            </label>
          </div>
        </CardHeader>

        <CardContent className="p-5 sm:p-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">TikTok Pixel ID</Label>
              <Input
                placeholder="e.g. C1234567890ABC"
                value={form.tiktok.pixelId}
                onChange={(e) =>
                  setForm({
                    ...form,
                    tiktok: { ...form.tiktok, pixelId: e.target.value.trim() },
                  })
                }
                className="h-9 font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">TikTok Test Event Code (Optional)</Label>
              <Input
                placeholder="e.g. TEST..."
                value={form.tiktok.testEventCode || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    tiktok: { ...form.tiktok, testEventCode: e.target.value.trim() },
                  })
                }
                className="h-9 font-mono text-xs"
              />
            </div>
          </div>

          <div className="pt-2 border-t space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">
                TikTok Server Events API
              </span>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.tiktok.eventsApiEnabled}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      tiktok: { ...form.tiktok, eventsApiEnabled: e.target.checked },
                    })
                  }
                  className="size-4 rounded border-input text-primary"
                />
                <span className="text-xs font-semibold">Enable Events API</span>
              </label>
            </div>

            {form.tiktok.eventsApiEnabled && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">TikTok Access Token</Label>
                <div className="relative">
                  <Input
                    type={showTikTokToken ? "text" : "password"}
                    placeholder="TikTok Long-term Access Token"
                    value={form.tiktok.accessToken || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        tiktok: { ...form.tiktok, accessToken: e.target.value.trim() },
                      })
                    }
                    className="h-9 font-mono text-xs pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowTikTokToken(!showTikTokToken)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showTikTokToken ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Floating or Bottom Save Button */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button
          size="lg"
          onClick={handleSave}
          disabled={isSaving}
          className="h-11 px-6 gap-2 text-sm font-bold shadow-md cursor-pointer"
        >
          {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Save Marketing & Pixel Settings
        </Button>
      </div>
    </div>
  );
}
