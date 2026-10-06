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
import { toast } from "sonner";
import { useSendTestSmsMutation } from "../../notificationApi";
import { Send, Smartphone, CheckCircle2, XCircle } from "lucide-react";

interface TestSmsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProviderName?: string;
}

export function TestSmsModal({
  isOpen,
  onClose,
  activeProviderName,
}: TestSmsModalProps) {
  const [phone, setPhone] = useState("");
  const [sendTestSms, { isLoading }] = useSendTestSmsMutation();
  const [lastResult, setLastResult] = useState<any | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      toast.error("Please enter a valid phone number");
      return;
    }

    try {
      setLastResult(null);
      const res = await sendTestSms({ phone: phone.trim() }).unwrap();
      setLastResult(res.data);
      if (res.data?.success) {
        toast.success("Test SMS sent successfully!");
      } else {
        toast.error(res.data?.errorMessage || "SMS gateway reported a delivery failure");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to send test SMS");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="size-5 text-primary" />
            Send Test SMS
          </DialogTitle>
          <DialogDescription>
            Verify that your active SMS provider (
            <span className="font-medium text-foreground">
              {activeProviderName || "Active Gateway"}
            </span>
            ) is properly connected and dispatching messages.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="test-phone">Recipient Mobile Number</Label>
            <Input
              id="test-phone"
              placeholder="e.g. 01712345678 or +8801712345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <span className="text-[11px] text-muted-foreground">
              A standard test message will be sent to this number.
            </span>
          </div>

          {lastResult && (
            <div
              className={`rounded-lg border p-3 text-xs space-y-1 ${
                lastResult.success
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                  : "bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400"
              }`}
            >
              <div className="flex items-center gap-1.5 font-semibold">
                {lastResult.success ? (
                  <CheckCircle2 className="size-4 shrink-0" />
                ) : (
                  <XCircle className="size-4 shrink-0" />
                )}
                <span>Status: {lastResult.status}</span>
              </div>
              {lastResult.errorMessage && (
                <p>Error: {lastResult.errorMessage}</p>
              )}
              {lastResult.responsePayload && (
                <pre className="mt-1 max-h-24 overflow-y-auto rounded bg-black/5 p-1.5 font-mono text-[10px] dark:bg-white/5">
                  {JSON.stringify(lastResult.responsePayload, null, 2)}
                </pre>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 pt-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Close
            </Button>
            <Button type="submit" disabled={isLoading} className="gap-1.5">
              <Send className="size-4" />
              {isLoading ? "Sending..." : "Send Test SMS"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
