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
import { toast } from "sonner";
import {
  useCreateProviderMutation,
  useUpdateProviderMutation,
} from "../../notificationApi";
import type { SmsProviderConfig } from "../../types";
import { AlertCircle, Radio } from "lucide-react";

interface ProviderConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: SmsProviderConfig | null;
}

export function ProviderConfigModal({
  isOpen,
  onClose,
  provider,
}: ProviderConfigModalProps) {
  const [createProvider, { isLoading: isCreating }] = useCreateProviderMutation();
  const [updateProvider, { isLoading: isUpdating }] = useUpdateProviderMutation();

  const isEditing = Boolean(provider);

  const [form, setForm] = useState({
    code: "",
    name: "",
    senderId: "",
    apiKey: "",
    apiSecret: "",
    apiUrl: "",
    isActive: false,
  });

  useEffect(() => {
    if (provider) {
      setForm({
        code: provider.code,
        name: provider.name,
        senderId: provider.senderId || "",
        apiKey: "",
        apiSecret: "",
        apiUrl: provider.apiUrl || "",
        isActive: provider.isActive,
      });
    } else {
      setForm({
        code: "",
        name: "",
        senderId: "",
        apiKey: "",
        apiSecret: "",
        apiUrl: "",
        isActive: false,
      });
    }
  }, [provider, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Provider name is required");
      return;
    }

    try {
      if (isEditing && provider) {
        const updatePayload: any = {
          name: form.name,
          senderId: form.senderId || null,
          apiUrl: form.apiUrl || null,
          isActive: form.isActive,
        };
        if (form.apiKey.trim()) updatePayload.apiKey = form.apiKey.trim();
        if (form.apiSecret.trim()) updatePayload.apiSecret = form.apiSecret.trim();

        await updateProvider({
          id: provider.id,
          body: updatePayload,
        }).unwrap();
        toast.success(`Gateway "${form.name}" updated successfully`);
      } else {
        if (!form.code.trim()) {
          toast.error("Unique provider code is required");
          return;
        }
        await createProvider({
          code: form.code.trim().toLowerCase().replaceAll(/\s+/g, "_"),
          name: form.name.trim(),
          senderId: form.senderId.trim() || undefined,
          apiKey: form.apiKey.trim() || undefined,
          apiSecret: form.apiSecret.trim() || undefined,
          apiUrl: form.apiUrl.trim() || undefined,
          isActive: form.isActive,
        }).unwrap();
        toast.success(`Gateway "${form.name}" created successfully`);
      }
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to save SMS provider");
    }
  };

  const isPending = isCreating || isUpdating;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Radio className="size-5 text-primary" />
            {isEditing ? `Configure ${provider?.name}` : "Add New SMS Gateway"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update credentials and gateway endpoint parameters."
              : "Register a new SMS provider. Only one provider can be active at a time."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {!isEditing && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="code">Provider Code</Label>
                <Input
                  id="code"
                  placeholder="e.g. mim_sms, onnorokom"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  required
                />
                <span className="text-[11px] text-muted-foreground">Unique identifier</span>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. MiM SMS Gateway"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
            </div>
          )}

          {isEditing && (
            <div className="space-y-1.5">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="apiKey">
                {isEditing ? "API Key / Token (leave blank to keep)" : "API Key / Token"}
              </Label>
              <Input
                id="apiKey"
                type="password"
                placeholder={isEditing ? "••••••••••••" : "Enter API Key"}
                value={form.apiKey}
                onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="senderId">Sender ID / Masking</Label>
              <Input
                id="senderId"
                placeholder="e.g. 8809612... or BrandName"
                value={form.senderId}
                onChange={(e) => setForm({ ...form, senderId: e.target.value })}
              />
              <span className="text-[11px] text-muted-foreground">Approved sender masking</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="apiUrl">API Endpoint URL</Label>
            <Input
              id="apiUrl"
              placeholder="e.g. http://api.greenweb.com.bd/api.php"
              value={form.apiUrl}
              onChange={(e) => setForm({ ...form, apiUrl: e.target.value })}
            />
            <span className="text-[11px] text-muted-foreground">
              Supports placeholders: &#123;to&#125;, &#123;message&#125;, &#123;apiKey&#125;, &#123;senderId&#125;
            </span>
          </div>

          <div className="rounded-lg border bg-muted/30 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold">Active Gateway Status</span>
                <p className="text-xs text-muted-foreground">
                  Send system automated notifications through this provider.
                </p>
              </div>
              <Switch
                checked={form.isActive}
                onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
              />
            </div>

            {form.isActive && (
              <div className="flex items-start gap-2 rounded bg-amber-500/10 p-2 text-xs text-amber-600 dark:text-amber-400">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>
                  <strong>Single Active Rule:</strong> Activating this gateway will automatically deactivate all other SMS gateways in the system.
                </span>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 pt-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : isEditing ? "Save Changes" : "Create Gateway"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
