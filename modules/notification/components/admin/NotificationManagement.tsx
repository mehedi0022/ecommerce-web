"use client";

import React, { useState } from "react";
import {
  useGetProvidersQuery,
  useUpdateProviderMutation,
  useDeleteProviderMutation,
  useLazyCheckProviderBalanceQuery,
  useGetTemplatesQuery,
  useUpdateTemplateMutation,
  useGetSmsLogsQuery,
} from "../../notificationApi";
import type { SmsProviderConfig, NotificationTemplate, SmsLog } from "../../types";
import { ProviderConfigModal } from "./ProviderConfigModal";
import { TestSmsModal } from "./TestSmsModal";
import { RichTextEditor } from "@/components/rich-text/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  Radio,
  Plus,
  Settings2,
  Check,
  Trash2,
  Edit,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Send,
  MessageSquare,
  Mail,
  History,
  Coins,
  Copy,
  Info,
  Code,
  PenTool,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function NotificationManagement() {
  const {
    data: providersData,
    isLoading: isLoadingProviders,
    refetch: refetchProviders,
    isFetching: isFetchingProviders,
  } = useGetProvidersQuery();

  const {
    data: templatesData,
    isLoading: isLoadingTemplates,
    refetch: refetchTemplates,
  } = useGetTemplatesQuery();

  const {
    data: logsData,
    isLoading: isLoadingLogs,
    refetch: refetchLogs,
  } = useGetSmsLogsQuery({ limit: 50 });

  const [updateProvider] = useUpdateProviderMutation();
  const [deleteProvider] = useDeleteProviderMutation();
  const [triggerCheckBalance] = useLazyCheckProviderBalanceQuery();
  const [updateTemplate, { isLoading: isUpdatingTemplate }] = useUpdateTemplateMutation();

  const [activeTab, setActiveTab] = useState<"PROVIDERS" | "TEMPLATES" | "LOGS">("PROVIDERS");
  const [editingProvider, setEditingProvider] = useState<SmsProviderConfig | null>(null);
  const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);
  const [isTestSmsModalOpen, setIsTestSmsModalOpen] = useState(false);

  // Balance cache per provider ID
  const [balances, setBalances] = useState<Record<number, { balance: any; loading: boolean }>>({});

  // Template edit states: event -> { smsEnabled, smsTemplate, emailEnabled, emailSubject, emailTemplate }
  const [templateEdits, setTemplateEdits] = useState<Record<string, Partial<NotificationTemplate>>>({});
  const [emailEditorModes, setEmailEditorModes] = useState<Record<string, "rich" | "code">>({});

  const providers = providersData?.data || [];
  const templates = templatesData?.data || [];
  const logs = logsData?.data || [];

  const activeProvider = providers.find((p: SmsProviderConfig) => p.isActive);

  // Toggle single active provider
  const handleToggleActive = async (provider: SmsProviderConfig, checked: boolean) => {
    try {
      await updateProvider({
        id: provider.id,
        body: { isActive: checked },
      }).unwrap();

      if (checked) {
        toast.success(`"${provider.name}" is now the ACTIVE SMS gateway. Other providers deactivated.`);
      } else {
        toast.info(`"${provider.name}" disabled. No SMS gateway is currently active.`);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update provider status");
    }
  };

  // Check balance for a specific provider
  const handleCheckBalance = async (providerId: number) => {
    setBalances((prev) => ({ ...prev, [providerId]: { balance: null, loading: true } }));
    try {
      const res = await triggerCheckBalance(providerId).unwrap();
      const bal = res.data?.balance ?? "N/A";
      setBalances((prev) => ({ ...prev, [providerId]: { balance: bal, loading: false } }));
      toast.success(`Balance: ${bal}`);
    } catch (err: any) {
      setBalances((prev) => ({ ...prev, [providerId]: { balance: "Error", loading: false } }));
      toast.error(err?.data?.message || "Failed to fetch balance");
    }
  };

  // Delete custom provider
  const handleDeleteProvider = async (provider: SmsProviderConfig) => {
    if (!confirm(`Are you sure you want to delete "${provider.name}"?`)) return;
    try {
      await deleteProvider(provider.id).unwrap();
      toast.success(`Provider "${provider.name}" deleted`);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete provider");
    }
  };

  // Handle template field edits
  const handleTemplateChange = (event: string, field: keyof NotificationTemplate, value: any) => {
    setTemplateEdits((prev) => ({
      ...prev,
      [event]: {
        ...prev[event],
        [field]: value,
      },
    }));
  };

  // Save template updates
  const handleSaveTemplate = async (template: NotificationTemplate) => {
    const edits = templateEdits[template.event];
    if (!edits) {
      toast.info("No modifications to save");
      return;
    }

    try {
      await updateTemplate({
        event: template.event,
        body: {
          smsEnabled: edits.smsEnabled !== undefined ? edits.smsEnabled : template.smsEnabled,
          smsTemplate: edits.smsTemplate !== undefined ? edits.smsTemplate : template.smsTemplate,
          emailEnabled: edits.emailEnabled !== undefined ? edits.emailEnabled : template.emailEnabled,
          emailSubject: edits.emailSubject !== undefined ? edits.emailSubject : template.emailSubject,
          emailTemplate: edits.emailTemplate !== undefined ? edits.emailTemplate : template.emailTemplate,
        },
      }).unwrap();

      toast.success(`Template "${template.name}" updated successfully!`);
      // Clear edits for this event
      setTemplateEdits((prev) => {
        const next = { ...prev };
        delete next[template.event];
        return next;
      });
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update notification template");
    }
  };

  // Helper to calculate SMS parts (Unicode vs GSM)
  const calculateSmsParts = (text: string) => {
    if (!text) return { chars: 0, parts: 0, isUnicode: false };
    // Check if contains non-ASCII (e.g. Bengali)
    const isUnicode = /[^\u0000-\u007F]/.test(text);
    const chars = text.length;
    let parts = 1;
    if (isUnicode) {
      parts = chars <= 70 ? 1 : Math.ceil(chars / 67);
    } else {
      parts = chars <= 160 ? 1 : Math.ceil(chars / 153);
    }
    return { chars, parts, isUnicode };
  };

  return (
    <div className="space-y-6">
      {/* ─── Top Header & Quick Actions ───────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">SMS & Notification Engine</h2>
          <p className="text-sm text-muted-foreground">
            Configure Bangladeshi SMS gateways, dynamic event templates, and monitor delivery audit logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsTestSmsModalOpen(true)}
            className="gap-1.5"
          >
            <Send className="size-4 text-primary" />
            Send Test SMS
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setEditingProvider(null);
              setIsProviderModalOpen(true);
            }}
            className="gap-1.5"
          >
            <Plus className="size-4" />
            Add New Gateway
          </Button>
        </div>
      </div>

      {/* ─── Active Gateway Banner ────────────────────────────── */}
      <div className="rounded-xl border bg-gradient-to-r from-card to-muted/20 p-4 shadow-xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex size-10 items-center justify-center rounded-lg font-bold",
                activeProvider
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
              )}
            >
              <Radio className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">
                  {activeProvider ? activeProvider.name : "No SMS Gateway Active"}
                </span>
                {activeProvider ? (
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 bg-emerald-500/10 text-xs">
                    Live Dispatcher
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-amber-500/30 text-amber-600 bg-amber-500/10 text-xs">
                    SMS Disabled
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {activeProvider
                  ? `Masking: ${activeProvider.senderId || "Non-Masking"} • Endpoint: ${activeProvider.apiUrl || "Default"}`
                  : "Enable one of your configured gateways below to send SMS notifications."}
              </p>
            </div>
          </div>

          {activeProvider && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCheckBalance(activeProvider.id)}
                disabled={balances[activeProvider.id]?.loading}
                className="gap-1.5 text-xs"
              >
                <Coins className="size-3.5" />
                {balances[activeProvider.id]?.loading ? (
                  "Checking..."
                ) : balances[activeProvider.id]?.balance !== undefined ? (
                  `Balance: ${balances[activeProvider.id].balance}`
                ) : (
                  "Check Balance"
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ─── Navigation Tabs ──────────────────────────────────── */}
      <div className="flex gap-2 border-b pb-2">
        <button
          onClick={() => setActiveTab("PROVIDERS")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors cursor-pointer",
            activeTab === "PROVIDERS"
              ? "bg-primary text-primary-foreground font-semibold"
              : "text-muted-foreground hover:bg-muted"
          )}
        >
          <Radio className="size-4" />
          SMS Gateways ({providers.length})
        </button>

        <button
          onClick={() => setActiveTab("TEMPLATES")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors cursor-pointer",
            activeTab === "TEMPLATES"
              ? "bg-primary text-primary-foreground font-semibold"
              : "text-muted-foreground hover:bg-muted"
          )}
        >
          <MessageSquare className="size-4" />
          Event Templates ({templates.length})
        </button>

        <button
          onClick={() => setActiveTab("LOGS")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors cursor-pointer",
            activeTab === "LOGS"
              ? "bg-primary text-primary-foreground font-semibold"
              : "text-muted-foreground hover:bg-muted"
          )}
        >
          <History className="size-4" />
          Delivery Logs
        </button>
      </div>

      {/* ─── TAB 1: SMS Gateways ──────────────────────────────── */}
      {activeTab === "PROVIDERS" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              💡 <strong>System Rule:</strong> You can add multiple gateways, but <strong>only 1 gateway can be active at a time</strong>. Activating one will automatically deactivate all others.
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetchProviders()}
              disabled={isFetchingProviders}
              className="gap-1 h-7 text-xs"
            >
              <RefreshCw className={cn("size-3", isFetchingProviders && "animate-spin")} />
              Refresh
            </Button>
          </div>

          {isLoadingProviders ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-44 rounded-xl border bg-muted/20 animate-pulse" />
              ))}
            </div>
          ) : providers.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center">
              <p className="text-sm text-muted-foreground">No SMS gateways found.</p>
              <Button
                size="sm"
                className="mt-3"
                onClick={() => {
                  setEditingProvider(null);
                  setIsProviderModalOpen(true);
                }}
              >
                Add Your First Gateway
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {providers.map((p: SmsProviderConfig) => {
                const balInfo = balances[p.id];
                return (
                  <Card
                    key={p.id}
                    className={cn(
                      "relative transition-all border shadow-xs hover:shadow-md",
                      p.isActive
                        ? "border-emerald-500/50 bg-emerald-500/[0.02] dark:border-emerald-500/40"
                        : "border-border"
                    )}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <CardTitle className="text-base flex items-center gap-2">
                            {p.name}
                            {p.isActive && (
                              <Badge className="bg-emerald-600 hover:bg-emerald-600 text-[10px]">
                                Active
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription className="text-xs mt-0.5">
                            Code: <code className="font-mono">{p.code}</code>
                          </CardDescription>
                        </div>

                        <Switch
                          checked={p.isActive}
                          onCheckedChange={(checked) => handleToggleActive(p, checked)}
                        />
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3 text-xs">
                      <div className="rounded-md bg-muted/40 p-2.5 space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Masking/Sender:</span>
                          <span className="font-medium">{p.senderId || "None (Non-masking)"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">API Token:</span>
                          <span className="font-mono">{p.apiKey || "Not set"}</span>
                        </div>
                        <div className="flex justify-between items-center pt-1 border-t">
                          <span className="text-muted-foreground">Balance:</span>
                          <div className="flex items-center gap-1.5 font-medium">
                            {balInfo?.loading ? (
                              <span className="text-muted-foreground">Checking...</span>
                            ) : balInfo?.balance !== undefined ? (
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                {balInfo.balance}
                              </span>
                            ) : (
                              <button
                                onClick={() => handleCheckBalance(p.id)}
                                className="text-primary hover:underline cursor-pointer"
                              >
                                Check
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1 border-t">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs gap-1"
                          onClick={() => {
                            setEditingProvider(p);
                            setIsProviderModalOpen(true);
                          }}
                        >
                          <Edit className="size-3.5" />
                          Configure
                        </Button>

                        {!["greenweb", "bulksmsbd"].includes(p.code) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs text-destructive hover:text-destructive gap-1"
                            onClick={() => handleDeleteProvider(p)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: Event Notification Templates ─────────────── */}
      {activeTab === "TEMPLATES" && (
        <div className="space-y-6">
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <Info className="size-4 shrink-0 text-primary" />
            <span>
              Click on any dynamic placeholder chip to insert it directly into the SMS or Email template.
            </span>
          </div>

          {isLoadingTemplates ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 rounded-xl border bg-muted/20 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {templates.map((t: NotificationTemplate) => {
                const edits = templateEdits[t.event] || {};
                const currentSmsEnabled = edits.smsEnabled !== undefined ? edits.smsEnabled : t.smsEnabled;
                const currentSmsTemplate = String((edits.smsTemplate !== undefined ? edits.smsTemplate : t.smsTemplate) || "");
                const currentEmailEnabled = edits.emailEnabled !== undefined ? edits.emailEnabled : t.emailEnabled;
                const currentEmailSubject = String((edits.emailSubject !== undefined ? edits.emailSubject : t.emailSubject) || "");
                const currentEmailTemplate = String((edits.emailTemplate !== undefined ? edits.emailTemplate : t.emailTemplate) || "");

                const smsCalc = calculateSmsParts(currentSmsTemplate);
                const hasUnsavedChanges = Boolean(templateEdits[t.event]);

                const vars = t.availableVars
                  ? t.availableVars.split(",").map((v: string) => v.trim())
                  : [];

                return (
                  <Card key={t.id} className="border shadow-xs">
                    <CardHeader className="pb-3 border-b bg-muted/10">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <CardTitle className="text-base flex items-center gap-2">
                            <span>{t.name}</span>
                            <Badge variant="outline" className="text-xs font-mono">
                              {t.event}
                            </Badge>
                          </CardTitle>
                          <CardDescription className="text-xs mt-0.5">
                            Triggered automatically when order enters this lifecycle stage.
                          </CardDescription>
                        </div>

                        {hasUnsavedChanges && (
                          <Button
                            size="sm"
                            onClick={() => handleSaveTemplate(t)}
                            disabled={isUpdatingTemplate}
                            className="gap-1.5 h-8 text-xs"
                          >
                            <Check className="size-3.5" />
                            {isUpdatingTemplate ? "Saving..." : "Save Changes"}
                          </Button>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-5 pt-4">
                      {/* Available Variables */}
                      {vars.length > 0 && (
                        <div>
                          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                            Available Dynamic Variables (Click to insert):
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {vars.map((v: string) => (
                              <button
                                key={v}
                                type="button"
                                onClick={() => {
                                  const updated = (currentSmsTemplate ? currentSmsTemplate + " " : "") + v;
                                  handleTemplateChange(t.event, "smsTemplate", updated);
                                }}
                                className="rounded-md border bg-muted/40 hover:bg-primary/10 hover:border-primary/40 px-2 py-0.5 text-xs font-mono transition-colors cursor-pointer"
                              >
                                {v}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* SMS Channel Section */}
                      <div className="rounded-xl border p-4 space-y-3 bg-muted/5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="size-4 text-primary" />
                            <span className="text-sm font-semibold">SMS Notification Channel</span>
                          </div>
                          <Switch
                            checked={currentSmsEnabled}
                            onCheckedChange={(checked) => handleTemplateChange(t.event, "smsEnabled", checked)}
                          />
                        </div>

                        {currentSmsEnabled && (
                          <div className="space-y-2">
                            <Textarea
                              rows={3}
                              placeholder="SMS message text template..."
                              value={currentSmsTemplate}
                              onChange={(e) => handleTemplateChange(t.event, "smsTemplate", e.target.value)}
                              className="font-sans text-sm"
                            />
                            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                              <span>
                                {smsCalc.isUnicode ? (
                                  <span className="text-amber-600 dark:text-amber-400">
                                    Unicode / Bengali Mode (70 chars per SMS)
                                  </span>
                                ) : (
                                  <span>Standard GSM 7-bit Mode (160 chars per SMS)</span>
                                )}
                              </span>
                              <span>
                                <strong>{smsCalc.chars}</strong> chars •{" "}
                                <strong>{smsCalc.parts}</strong> SMS part{smsCalc.parts > 1 ? "s" : ""}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Email Channel Section */}
                      <div className="rounded-xl border p-4 space-y-3 bg-muted/5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Mail className="size-4 text-primary" />
                            <span className="text-sm font-semibold">Email Notification Channel</span>
                          </div>
                          <Switch
                            checked={currentEmailEnabled}
                            onCheckedChange={(checked) => handleTemplateChange(t.event, "emailEnabled", checked)}
                          />
                        </div>

                        {currentEmailEnabled && (
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Email Subject Line</Label>
                              <Input
                                placeholder="Subject line..."
                                value={currentEmailSubject}
                                onChange={(e) => handleTemplateChange(t.event, "emailSubject", e.target.value)}
                                className="h-8 text-xs"
                              />
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label className="text-xs">Email Body / Template</Label>
                                <div className="flex items-center gap-1 rounded-md border bg-muted/40 p-0.5 text-[11px]">
                                  <button
                                    type="button"
                                    onClick={() => setEmailEditorModes((prev) => ({ ...prev, [t.event]: "rich" }))}
                                    className={cn(
                                      "flex items-center gap-1 rounded px-2 py-0.5 transition-colors cursor-pointer",
                                      (emailEditorModes[t.event] ?? "rich") === "rich"
                                        ? "bg-background text-foreground font-semibold shadow-xs"
                                        : "text-muted-foreground hover:text-foreground"
                                    )}
                                  >
                                    <PenTool className="size-3" /> Visual Editor
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEmailEditorModes((prev) => ({ ...prev, [t.event]: "code" }))}
                                    className={cn(
                                      "flex items-center gap-1 rounded px-2 py-0.5 transition-colors cursor-pointer",
                                      emailEditorModes[t.event] === "code"
                                        ? "bg-background text-foreground font-semibold shadow-xs"
                                        : "text-muted-foreground hover:text-foreground"
                                    )}
                                  >
                                    <Code className="size-3" /> HTML Code
                                  </button>
                                </div>
                              </div>

                              {(emailEditorModes[t.event] ?? "rich") === "rich" ? (
                                <div className="rounded-xl border bg-background overflow-hidden">
                                  <RichTextEditor
                                    id={`email-body-${t.event}`}
                                    value={currentEmailTemplate}
                                    onChange={(html) => handleTemplateChange(t.event, "emailTemplate", html)}
                                    uploadImage={async () => ""}
                                    placeholder="Format headings, bold text, bullet points, tables, and buttons..."
                                    minHeight="min-h-40"
                                  />
                                </div>
                              ) : (
                                <Textarea
                                  rows={6}
                                  placeholder="Write custom HTML tags: <table>, <p>, <strong>..."
                                  value={currentEmailTemplate}
                                  onChange={(e) => handleTemplateChange(t.event, "emailTemplate", e.target.value)}
                                  className="font-mono text-xs"
                                />
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 3: SMS Delivery Logs ────────────────────────── */}
      {activeTab === "LOGS" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Recent SMS dispatch logs and gateway API responses.
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchLogs()}
              className="gap-1 h-7 text-xs"
            >
              <RefreshCw className="size-3" />
              Refresh Logs
            </Button>
          </div>

          <Card className="border shadow-xs overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[140px]">Date / Time</TableHead>
                  <TableHead className="w-[120px]">Gateway</TableHead>
                  <TableHead className="w-[140px]">Recipient</TableHead>
                  <TableHead>Message Content</TableHead>
                  <TableHead className="w-[100px] text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingLogs ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-sm text-muted-foreground">
                      Loading SMS audit logs...
                    </TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-sm text-muted-foreground">
                      No SMS logs recorded yet. Send a test SMS to check the logger!
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log: SmsLog) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString("en-GB", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </TableCell>
                      <TableCell className="text-xs font-semibold">
                        {log.providerCode}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {log.recipientPhone}
                      </TableCell>
                      <TableCell className="text-xs max-w-xs truncate" title={log.message}>
                        {log.message}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px]",
                            log.status === "SENT" && "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
                            log.status === "FAILED" && "bg-red-500/10 text-red-600 border-red-500/30",
                            log.status === "PENDING" && "bg-amber-500/10 text-amber-600 border-amber-500/30"
                          )}
                        >
                          {log.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {/* ─── Modals ───────────────────────────────────────────── */}
      <ProviderConfigModal
        isOpen={isProviderModalOpen}
        onClose={() => {
          setIsProviderModalOpen(false);
          setEditingProvider(null);
        }}
        provider={editingProvider}
      />

      <TestSmsModal
        isOpen={isTestSmsModalOpen}
        onClose={() => setIsTestSmsModalOpen(false)}
        activeProviderName={activeProvider?.name}
      />
    </div>
  );
}
