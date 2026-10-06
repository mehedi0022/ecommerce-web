"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useUpdatePaymentMethodMutation } from "../../paymentApi";
import type { PaymentMethodConfig } from "../../types";
import { ShieldCheck, Lock } from "lucide-react";

interface GatewayConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  method?: PaymentMethodConfig | null;
}

export function GatewayConfigModal({
  open,
  onOpenChange,
  method,
}: GatewayConfigModalProps) {
  const [updateMethod, { isLoading }] = useUpdatePaymentMethodMutation();

  const [name, setName] = useState("");
  const [instructions, setInstructions] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [chargePercentage, setChargePercentage] = useState("0");
  const [chargeFlat, setChargeFlat] = useState("0");

  // SSLCommerz credentials
  const [storeId, setStoreId] = useState("");
  const [storePassword, setStorePassword] = useState("");

  // bKash Merchant credentials
  const [appKey, setAppKey] = useState("");
  const [appSecret, setAppSecret] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Stripe credentials
  const [publishableKey, setPublishableKey] = useState("");
  const [secretKey, setSecretKey] = useState("");

  useEffect(() => {
    if (method) {
      setName(method.name);
      setInstructions(method.instructions || "");
      setIsActive(method.isActive);
      setIsLive(method.isLive);
      setChargePercentage(String(method.chargePercentage ?? "0"));
      setChargeFlat(String(method.chargeFlat ?? "0"));

      const creds = method.credentials || {};
      if (method.code === "sslcommerz") {
        setStoreId(creds.storeId || "");
        setStorePassword(creds.storePassword || "");
      } else if (method.code.includes("bkash")) {
        setAppKey(creds.appKey || "");
        setAppSecret(creds.appSecret || "");
        setUsername(creds.username || "");
        setPassword(creds.password || "");
      } else if (method.code.includes("stripe")) {
        setPublishableKey(creds.publishableKey || "");
        setSecretKey(creds.secretKey || "");
      }
    }
  }, [method, open]);

  if (!method) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let credentials: Record<string, any> = {};

    if (method.code === "sslcommerz") {
      credentials = { storeId: storeId.trim(), storePassword: storePassword.trim() };
    } else if (method.code.includes("bkash")) {
      credentials = {
        appKey: appKey.trim(),
        appSecret: appSecret.trim(),
        username: username.trim(),
        password: password.trim(),
      };
    } else if (method.code.includes("stripe")) {
      credentials = {
        publishableKey: publishableKey.trim(),
        secretKey: secretKey.trim(),
      };
    }

    try {
      await updateMethod({
        id: method.id,
        body: {
          name: name.trim(),
          instructions: instructions.trim() || null,
          chargePercentage: Number(chargePercentage) || 0,
          chargeFlat: Number(chargeFlat) || 0,
          isActive,
          isLive,
          credentials,
        },
      }).unwrap();

      toast.success(`${method.name} configuration updated successfully!`);
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update gateway settings");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary" />
            <DialogTitle>Configure {method.name}</DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-sm">
          <div className="space-y-1.5">
            <Label>Display Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>Instructions / Customer Note</Label>
            <Textarea
              rows={2}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="পেমেন্ট গেটওয়ের বিবরণ..."
            />
          </div>

          {/* SSLCommerz Specific Fields */}
          {method.code === "sslcommerz" && (
            <div className="space-y-3 rounded-xl border bg-muted/30 p-3.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                <Lock className="size-3.5 text-primary" />
                <span>SSLCommerz Merchant Credentials</span>
              </div>

              <div className="space-y-1.5">
                <Label>Store ID *</Label>
                <Input
                  placeholder="e.g. testbox_live"
                  value={storeId}
                  onChange={(e) => setStoreId(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Store Password *</Label>
                <Input
                  type="password"
                  placeholder="••••••••••••"
                  value={storePassword}
                  onChange={(e) => setStorePassword(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* bKash Merchant API Fields */}
          {method.code.includes("bkash") && (
            <div className="space-y-3 rounded-xl border bg-muted/30 p-3.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                <Lock className="size-3.5 text-pink-600 dark:text-pink-400" />
                <span>bKash Tokenized Checkout API Credentials</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                bKash Merchant Portal অথবা Sandbox টেস্ট অ্যাকাউন্ট থেকে প্রাপ্ত App Key, App Secret, Username ও Password দিন।
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>App Key</Label>
                  <Input
                    placeholder="bKash App Key"
                    value={appKey}
                    onChange={(e) => setAppKey(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>App Secret</Label>
                  <Input
                    type="password"
                    placeholder="bKash App Secret"
                    value={appSecret}
                    onChange={(e) => setAppSecret(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Merchant Username</Label>
                  <Input
                    placeholder="Merchant Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Merchant Password</Label>
                  <Input
                    type="password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Stripe Specific Fields */}
          {method.code.includes("stripe") && (
            <div className="space-y-3 rounded-xl border bg-muted/30 p-3.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                <Lock className="size-3.5 text-primary" />
                <span>Stripe API Credentials</span>
              </div>

              <div className="space-y-1.5">
                <Label>Publishable Key</Label>
                <Input
                  placeholder="pk_test_..."
                  value={publishableKey}
                  onChange={(e) => setPublishableKey(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Secret Key</Label>
                <Input
                  type="password"
                  placeholder="sk_test_..."
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Additional Gateway / Transaction Fee */}
          <div className="rounded-xl border bg-muted/20 p-3.5 space-y-3">
            <div>
              <span className="block text-xs font-semibold text-foreground">
                Payment Gateway Surcharge / Transaction Fee (Optional)
              </span>
              <span className="block text-[11px] text-muted-foreground">
                কাস্টমার যখন এই গেটওয়ে দিয়ে পে করবে, তখন অতিরিক্ত চার্জ (যেমন: ১.৮% বা ২% পিজিডব্লিউ ফি) অটোমেটিক যোগ করতে চাইলে এখানে সেট করুন।
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Gateway Fee (%)</Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g. 1.80"
                    value={chargePercentage}
                    onChange={(e) => setChargePercentage(e.target.value)}
                    className="pr-7 text-xs"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-semibold">
                    %
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Flat Surcharge (৳ BDT)</Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="1"
                    min="0"
                    placeholder="e.g. 0"
                    value={chargeFlat}
                    onChange={(e) => setChargeFlat(e.target.value)}
                    className="pr-7 text-xs"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-semibold">
                    ৳
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Environment Mode Switch */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <span className="block text-xs font-semibold text-foreground">
                Live Production Environment
              </span>
              <span className="block text-[11px] text-muted-foreground">
                {isLive ? "Currently in LIVE production mode" : "Currently in SANDBOX / TEST mode"}
              </span>
            </div>
            <Switch checked={isLive} onCheckedChange={setIsLive} />
          </div>

          {/* Active Switch */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <span className="block text-xs font-semibold text-foreground">
                Enable Gateway in Checkout
              </span>
              <span className="block text-[11px] text-muted-foreground">
                অন করলে কাস্টমাররা চেকআউট পেজে সরাসরি কার্ড ও গেটওয়ে অপশন দেখতে পাবে।
              </span>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Credentials"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
