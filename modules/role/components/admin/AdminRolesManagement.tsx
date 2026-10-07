"use client";

import React, { useState, useEffect } from "react";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldPlus,
  Trash2,
  Save,
  RotateCcw,
  CheckCheck,
  Loader2,
  Users,
  Lock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  useGetRolesQuery,
  useGetRoleByIdQuery,
  useGetAllPermissionsQuery,
  useUpdateRolePermissionsMutation,
  useDeleteRoleMutation,
} from "../../roleApi";
import { RoleFormDialog } from "./RoleFormDialog";
import type { RoleItem, PermissionItem } from "../../types";

const moduleFriendlyNames: Record<string, string> = {
  users: "Users & Staff Accounts",
  rbac: "Role-Based Access Control (RBAC)",
  products: "Products & Variants",
  categories: "Categories",
  brands: "Brands",
  attributes: "Attributes & Options",
  inventory: "Inventory & Warehouses",
  orders: "Customer Orders",
  shipments: "Shipments & Fulfillment",
  shipping: "Shipping Methods & Zones",
  returns: "Returns & Inspections",
  refunds: "Refunds & Payouts",
  coupons: "Coupons & Discounts",
  reviews: "Customer Reviews & Moderation",
  navigation: "Navigation Menus",
  sliders: "Storefront Sliders & Banners",
  popups: "Storefront Popups & Promos",
};

