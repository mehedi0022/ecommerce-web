"use client";

import React, { useState } from "react";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Shield,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Edit,
  Loader2,
  RefreshCw,
  MoreVertical,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  useGetUsersQuery,
  useChangeUserStatusMutation,
} from "../../userApi";
import { useGetRolesQuery } from "@/modules/role/roleApi";
import { StaffFormDialog } from "./StaffFormDialog";
import { ResetPasswordDialog } from "./ResetPasswordDialog";
import type { UserItem } from "../../types";

const roleBadgeColor: Record<string, string> = {
  SUPER_ADMIN: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
  ADMIN: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800",
  MANAGER: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  MODERATOR: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
  EDITOR: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  AUTHOR: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  SELLER: "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800",
};

export function AdminStaffManagement() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);

  const { data: rolesData } = useGetRolesQuery();
  const roles = rolesData?.data || [];

  const { data, isLoading, isFetching, refetch } = useGetUsersQuery({
    page,
    limit: 20,
    search: search.trim() || undefined,
    roleId: roleFilter !== "ALL" ? Number(roleFilter) : undefined,
    status:
      statusFilter === "ACTIVE" || statusFilter === "INACTIVE"
        ? (statusFilter as "ACTIVE" | "INACTIVE")
        : undefined,
  });

  const [changeStatus, { isLoading: isTogglingStatus }] =
    useChangeUserStatusMutation();

  const [formOpen, setFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordTargetUser, setPasswordTargetUser] = useState<UserItem | null>(
    null
  );

  const users = data?.data || [];
  const meta = data?.meta;

  // Stats calculation
  const totalStaff = meta?.total ?? users.length;
  const activeStaff = users.filter((u) => u.isActive).length;
  const inactiveStaff = users.filter((u) => !u.isActive).length;

  const handleCreate = () => {
    setSelectedUser(null);
    setFormOpen(true);
  };

  const handleEdit = (user: UserItem) => {
    setSelectedUser(user);
    setFormOpen(true);
  };

  const handleOpenPasswordReset = (user: UserItem) => {
    setPasswordTargetUser(user);
    setPasswordDialogOpen(true);
  };

  const handleToggleStatus = async (user: UserItem) => {
    try {
      await changeStatus({
        id: user.id,
        data: { isActive: !user.isActive },
      }).unwrap();
      toast.success(
        `Account for "${user.fullName || user.email}" ${
          !user.isActive ? "activated" : "deactivated"
        }.`
      );
    } catch (error: any) {
      const msg =
        error?.data?.message ||
        error?.message ||
        "Failed to update user status.";
      toast.error(msg);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  const getInitials = (name?: string | null, email?: string) => {
    if (name) {
      const parts = name.trim().split(" ");
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      return name.slice(0, 2).toUpperCase();
    }
    return email ? email.slice(0, 2).toUpperCase() : "U";
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Staff & Team Members</h1>
            <Badge variant="secondary" className="font-semibold text-xs">
              RBAC Enabled
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage administrative personnel, assign roles, and control access permissions across your store.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-1.5 text-xs"
          >
            <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={handleCreate} size="sm" className="gap-1.5 shadow-sm">
            <UserPlus className="size-4" />
            Add Staff Member
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="shadow-xs">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium">Total Staff</CardDescription>
            <CardTitle className="text-2xl font-bold">{totalStaff}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[11px] text-muted-foreground">Admin & store operators</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              Active Accounts
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {activeStaff}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[11px] text-muted-foreground">Can sign in to admin console</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium text-muted-foreground">
              Inactive / Suspended
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-muted-foreground">
              {inactiveStaff}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[11px] text-muted-foreground">Sessions revoked</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium text-primary">
              System Roles
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-primary">
              {roles.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[11px] text-muted-foreground">Custom & predefined roles</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search Toolbar */}
      <Card className="shadow-xs">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or username..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 h-9 text-xs"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">Role:</span>
                <Select
                  value={roleFilter}
                  onValueChange={(val) => {
                    setRoleFilter(val ?? "ALL");
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-9 w-[150px] text-xs">
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Roles</SelectItem>
                    {roles.map((r) => (
                      <SelectItem key={r.id} value={String(r.id)}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">Status:</span>
                <Select
                  value={statusFilter}
                  onValueChange={(val) => {
                    setStatusFilter(val ?? "ALL");
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-9 w-[130px] text-xs">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Staff Table */}
      <Card className="shadow-xs overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-2">
              <Loader2 className="size-7 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground">Loading staff members...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center p-8 text-center">
              <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <Users className="size-6 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-base">No staff members found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4">
                {search || roleFilter !== "ALL" || statusFilter !== "ALL"
                  ? "Try clearing your filters or search query to find staff accounts."
                  : "Get started by adding your first administrative or support staff member."}
              </p>
              <Button onClick={handleCreate} size="sm" className="gap-1.5">
                <UserPlus className="size-4" /> Add Staff Member
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b bg-muted/40 font-semibold text-muted-foreground">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Assigned Role</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4 hidden md:table-cell">Joined Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {users.map((user) => {
                    const badgeClass =
                      roleBadgeColor[user.role?.key] ||
                      "bg-muted text-muted-foreground border-border";

                    return (
                      <tr
                        key={user.id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        {/* User Details */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="size-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs shrink-0 ring-1 ring-primary/20">
                              {getInitials(user.fullName, user.email)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-foreground truncate">
                                {user.fullName || "Unnamed User"}
                              </p>
                              <p className="text-[11px] text-muted-foreground truncate">
                                {user.email}
                              </p>
                              {user.userName && (
                                <p className="text-[10px] text-muted-foreground/80 font-mono">
                                  @{user.userName}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Assigned Role */}
                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-1 items-start">
                            <span
                              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold border ${badgeClass}`}
                            >
                              <ShieldCheck className="size-3 shrink-0" />
                              {user.role?.name || user.role?.key || "Standard User"}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              Rank {user.role?.rank ?? 1}
                            </span>
                          </div>
                        </td>

                        {/* Status + Toggle */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <Switch
                              checked={user.isActive}
                              disabled={isTogglingStatus}
                              onCheckedChange={() => handleToggleStatus(user)}
                              title={user.isActive ? "Deactivate Account" : "Activate Account"}
                            />
                            {user.isActive ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="size-3.5" /> Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                                <XCircle className="size-3.5" /> Inactive
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Joined Date */}
                        <td className="py-3 px-4 text-muted-foreground hidden md:table-cell">
                          {formatDate(user.createdAt)}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              aria-label="Staff actions"
                              className="inline-flex size-8 items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            >
                              <MoreVertical className="size-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44 text-xs">
                              <DropdownMenuLabel>Staff Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleEdit(user)}
                                className="gap-2 cursor-pointer"
                              >
                                <Edit className="size-3.5 text-blue-500" />
                                Edit Info & Role
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleOpenPasswordReset(user)}
                                className="gap-2 cursor-pointer"
                              >
                                <KeyRound className="size-3.5 text-amber-500" />
                                Reset Password
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleToggleStatus(user)}
                                className={`gap-2 cursor-pointer ${
                                  user.isActive ? "text-destructive" : "text-emerald-600"
                                }`}
                              >
                                {user.isActive ? (
                                  <>
                                    <ShieldAlert className="size-3.5" /> Deactivate Account
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="size-3.5" /> Activate Account
                                  </>
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Staff Form Modal Dialog */}
      <StaffFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        user={selectedUser}
        onSuccess={() => refetch()}
      />

      {/* Password Reset Modal Dialog */}
      <ResetPasswordDialog
        open={passwordDialogOpen}
        onOpenChange={setPasswordDialogOpen}
        user={passwordTargetUser}
      />
    </div>
  );
}
