"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import {
  Tags,
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  LayoutGrid,
  List,
  Upload,
  CheckCircle2,
  AlertCircle,
  ArrowUpDown,
  Sparkles,
  LoaderCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { Brand, BrandInput } from "@/modules/brand/types";
import {
  useListBrandsQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useUpdateBrandStatusMutation,
  useDeleteBrandMutation,
  useUploadBrandLogoMutation,
} from "@/modules/brand/brandApi";

import {
  CatalogHeader,
  StatusBadge,
  LoadingPanel,
  ErrorPanel,
  EmptyPanel,
  ActionNotice,
  useCatalogAction,
  DeleteDialog,
} from "./CatalogShared";
import { CatalogMedia } from "./CatalogMedia";
import { mediaUrl } from "../catalog.utils";
import { cn } from "@/lib/utils";

export function BrandsPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "ACTIVE" | "INACTIVE">("");
  const [sortBy, setSortBy] = useState<"sortOrder" | "name" | "createdAt">("sortOrder");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Dialogs
  const [formDialog, setFormDialog] = useState<{ brand?: Brand } | null>(null);
  const [deleting, setDeleting] = useState<Brand | null>(null);
  const [logoModalBrand, setLogoModalBrand] = useState<Brand | null>(null);

  // Queries
  const query = useListBrandsQuery({
    page,
    limit,
    search: search.trim() || undefined,
    status: statusFilter || undefined,
    sortBy,
    sortOrder,
  });

  // Fetch for taxonomy metrics strip
  const statsQuery = useListBrandsQuery({ page: 1, limit: 100 });

  // Mutations
  const [create] = useCreateBrandMutation();
  const [update] = useUpdateBrandMutation();
  const [updateStatus] = useUpdateBrandStatusMutation();
  const [remove] = useDeleteBrandMutation();
  const [upload] = useUploadBrandLogoMutation();
  const action = useCatalogAction();

  // Metric stats
  const metrics = useMemo(() => {
    const list = statsQuery.data?.data ?? [];
    const total = statsQuery.data?.meta.total ?? query.data?.meta.total ?? 0;
    const active = list.filter((b) => b.isActive).length;
    const inactive = Math.max(0, total - active);
    const withLogo = list.filter((b) => Boolean(b.logo)).length;

    return { total, active, inactive, withLogo };
  }, [statsQuery.data, query.data]);

  // Handle direct status toggle
  const handleToggleStatus = async (brand: Brand) => {
    await action.run(
      () => updateStatus({ id: brand.id, isActive: !brand.isActive }).unwrap(),
      `"${brand.name}" status updated.`
    );
  };

  return (
    <div className="space-y-6">
      {/* ── Catalog Header & Navigation ── */}
      <CatalogHeader
        active="brands"
        title="Brands & Manufacturers"
        description="Manage the brands customers can browse and filter products by. Add logos, display orders, and manage storefront visibility."
        action={
          <Button
            size="sm"
            onClick={() => setFormDialog({})}
            className="gap-1.5 h-9 bg-primary font-semibold shadow-xs text-xs"
          >
            <Plus className="size-3.5" />
            New Brand
          </Button>
        }
      />

      {/* ── Taxonomy Metrics Strip ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border shadow-none">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Tags className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Brands</p>
              <p className="text-xl font-bold text-foreground">{metrics.total}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-none">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Active Brands</p>
              <p className="text-xl font-bold text-foreground">{metrics.active}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-none">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
              <AlertCircle className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Inactive Brands</p>
              <p className="text-xl font-bold text-foreground">{metrics.inactive}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-none">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600">
              <Sparkles className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">With Logo</p>
              <p className="text-xl font-bold text-foreground">{metrics.withLogo}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <ActionNotice action={action} />

      {/* ── Filter & Search Control Toolbar ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border bg-card p-3.5 shadow-none">
        {/* Left: Search input & Status Filter pills */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative min-w-[220px] max-w-sm flex-1">
            <Search className="size-3.5 absolute left-3 top-2.5 text-muted-foreground" />
            <Input
              aria-label="Search brands"
              placeholder="Search by brand name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-8 text-xs h-8 bg-background"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
                className="absolute right-2.5 top-2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Status filter segmented buttons */}
          <div className="flex items-center gap-1 p-0.5 bg-muted/60 rounded-lg border text-xs">
            <button
              type="button"
              onClick={() => {
                setStatusFilter("");
                setPage(1);
              }}
              className={cn(
                "px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer",
                statusFilter === ""
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter("ACTIVE");
                setPage(1);
              }}
              className={cn(
                "px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1",
                statusFilter === "ACTIVE"
                  ? "bg-background text-emerald-600 shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Active
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter("INACTIVE");
                setPage(1);
              }}
              className={cn(
                "px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1",
                statusFilter === "INACTIVE"
                  ? "bg-background text-amber-600 shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="size-1.5 rounded-full bg-amber-500" />
              Inactive
            </button>
          </div>
        </div>

        {/* Right: Sort controls & Grid/Table Switcher */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Sort dropdown */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground border rounded-lg px-2 py-1 bg-background">
            <ArrowUpDown className="size-3 text-muted-foreground" />
            <select
              aria-label="Sort brands"
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split("-") as [typeof sortBy, typeof sortOrder];
                setSortBy(sb);
                setSortOrder(so);
                setPage(1);
              }}
              className="bg-transparent text-xs text-foreground outline-none cursor-pointer pr-1"
            >
              <option value="sortOrder-asc">Sort order (Asc)</option>
              <option value="sortOrder-desc">Sort order (Desc)</option>
              <option value="name-asc">Name (A → Z)</option>
              <option value="name-desc">Name (Z → A)</option>
              <option value="createdAt-desc">Newest first</option>
            </select>
          </div>

          {/* View mode toggle buttons */}
          <div className="flex items-center gap-0.5 bg-muted/60 p-0.5 rounded-lg border">
            <button
              type="button"
              title="Grid view"
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-1.5 rounded-md transition-colors cursor-pointer",
                viewMode === "grid"
                  ? "bg-background text-primary shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutGrid className="size-3.5" />
            </button>
            <button
              type="button"
              title="Table view"
              onClick={() => setViewMode("table")}
              className={cn(
                "p-1.5 rounded-md transition-colors cursor-pointer",
                viewMode === "table"
                  ? "bg-background text-primary shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <List className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Brands Content Area ── */}
      {query.isLoading ? (
        <LoadingPanel />
      ) : query.isError ? (
        <ErrorPanel error={query.error} retry={query.refetch} />
      ) : !query.data?.data.length ? (
        <EmptyPanel
          title="No brands found"
          description={
            search || statusFilter
              ? "No brands match your current search and filters. Try clearing your search term or changing status."
              : "Create your first brand so products can be cataloged under recognizable manufacturer names."
          }
          action={
            search || statusFilter ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("");
                  setPage(1);
                }}
              >
                Clear Filters
              </Button>
            ) : (
              <Button size="sm" onClick={() => setFormDialog({})} className="gap-1.5">
                <Plus className="size-3.5" />
                New Brand
              </Button>
            )
          }
        />
      ) : viewMode === "grid" ? (
        /* ── Grid View ── */
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {query.data.data.map((brand) => (
            <Card
              key={brand.id}
              className="border shadow-none hover:border-primary/40 transition-all flex flex-col justify-between overflow-hidden group bg-card"
            >
              <CardContent className="p-4 space-y-3.5">
                {/* Brand Header: Logo & Status Toggle */}
                <div className="flex items-start justify-between gap-3">
                  {/* Brand Logo Avatar */}
                  <div
                    onClick={() => setLogoModalBrand(brand)}
                    className="relative size-14 rounded-xl border bg-muted/20 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer group-hover:border-primary/40 transition-colors"
                    title="Click to view or replace logo"
                  >
                    {brand.logo ? (
                      <Image
                        unoptimized
                        src={mediaUrl(brand.logo)}
                        alt={brand.name}
                        fill
                        sizes="56px"
                        className="object-contain p-1.5"
                      />
                    ) : (
                      <div className="size-full flex items-center justify-center font-bold text-sm bg-gradient-to-br from-primary/10 to-primary/20 text-primary uppercase">
                        {brand.name.slice(0, 2)}
                      </div>
                    )}
                  </div>

                  {/* Status Toggle Switch */}
                  <div className="flex flex-col items-end gap-1">
                    <Switch
                      checked={brand.isActive}
                      onCheckedChange={() => void handleToggleStatus(brand)}
                      aria-label={`Toggle active status for ${brand.name}`}
                    />
                    <StatusBadge active={brand.isActive} />
                  </div>
                </div>

                {/* Name & Slug */}
                <div>
                  <h3 className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                    {brand.name}
                  </h3>
                  <p className="text-[11px] text-muted-foreground font-mono truncate mt-0.5">
                    /{brand.slug}
                  </p>
                </div>

                {/* Description */}
                <p className="text-xs text-muted-foreground line-clamp-2 min-h-[32px] leading-relaxed">
                  {brand.description || "No description provided."}
                </p>

                {/* Info badge */}
                <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t pt-2.5">
                  <span className="font-medium bg-muted/60 px-2 py-0.5 rounded text-[10px]">
                    Order #{brand.sortOrder}
                  </span>
                  <button
                    type="button"
                    onClick={() => setLogoModalBrand(brand)}
                    className="text-[11px] font-medium text-primary hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Upload className="size-2.5" />
                    {brand.logo ? "Change Logo" : "Add Logo"}
                  </button>
                </div>
              </CardContent>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between border-t bg-muted/10 px-3 py-2 text-xs">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setFormDialog({ brand })}
                  className="h-7 text-xs px-2 gap-1"
                >
                  <Pencil className="size-3" />
                  Edit
                </Button>

                <Button
                  size="icon-sm"
                  variant="ghost"
                  aria-label={`Delete ${brand.name}`}
                  onClick={() => setDeleting(brand)}
                  className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* ── Table View ── */
        <div className="rounded-2xl border bg-card shadow-none overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-[80px]">Logo</TableHead>
                <TableHead className="min-w-[180px]">Brand Name</TableHead>
                <TableHead className="hidden md:table-cell">Description</TableHead>
                <TableHead className="w-[100px] text-center">Order</TableHead>
                <TableHead className="w-[140px] text-center">Status</TableHead>
                <TableHead className="w-[120px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.data.data.map((brand) => (
                <TableRow key={brand.id} className="hover:bg-muted/20">
                  {/* Logo thumbnail */}
                  <TableCell>
                    <div
                      onClick={() => setLogoModalBrand(brand)}
                      className="relative size-10 rounded-lg border bg-muted/30 flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
                      title="Click to view or replace logo"
                    >
                      {brand.logo ? (
                        <Image
                          unoptimized
                          src={mediaUrl(brand.logo)}
                          alt={brand.name}
                          fill
                          sizes="40px"
                          className="object-contain p-1"
                        />
                      ) : (
                        <span className="font-bold text-xs text-primary uppercase">
                          {brand.name.slice(0, 2)}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Brand name and slug */}
                  <TableCell>
                    <div className="min-w-0">
                      <span className="font-semibold text-xs text-foreground block truncate">
                        {brand.name}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-mono block truncate">
                        /{brand.slug}
                      </span>
                    </div>
                  </TableCell>

                  {/* Description */}
                  <TableCell className="hidden md:table-cell">
                    <p className="text-xs text-muted-foreground line-clamp-1 max-w-sm">
                      {brand.description || "—"}
                    </p>
                  </TableCell>

                  {/* Sort Order */}
                  <TableCell className="text-center">
                    <span className="rounded bg-muted px-2 py-0.5 text-xs font-mono font-medium">
                      {brand.sortOrder}
                    </span>
                  </TableCell>

                  {/* Status Toggle Switch + Badge */}
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Switch
                        checked={brand.isActive}
                        onCheckedChange={() => void handleToggleStatus(brand)}
                        aria-label={`Toggle status for ${brand.name}`}
                      />
                      <StatusBadge active={brand.isActive} />
                    </div>
                  </TableCell>

                  {/* Action Buttons */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        title="Upload Logo"
                        onClick={() => setLogoModalBrand(brand)}
                        className="size-7 text-muted-foreground hover:text-foreground"
                      >
                        <Upload className="size-3.5" />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        title="Edit Brand"
                        onClick={() => setFormDialog({ brand })}
                        className="size-7 text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        aria-label={`Delete ${brand.name}`}
                        onClick={() => setDeleting(brand)}
                        className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* ── Pagination Bar ── */}
      {query.data && query.data.meta.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t pt-4 text-xs text-muted-foreground">
          <p>
            Showing {(page - 1) * limit + 1} to{" "}
            {Math.min(page * limit, query.data.meta.total)} of {query.data.meta.total} brands
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1 || query.isFetching}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-8 gap-1 text-xs"
            >
              <ChevronLeft className="size-3.5" />
              Previous
            </Button>
            <span className="font-semibold text-foreground px-2">
              {page} / {query.data.meta.totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= query.data.meta.totalPages || query.isFetching}
              onClick={() => setPage((p) => p + 1)}
              className="h-8 gap-1 text-xs"
            >
              Next
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* ── Dedicated Brand Create / Edit Dialog ── */}
      {formDialog && (
        <BrandFormDialog
          brand={formDialog.brand}
          onClose={() => setFormDialog(null)}
          onSave={async (fields) => {
            if (formDialog.brand) {
              await update({ id: formDialog.brand.id, body: fields }).unwrap();
            } else {
              await create(fields).unwrap();
              setPage(1);
            }
          }}
          onUploadLogo={
            formDialog.brand
              ? (file) => upload({ id: formDialog.brand!.id, file }).unwrap()
              : undefined
          }
        />
      )}

      {/* ── Quick Logo Upload / Crop Modal ── */}
      {logoModalBrand && (
        <Dialog open onOpenChange={(open) => !open && setLogoModalBrand(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base">
                <Sparkles className="size-4 text-primary" />
                Brand Logo: {logoModalBrand.name}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Upload a square PNG, JPG, or WebP logo. You can crop and reposition it for optimum storefront display.
              </DialogDescription>
            </DialogHeader>

            <div className="py-2">
              <CatalogMedia
                kind="brand"
                name={logoModalBrand.name}
                url={
                  (query.data?.data.find((b) => b.id === logoModalBrand.id) ?? logoModalBrand).logo
                }
                onUpload={async (file) => {
                  await upload({ id: logoModalBrand.id, file }).unwrap();
                }}
              />
            </div>

            <DialogFooter>
              <Button size="sm" variant="outline" onClick={() => setLogoModalBrand(null)}>
                Done
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ── Delete Confirmation Dialog ── */}
      {deleting && (
        <DeleteDialog
          name={deleting.name}
          explanation="A brand referenced by products cannot be permanently deleted. If products already use this brand, deactivate it instead to hide it from storefront filters."
          onClose={() => setDeleting(null)}
          onDelete={async () => {
            await remove(deleting.id).unwrap();
            if (query.data?.data.length === 1 && page > 1) {
              setPage((p) => p - 1);
            }
          }}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Brand Form Dialog (Create & Edit)
// ─────────────────────────────────────────────────────────────────────────────
interface BrandFormDialogProps {
  brand?: Brand;
  onClose: () => void;
  onSave: (fields: BrandInput) => Promise<void>;
  onUploadLogo?: (file: File) => Promise<unknown>;
}

function BrandFormDialog({ brand, onClose, onSave, onUploadLogo }: BrandFormDialogProps) {
  const [name, setName] = useState(brand?.name ?? "");
  const [description, setDescription] = useState(brand?.description ?? "");
  const [sortOrder, setSortOrder] = useState<number>(brand?.sortOrder ?? 0);
  const action = useCatalogAction();

  const isEditing = Boolean(brand);

  const slugPreview = useMemo(() => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }, [name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const saved = await action.run(async () => {
      await onSave({
        name: name.trim(),
        description: description.trim() || null,
        sortOrder: Number(sortOrder) || 0,
      });
    }, isEditing ? "Brand updated successfully." : "Brand created successfully.");

    if (saved) onClose();
  };

  return (
    <Dialog open onOpenChange={(open) => !open && !action.busy && onClose()}>
      <DialogContent className="max-w-lg" showCloseButton={!action.busy}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tags className="size-4 text-primary" />
              {isEditing ? `Edit Brand: ${brand?.name}` : "Create New Brand"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {isEditing
                ? "Update brand details, display order, or upload an updated logo."
                : "Add a recognizable manufacturer or brand name to catalog products under."}
            </DialogDescription>
          </DialogHeader>

          <ActionNotice action={action} />

          <div className="space-y-3.5">
            {/* Brand Name Input */}
            <div className="space-y-1.5">
              <label htmlFor="brand-name" className="text-xs font-semibold text-foreground">
                Brand Name <span className="text-destructive">*</span>
              </label>
              <Input
                id="brand-name"
                required
                autoFocus
                placeholder="e.g. Nike, Apple, Samsung"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-xs h-9 bg-background"
              />
              {name && (
                <p className="text-[11px] text-muted-foreground font-mono">
                  Storefront URL: <span className="text-primary font-semibold">/brands/{slugPreview}</span>
                </p>
              )}
            </div>

            {/* Description Textarea */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="brand-description" className="text-xs font-semibold text-foreground">
                  Description <span className="text-muted-foreground font-normal">(Optional)</span>
                </label>
                <span className="text-[10px] text-muted-foreground">
                  {description.length}/1000
                </span>
              </div>
              <Textarea
                id="brand-description"
                maxLength={1000}
                rows={3}
                placeholder="Brief summary or story of this brand..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="text-xs bg-background resize-none"
              />
            </div>

            {/* Display Order */}
            <div className="space-y-1.5">
              <label htmlFor="brand-order" className="text-xs font-semibold text-foreground">
                Display Order
              </label>
              <Input
                id="brand-order"
                type="number"
                min={0}
                step={1}
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="text-xs h-9 bg-background max-w-[140px]"
              />
              <p className="text-[11px] text-muted-foreground">
                Lower numbers appear first on storefront brand carousels and filters.
              </p>
            </div>

            {/* Logo Section */}
            {isEditing && onUploadLogo && brand && (
              <div className="pt-2 border-t">
                <CatalogMedia
                  kind="brand"
                  name={brand.name}
                  url={brand.logo}
                  onUpload={onUploadLogo}
                />
              </div>
            )}

            {!isEditing && (
              <div className="rounded-xl border border-dashed bg-muted/20 p-3 text-xs text-muted-foreground flex items-center gap-2.5">
                <Sparkles className="size-4 text-primary shrink-0" />
                <span>
                  You can upload and crop the brand logo immediately after saving, directly from its card.
                </span>
              </div>
            )}
          </div>

          <DialogFooter className="border-t pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={action.busy}
              onClick={onClose}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={action.busy || !name.trim()}
              className="text-xs bg-primary font-semibold gap-1.5"
            >
              {action.busy && <LoaderCircle className="size-3.5 animate-spin" />}
              {action.busy ? "Saving..." : isEditing ? "Save Changes" : "Create Brand"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
