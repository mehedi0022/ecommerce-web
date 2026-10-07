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
import { KeyRound, Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { useResetUserPasswordMutation } from "../../userApi";
import type { UserItem } from "../../types";

interface ResetPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserItem | null;
}

export function ResetPasswordDialog({
  open,
  onOpenChange,
  user,
}: ResetPasswordDialogProps) {
  const [resetPassword, { isLoading }] = useResetUserPasswordMutation();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match.");
      return;
    }

    try {
      await resetPassword({
        id: user.id,
        data: { newPassword },
      }).unwrap();

      toast.success(
        `Password for ${user.fullName || user.email} was reset. Active sessions revoked.`
      );
      setNewPassword("");
      setConfirmPassword("");
      onOpenChange(false);
    } catch (error: any) {
      const message =
        error?.data?.message ||
        error?.message ||
        "Failed to reset user password.";
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="size-5 text-amber-500" />
            Reset Password
          </DialogTitle>
          <DialogDescription>
            Set a new temporary or permanent password for{" "}
            <span className="font-semibold text-foreground">
              {user?.fullName || user?.email}
            </span>
            . All existing active sessions will be terminated immediately.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="newPassword" className="text-xs font-semibold">
              New Password
            </Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="Min 8 characters (Upper, lower, number, special)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-xs font-semibold">
              Confirm New Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Re-type password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-2.5 text-xs text-amber-700 dark:text-amber-300">
            <ShieldAlert className="size-4 shrink-0" />
            <p className="leading-tight">
              Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special symbol.
            </p>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} variant="destructive">
              {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
              Reset & Revoke Sessions
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
