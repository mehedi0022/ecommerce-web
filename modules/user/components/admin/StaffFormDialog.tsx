"use client";

import React, { useEffect, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, UserCheck, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import {
  useCreateUserMutation,
  useUpdateUserMutation,
  useChangeUserRoleMutation,
} from "../../userApi";
import { useGetRolesQuery } from "@/modules/role/roleApi";
import type { UserItem } from "../../types";

interface StaffFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserItem | null;
  onSuccess: () => void;
}

export function StaffFormDialog({
  open,
  onOpenChange,
  user,
  onSuccess,
}: StaffFormDialogProps) {
  const isEditing = Boolean(user);
  const { data: rolesData, isLoading: isLoadingRoles } = useGetRolesQuery();
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [changeRole, { isLoading: isChangingRole }] = useChangeUserRoleMutation();

  const [fullName, setFullName] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState<string>("");

  const roles = rolesData?.data || [];

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setUserName(user.userName || "");
      setEmail(user.email || "");
      setRoleId(user.roleId ? String(user.roleId) : "");
      setPassword("");
    } else {
      setFullName("");
      setUserName("");
      setEmail("");
      setPassword("");
      // Default to MANAGER or ADMIN if available, or first non-customer role
      const defaultRole = roles.find((r) => r.key === "MANAGER") || roles[0];
      setRoleId(defaultRole ? String(defaultRole.id) : "");
    }
  }, [user, open, roles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || fullName.trim().length < 4) {
      toast.error("Full name must be at least 4 characters.");
      return;
    }

    if (!roleId) {
      toast.error("Please select an assigned role.");
      return;
    }

    try {
      if (isEditing && user) {
        // Update profile
        await updateUser({
          id: user.id,
          data: {
            fullName: fullName.trim(),
            userName: userName.trim() || undefined,
          },
        }).unwrap();

        // Change role if changed
        if (Number(roleId) !== user.roleId) {
          await changeRole({
            id: user.id,
            data: { roleId: Number(roleId) },
          }).unwrap();
        }

        toast.success(`Staff member "${fullName}" updated successfully.`);
      } else {
        // Create user
        if (!email.trim()) {
          toast.error("Valid email address is required.");
          return;
        }

        if (!password || password.length < 8) {
          toast.error("Password must be at least 8 characters.");
          return;
        }

        await createUser({
          fullName: fullName.trim(),
          userName: userName.trim() || undefined,
          email: email.trim().toLowerCase(),
          password,
          roleId: Number(roleId),
        }).unwrap();

        toast.success(`Staff member "${fullName}" created successfully.`);
      }

      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      const message =
        error?.data?.message ||
        error?.message ||
        "An error occurred while saving staff account.";
      toast.error(message);
    }
  };

  const isSubmitting = isCreating || isUpdating || isChangingRole;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="size-5 text-primary" />
            {isEditing ? "Edit Staff Member" : "Add New Staff Member"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update staff profile information and access role permissions."
              : "Create a new administrative or staff account with assigned role and credentials."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Full Name */}
          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="text-xs font-semibold">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fullName"
              placeholder="e.g. John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              minLength={4}
            />
          </div>

          {/* Username */}
          <div className="space-y-1.5">
            <Label htmlFor="userName" className="text-xs font-semibold">
              Username <span className="text-muted-foreground text-[10px]">(Optional)</span>
            </Label>
            <Input
              id="userName"
              placeholder="e.g. jdoe_staff"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold">
              Email Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="e.g. john@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isEditing}
              required
            />
            {isEditing && (
              <p className="text-[11px] text-muted-foreground">
                Email address cannot be changed directly after creation.
              </p>
            )}
          </div>

          {/* Role Selection */}
          <div className="space-y-1.5">
            <Label htmlFor="role" className="text-xs font-semibold">
              Assigned Role <span className="text-destructive">*</span>
            </Label>
            {isLoadingRoles ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                <Loader2 className="size-3.5 animate-spin" /> Loading roles...
              </div>
            ) : (
              <Select value={roleId} onValueChange={(val) => setRoleId(val ?? "")}>
                <SelectTrigger id="role" className="w-full">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r.id} value={String(r.id)}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{r.name}</span>
                        <span className="text-xs text-muted-foreground">
                          (Rank {r.rank} • {r.permissionCount} perms)
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Initial Password (only when creating) */}
          {!isEditing && (
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold">
                Initial Password <span className="text-destructive">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimum 8 characters with upper, lower, number, symbol"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <ShieldAlert className="size-3 text-amber-500 shrink-0" />
                Must include 1 uppercase, 1 lowercase, 1 number, and 1 special symbol.
              </p>
            </div>
          )}

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isEditing ? "Save Changes" : "Create Account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
