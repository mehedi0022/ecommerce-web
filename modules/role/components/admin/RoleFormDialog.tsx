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
import { Loader2, ShieldPlus } from "lucide-react";
import { toast } from "sonner";
import { useCreateRoleMutation } from "../../roleApi";

interface RoleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (roleId: number) => void;
}

export function RoleFormDialog({
  open,
  onOpenChange,
  onSuccess,
}: RoleFormDialogProps) {
  const [createRole, { isLoading }] = useCreateRoleMutation();

  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [rank, setRank] = useState<number>(3);

  const handleNameChange = (val: string) => {
    setName(val);
    // Auto-generate key from name if not manually modified
    const generatedKey = val
      .toUpperCase()
      .trim()
      .replace(/[^A-Z0-9]+/g, "_");
    setKey(generatedKey);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || name.trim().length < 2) {
      toast.error("Role name must be at least 2 characters.");
      return;
    }

    if (!key.trim() || !/^[A-Z0-9_]+$/.test(key.trim())) {
      toast.error(
        "Role key must only consist of uppercase letters, numbers, and underscores."
      );
      return;
    }

    if (rank < 1 || rank > 7) {
      toast.error("Role rank must be between 1 and 7.");
      return;
    }

    try {
      const res = await createRole({
        name: name.trim(),
        key: key.trim(),
        rank: Number(rank),
        permissionIds: [],
      }).unwrap();

      toast.success(`Role "${name}" created. You can now configure its permissions.`);
      setName("");
      setKey("");
      setRank(3);
      onOpenChange(false);
      if (res.data?.id) {
        onSuccess(res.data.id);
      }
    } catch (error: any) {
      const msg =
        error?.data?.message || error?.message || "Failed to create role.";
      toast.error(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldPlus className="size-5 text-primary" />
            Create Custom Role
          </DialogTitle>
          <DialogDescription>
            Define a custom administrative role. You can customize its permissions after creating it.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Role Name */}
          <div className="space-y-1.5">
            <Label htmlFor="roleName" className="text-xs font-semibold">
              Role Display Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="roleName"
              placeholder="e.g. Order Dispatcher"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              minLength={2}
            />
          </div>

          {/* Role Key */}
          <div className="space-y-1.5">
            <Label htmlFor="roleKey" className="text-xs font-semibold">
              System Role Key <span className="text-destructive">*</span>
            </Label>
            <Input
              id="roleKey"
              placeholder="e.g. ORDER_DISPATCHER"
              value={key}
              onChange={(e) => setKey(e.target.value.toUpperCase())}
              required
            />
            <p className="text-[11px] text-muted-foreground">
              Uppercase identifier used internally for authorization checks.
            </p>
          </div>

          {/* Role Rank */}
          <div className="space-y-1.5">
            <Label htmlFor="roleRank" className="text-xs font-semibold">
              Hierarchy Rank (1 - 7) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="roleRank"
              type="number"
              min={1}
              max={7}
              value={rank}
              onChange={(e) => setRank(Number(e.target.value))}
              required
            />
            <p className="text-[11px] text-muted-foreground">
              Higher rank users can manage and assign roles with lower rank. (Rank 8 is reserved for Super Admin).
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
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
              Create Role
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
