"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Tag,
  Plus,
  Search,
  Filter,
  Copy,
  Check,
  Edit2,
  Trash2,
  Calendar,
  AlertCircle,
  Percent,
  Banknote,
  RefreshCw,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useListCouponsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
} from "../couponApi";
import type { Coupon, CreateCouponInput, DiscountType } from "../coupon.types";
import { CouponDialog } from "./CouponDialog";
import { AdminPagination } from "@/components/admin/AdminPagination";

export function CouponsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  const queryParams = {
    page,
    limit,
    search: search.trim() || undefined,
    isActive:
      statusFilter === "ACTIVE"
        ? true
        : statusFilter === "INACTIVE"
        ? false
        : undefined,
    discountType:
      typeFilter === "PERCENTAGE" || typeFilter === "FIXED_AMOUNT"
        ? (typeFilter as DiscountType)
        : undefined,
  };

  const { data, isLoading, isFetching, refetch } =
    useListCouponsQuery(queryParams);

  const [createCoupon, { isLoading: isCreating }] = useCreateCouponMutation();
  const [updateCoupon, { isLoading: isUpdating }] = useUpdateCouponMutation();
  const [deleteCoupon, { isLoading: isDeleting }] = useDeleteCouponMutation();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [deletingCoupon, setDeletingCoupon] = useState<Coupon | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const coupons = data?.data ?? [];
  const meta = data?.meta;

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Copied "${code}" to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleOpenCreate = () => {
    setSelectedCoupon(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setIsDialogOpen(true);
  };

  const handleSaveCoupon = async (formData: CreateCouponInput) => {
    try {
      if (selectedCoupon) {
        await updateCoupon({ id: selectedCoupon.id, data: formData }).unwrap();
        toast.success("Coupon updated successfully");
      } else {
        await createCoupon(formData).unwrap();
        toast.success("Coupon created successfully");
        setPage(1);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to save coupon");
      throw err;
    }
  };

  const handleToggleStatus = async (coupon: Coupon) => {
    try {
      await updateCoupon({
        id: coupon.id,
        data: { isActive: !coupon.isActive },
      }).unwrap();
      toast.success(
        `Coupon ${coupon.isActive ? "deactivated" : "activated"} successfully`
      );
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to change coupon status");
    }
  };

  const handleDelete = async () => {
    if (!deletingCoupon) return;
    try {
      await deleteCoupon(deletingCoupon.id).unwrap();
      toast.success("Coupon deleted successfully");
      setDeletingCoupon(null);
    } catch (err: any) {
      toast.error(
        err?.data?.message ||
          "Failed to delete coupon. If used, consider deactivating it."
      );
    }
  };

  // Stats calculation
  const totalCoupons = meta?.total ?? coupons.length;
  const activeCount = coupons.filter((c) => c.isActive).length;
  const percentageCount = coupons.filter(
    (c) => c.discountType === "PERCENTAGE"
  ).length;
  const fixedCount = coupons.filter(
    (c) => c.discountType === "FIXED_AMOUNT"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Coupons & Discounts</h1>
          <p className="text-sm text-muted-foreground">
            Create promotional codes, set discount values, and configure usage limits.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2 shrink-0">
          <Plus className="size-4" />
          Create Coupon
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="shadow-none">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Tag className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Coupons</p>
              <p className="text-xl font-bold">{totalCoupons}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
              <Check className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Active (Loaded)</p>
              <p className="text-xl font-bold">{activeCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600">
              <Percent className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Percentage Type</p>
              <p className="text-xl font-bold">{percentageCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
              <Banknote className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Fixed Amount</p>
              <p className="text-xl font-bold">{fixedCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-3">
        <div className="flex flex-1 flex-wrap items-center gap-2 min-w-[280px]">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by code or name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 h-9"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="size-3.5 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="h-9 rounded-md border border-input bg-background px-3 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive Only</option>
            </select>
          </div>

          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="ALL">All Types</option>
            <option value="PERCENTAGE">Percentage (%)</option>
            <option value="FIXED_AMOUNT">Fixed Amount (৳)</option>
          </select>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="gap-1.5 h-9"
        >
          <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Coupons Grid / List */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-2xl border bg-muted/40"
            />
          ))}
        </div>
      ) : coupons.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center">
          <div className="rounded-full bg-muted p-4">
            <Tag className="size-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-base font-semibold">No coupons found</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {search || statusFilter !== "ALL" || typeFilter !== "ALL"
              ? "No coupons match your filter criteria. Try adjusting your filters."
              : "Get started by creating your first promotional coupon discount."}
          </p>
          <Button onClick={handleOpenCreate} className="mt-6 gap-2">
            <Plus className="size-4" />
            Create Coupon
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {coupons.map((coupon) => {
            const isPercentage = coupon.discountType === "PERCENTAGE";
            const isExpired =
              coupon.expiresAt && new Date(coupon.expiresAt) < new Date();
            const isScheduled =
              coupon.startsAt && new Date(coupon.startsAt) > new Date();

            return (
              <Card
                key={coupon.id}
                className="overflow-hidden border bg-card shadow-none transition-all hover:border-primary/40"
              >
                <div className="flex items-center justify-between border-b px-4 py-3 bg-muted/20">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                      {coupon.code}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(coupon.code)}
                      className="text-muted-foreground hover:text-foreground transition-colors p-1"
                      title="Copy Code"
                    >
                      {copiedCode === coupon.code ? (
                        <Check className="size-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isExpired ? (
                      <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                        Expired
                      </Badge>
                    ) : isScheduled ? (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        Scheduled
                      </Badge>
                    ) : coupon.isActive ? (
                      <Badge variant="default" className="bg-emerald-600 text-[10px] px-1.5 py-0">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        Inactive
                      </Badge>
                    )}
                  </div>
                </div>

                <CardContent className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-sm line-clamp-1">
                      {coupon.name}
                    </h3>
                    {coupon.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {coupon.description}
                      </p>
                    )}
                  </div>

                  {/* Value badge */}
                  <div className="rounded-lg bg-primary/5 border border-primary/10 p-2.5 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-medium">
                      Discount
                    </span>
                    <span className="font-bold text-sm text-primary">
                      {isPercentage
                        ? `${coupon.discountValue}% OFF`
                        : `৳${coupon.discountValue} OFF`}
                    </span>
                  </div>

                  {/* Detailed Specs */}
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Min Order:</span>
                      <span className="font-medium text-foreground">
                        {coupon.minimumOrderAmount
                          ? `৳${coupon.minimumOrderAmount}`
                          : "None"}
                      </span>
                    </div>

                    {isPercentage && coupon.maximumDiscountAmount && (
                      <div className="flex justify-between">
                        <span>Max Cap:</span>
                        <span className="font-medium text-foreground">
                          ৳{coupon.maximumDiscountAmount}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span>Usage Limit:</span>
                      <span className="font-medium text-foreground">
                        {coupon.usageLimit
                          ? `${coupon.usageLimit} total`
                          : "Unlimited"}
                        {coupon.usageLimitPerUser &&
                          ` (${coupon.usageLimitPerUser}/user)`}
                      </span>
                    </div>

                    {coupon.expiresAt && (
                      <div className="flex justify-between items-center pt-1 border-t">
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" /> Expires:
                        </span>
                        <span className="font-medium text-foreground">
                          {new Date(coupon.expiresAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between border-t pt-3 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs flex-1 gap-1"
                      onClick={() => handleOpenEdit(coupon)}
                    >
                      <Edit2 className="size-3" />
                      Edit
                    </Button>

                    <Button
                      size="sm"
                      variant={coupon.isActive ? "ghost" : "secondary"}
                      className="h-8 text-xs flex-1"
                      onClick={() => handleToggleStatus(coupon)}
                    >
                      {coupon.isActive ? "Deactivate" : "Activate"}
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2 text-destructive hover:bg-destructive/10"
                      onClick={() => setDeletingCoupon(coupon)}
                      title="Delete Coupon"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {meta && (
        <AdminPagination
          page={page}
          limit={limit}
          total={meta.total}
          totalPages={meta.totalPages}
          onPageChange={setPage}
          onLimitChange={setLimit}
          pageSizeOptions={[6, 12, 24, 48]}
          disabled={isFetching}
          className="rounded-xl border"
        />
      )}

      {/* Create / Edit Dialog */}
      <CouponDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        coupon={selectedCoupon}
        onSave={handleSaveCoupon}
        isLoading={isCreating || isUpdating}
      />

      {/* Delete Confirmation Alert */}
      <AlertDialog
        open={!!deletingCoupon}
        onOpenChange={(open) => !open && setDeletingCoupon(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Coupon?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete coupon{" "}
              <strong className="text-foreground">
                "{deletingCoupon?.code}"
              </strong>
              ? This action cannot be undone. If this coupon has already been used
              in completed orders, consider deactivating it instead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete Coupon"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