export function AdminRolesManagement() {
  const { data: rolesData, isLoading: isLoadingRoles, refetch: refetchRoles } =
    useGetRolesQuery();
  const { data: permissionsData, isLoading: isLoadingPermissions } =
    useGetAllPermissionsQuery();

  const roles = rolesData?.data || [];
  const permissionsGrouped = permissionsData?.data?.grouped || {};
  const allPermissions = permissionsData?.data?.permissions || [];

  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);

  // Auto-select first role if none selected
  useEffect(() => {
    if (!selectedRoleId && roles.length > 0) {
      // Prefer SUPER_ADMIN or first role
      const superAdmin = roles.find((r) => r.key === "SUPER_ADMIN");
      setSelectedRoleId(superAdmin ? superAdmin.id : roles[0].id);
    }
  }, [roles, selectedRoleId]);

  const { data: roleDetailData, isLoading: isLoadingRoleDetail } =
    useGetRoleByIdQuery(selectedRoleId!, {
      skip: !selectedRoleId,
    });

  const selectedRole = roleDetailData?.data;

  // Selected permission IDs state for the active role
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>(
    []
  );
  const [hasChanges, setHasChanges] = useState(false);

  // Sync state when role changes or loads
  useEffect(() => {
    if (selectedRole) {
      setSelectedPermissionIds(selectedRole.permissionIds || []);
      setHasChanges(false);
    }
  }, [selectedRole]);

  const [updatePermissions, { isLoading: isSaving }] =
    useUpdateRolePermissionsMutation();
  const [deleteRole, { isLoading: isDeleting }] = useDeleteRoleMutation();

  const [createRoleOpen, setCreateRoleOpen] = useState(false);

  const handleTogglePermission = (permissionId: number) => {
    setSelectedPermissionIds((prev) => {
      const next = prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId];
      setHasChanges(true);
      return next;
    });
  };

  const handleToggleModule = (modulePermissions: PermissionItem[]) => {
    const moduleIds = modulePermissions.map((p) => p.id);
    const allSelected = moduleIds.every((id) =>
      selectedPermissionIds.includes(id)
    );

    setSelectedPermissionIds((prev) => {
      let next: number[];
      if (allSelected) {
        next = prev.filter((id) => !moduleIds.includes(id));
      } else {
        next = Array.from(new Set([...prev, ...moduleIds]));
      }
      setHasChanges(true);
      return next;
    });
  };

  const handleSelectAll = () => {
    const allIds = allPermissions.map((p) => p.id);
    setSelectedPermissionIds(allIds);
    setHasChanges(true);
  };

  const handleDeselectAll = () => {
    setSelectedPermissionIds([]);
    setHasChanges(true);
  };

  const handleReset = () => {
    if (selectedRole) {
      setSelectedPermissionIds(selectedRole.permissionIds || []);
      setHasChanges(false);
    }
  };

  const handleSave = async () => {
    if (!selectedRoleId || !selectedRole) return;

    try {
      await updatePermissions({
        id: selectedRoleId,
        data: { permissionIds: selectedPermissionIds },
      }).unwrap();

      toast.success(
        `Permissions for role "${selectedRole.name}" updated successfully.`
      );
      setHasChanges(false);
    } catch (error: any) {
      const msg =
        error?.data?.message ||
        error?.message ||
        "Failed to update role permissions.";
      toast.error(msg);
    }
  };

  const handleDeleteRole = async () => {
    if (!selectedRoleId || !selectedRole) return;

    if (
      confirm(
        `Are you sure you want to permanently delete custom role "${selectedRole.name}"?`
      )
    ) {
      try {
        await deleteRole(selectedRoleId).unwrap();
        toast.success(`Role "${selectedRole.name}" deleted successfully.`);
        setSelectedRoleId(null);
        refetchRoles();
      } catch (error: any) {
        const msg =
          error?.data?.message || error?.message || "Failed to delete role.";
        toast.error(msg);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              Roles & Permissions (RBAC)
            </h1>
            <Badge variant="outline" className="font-semibold text-xs border-primary/30 text-primary">
              Security Matrix
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Configure system access control, staff roles, and granular permission boundaries across store entities.
          </p>
        </div>
        <Button
          onClick={() => setCreateRoleOpen(true)}
          size="sm"
          className="gap-1.5 shadow-sm"
        >
          <ShieldPlus className="size-4" />
          Create Custom Role
        </Button>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Left Column: Roles Navigation List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Configured Roles ({roles.length})
            </h2>
            <span className="text-[11px] text-muted-foreground">Rank Hierarchy</span>
          </div>

          {isLoadingRoles ? (
            <div className="flex min-h-[250px] items-center justify-center p-6 bg-card rounded-xl border">
              <Loader2 className="size-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-2">
              {roles.map((r) => {
                const isSelected = r.id === selectedRoleId;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      if (hasChanges) {
                        if (
                          !confirm(
                            "You have unsaved permission changes. Switch role without saving?"
                          )
                        ) {
                          return;
                        }
                      }
                      setSelectedRoleId(r.id);
                    }}
                    className={`w-full text-left rounded-xl border p-3.5 transition-all flex flex-col gap-2 ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/30"
                        : "border-border/70 bg-card hover:bg-muted/40 hover:border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`flex size-7 items-center justify-center rounded-lg font-bold text-xs ${
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {r.rank}
                        </span>
                        <div>
                          <p className="font-semibold text-xs leading-none text-foreground">
                            {r.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                            {r.key}
                          </p>
                        </div>
                      </div>

                      {r.isSystem ? (
                        <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-medium">
                          System
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-medium text-emerald-600 border-emerald-300">
                          Custom
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                      <span className="flex items-center gap-1">
                        <Users className="size-3" />
                        {r.userCount} {r.userCount === 1 ? "user" : "users"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Shield className="size-3" />
                        {r.permissionCount} permissions
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Permission Matrix Editor (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {!selectedRole ? (
            <Card className="min-h-[400px] flex items-center justify-center text-center p-8">
              <div className="max-w-sm space-y-2">
                <Shield className="size-10 text-muted-foreground mx-auto" />
                <h3 className="font-semibold text-base">Select a role to inspect</h3>
                <p className="text-xs text-muted-foreground">
                  Choose a role from the left sidebar to view and customize its permissions.
                </p>
              </div>
            </Card>
          ) : (
            <Card className="shadow-xs overflow-hidden border">
              {/* Role Header Info */}
              <CardHeader className="border-b bg-muted/20 pb-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-lg font-bold">
                        {selectedRole.name}
                      </CardTitle>
                      <Badge variant="outline" className="font-mono text-xs">
                        {selectedRole.key}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        Rank {selectedRole.rank}
                      </Badge>
                      {selectedRole.isSystem && (
                        <Badge variant="secondary" className="text-xs">
                          Built-in System Role
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-xs mt-1">
                      Assigned to {selectedRole.userCount} active account(s) • Currently granting{" "}
                      <span className="font-semibold text-foreground">
                        {selectedPermissionIds.length}
                      </span>{" "}
                      of {allPermissions.length} total permissions
                    </CardDescription>
                  </div>

                  {/* Top Action Buttons */}
                  <div className="flex items-center gap-2">
                    {hasChanges && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleReset}
                        disabled={isSaving}
                        className="text-xs gap-1"
                      >
                        <RotateCcw className="size-3.5" /> Reset
                      </Button>
                    )}
                    <Button
                      onClick={handleSave}
                      disabled={isSaving || !hasChanges}
                      size="sm"
                      className="gap-1.5 shadow-sm"
                    >
                      {isSaving ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Save className="size-3.5" />
                      )}
                      Save Permissions {hasChanges && "*"}
                    </Button>
                  </div>
                </div>

                {/* Quick Selection Toolbar */}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-border/50 text-xs flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={handleSelectAll}
                      className="text-[11px] h-7"
                    >
                      Grant All
                    </Button>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={handleDeselectAll}
                      className="text-[11px] h-7"
                    >
                      Revoke All
                    </Button>
                  </div>

                  {!selectedRole.isSystem && (
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={handleDeleteRole}
                      disabled={isDeleting || selectedRole.userCount > 0}
                      className="text-[11px] h-7 text-destructive hover:bg-destructive/10 gap-1"
                      title={
                        selectedRole.userCount > 0
                          ? "Reassign users before deleting role"
                          : undefined
                      }
                    >
                      <Trash2 className="size-3" /> Delete Custom Role
                    </Button>
                  )}
                </div>
              </CardHeader>

              {/* Permissions List Grouped by Module */}
              <CardContent className="p-4 sm:p-6 space-y-6">
                {isLoadingPermissions ? (
                  <div className="flex min-h-[200px] items-center justify-center">
                    <Loader2 className="size-6 animate-spin text-primary" />
                  </div>
                ) : (
                  Object.entries(permissionsGrouped).map(([moduleKey, modulePerms]) => {
                    const moduleTitle =
                      moduleFriendlyNames[moduleKey] || moduleKey.toUpperCase();
                    const moduleIds = modulePerms.map((p) => p.id);
                    const grantedCount = moduleIds.filter((id) =>
                      selectedPermissionIds.includes(id)
                    ).length;
                    const allGranted = grantedCount === modulePerms.length;
                    const someGranted = grantedCount > 0 && !allGranted;

                    return (
                      <div
                        key={moduleKey}
                        className="rounded-xl border border-border/70 overflow-hidden bg-card"
                      >
                        {/* Module Category Header */}
                        <div className="flex items-center justify-between bg-muted/40 px-4 py-2.5 border-b border-border/60">
                          <div className="flex items-center gap-2.5">
                            <Checkbox
                              checked={allGranted}
                              onCheckedChange={() =>
                                handleToggleModule(modulePerms)
                              }
                              className={
                                someGranted ? "data-[state=unchecked]:bg-primary/20" : ""
                              }
                            />
                            <div>
                              <span className="font-semibold text-xs text-foreground">
                                {moduleTitle}
                              </span>
                              <span className="text-[11px] text-muted-foreground ml-2">
                                ({grantedCount}/{modulePerms.length} granted)
                              </span>
                            </div>
                          </div>

                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => handleToggleModule(modulePerms)}
                            className="text-[10px] h-6 px-2 text-muted-foreground hover:text-foreground"
                          >
                            {allGranted ? "Deselect Group" : "Select Group"}
                          </Button>
                        </div>

                        {/* Module Permissions Checkbox Grid */}
                        <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {modulePerms.map((permission) => {
                            const isChecked = selectedPermissionIds.includes(
                              permission.id
                            );

                            return (
                              <label
                                key={permission.id}
                                className={`flex items-start gap-2.5 p-2 rounded-lg border cursor-pointer transition-colors ${
                                  isChecked
                                    ? "border-primary/40 bg-primary/5 text-foreground"
                                    : "border-border/50 bg-background hover:bg-muted/30 text-muted-foreground"
                                }`}
                              >
                                <Checkbox
                                  checked={isChecked}
                                  onCheckedChange={() =>
                                    handleTogglePermission(permission.id)
                                  }
                                  className="mt-0.5"
                                />
                                <div className="min-w-0">
                                  <p
                                    className={`text-xs font-semibold leading-tight ${
                                      isChecked
                                        ? "text-foreground"
                                        : "text-foreground/80"
                                    }`}
                                  >
                                    {permission.description || permission.action}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                                    {permission.key}
                                  </p>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Create Custom Role Dialog */}
      <RoleFormDialog
        open={createRoleOpen}
        onOpenChange={setCreateRoleOpen}
        onSuccess={(newId) => {
          setSelectedRoleId(newId);
          refetchRoles();
        }}
      />
    </div>
  );
}
