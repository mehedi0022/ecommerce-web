"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Search,
  X,
  Star,
  Layers,
  Package,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShoppingBag,
  Barcode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useListProductsQuery,
  useDeleteProductMutation,
  useUpdateProductStatusMutation,
  useUpdateProductMutation,
} from "@/modules/product/productApi";
import { useEditorOptionsQuery } from "@/modules/product/editorApi";
import { mediaUrl } from "@/modules/catalog/catalog.utils";
import type { Product, ProductStatus } from "@/modules/product/types";
import {
  ActionNotice,
  DeleteDialog,
  useCatalogAction,
} from "@/modules/catalog/components/CatalogShared";
import { ProductBarcodePrintModal } from "@/modules/product/components/admin/ProductBarcodePrintModal";

// ─── Price Helper ─────────────────────────────────────────────────────────────
function formatPriceRange(product: Product): string {
  if (!product.variants || product.variants.length === 0) {
    return "No price set";
  }

  const prices = product.variants
    .map((v) => Number(v.price))
    .filter((p) => !isNaN(p) && p > 0);

  if (prices.length === 0) return "No price set";

  const min = Math.min(...prices);
  const max = Math.max(...prices);

  if (min === max) {
    return `৳${min.toLocaleString()}`;
  }

  return `৳${min.toLocaleString()} - ৳${max.toLocaleString()}`;
}

// ─── Product Image Thumbnail ──────────────────────────────────────────────────
function ProductThumbnail({ product }: { product: Product }) {
  const [hasError, setHasError] = useState(false);
  const primaryImg =
    product.images?.find((img) => img.isPrimary) || product.images?.[0];
  const src = primaryImg?.imageUrl && !hasError ? mediaUrl(primaryImg.imageUrl) : null;

  return (
    <div className="relative size-12 shrink-0 rounded-xl overflow-hidden border border-border/80 bg-muted/40 flex items-center justify-center">
      {src ? (
        <Image
          src={src}
          alt={product.name}
          fill
          unoptimized
          sizes="48px"
          onError={() => setHasError(true)}
          className="object-cover"
        />
      ) : (
        <Package className="size-5 text-muted-foreground/40" />
      )}
    </div>
  );
}

// ─── Status Badge Component ───────────────────────────────────────────────────
function StatusPill({ status }: { status: ProductStatus }) {
  switch (status) {
    case "ACTIVE":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          Active
        </span>
      );
    case "DRAFT":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-400 border border-amber-500/20">
          <span className="size-1.5 rounded-full bg-amber-500" />
          Draft
        </span>
      );
    case "INACTIVE":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-500/10 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:text-slate-400 border border-slate-500/20">
          <span className="size-1.5 rounded-full bg-slate-400" />
          Inactive
        </span>
      );
    case "ARCHIVED":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-700 dark:text-rose-400 border border-rose-500/20">
          <span className="size-1.5 rounded-full bg-rose-500" />
          Archived
        </span>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

// ─── Main Products List Page ──────────────────────────────────────────────────
export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ProductStatus | "">("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [featuredFilter, setFeaturedFilter] = useState<boolean | undefined>(undefined);

  const query = useListProductsQuery({
    page,
    limit: 20,
    search: search.trim() || undefined,
    status: status || undefined,
    categoryId: category ? Number(category) : undefined,
    brandId: brand ? Number(brand) : undefined,
    isFeatured: featuredFilter,
  });

  const options = useEditorOptionsQuery();
  const [remove] = useDeleteProductMutation();
  const [updateStatus] = useUpdateProductStatusMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleting, setDeleting] = useState<Product>();
  const [barcodeModalProduct, setBarcodeModalProduct] = useState<Product | null>(null);
  const action = useCatalogAction();

  const products = query.data?.data || [];
  const meta = query.data?.meta || { total: 0, totalPages: 1, page: 1, limit: 20 };

  const hasActiveFilters = Boolean(
    search.trim() || status || category || brand || featuredFilter !== undefined
  );

  const handleClearFilters = () => {
    setSearch("");
    setStatus("");
    setCategory("");
    setBrand("");
    setFeaturedFilter(undefined);
    setPage(1);
  };

  // Toggle Featured status directly from table
  const handleToggleFeatured = async (product: Product) => {
    try {
      const newFeatured = !product.isFeatured;
      await action.run(
        () =>
          updateProduct({
            id: product.id,
            body: { isFeatured: newFeatured },
          }).unwrap(),
        newFeatured
          ? `Marked "${product.name}" as Featured on storefront.`
          : `Removed "${product.name}" from Featured collection.`
      );
    } catch {
      // Handled by catalog action
    }
  };

  // Quick Status Toggle (Active / Inactive)
  const handleToggleStatus = async (product: Product) => {
    const nextStatus: ProductStatus =
      product.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await action.run(
        () => updateStatus({ id: product.id, status: nextStatus }).unwrap(),
        nextStatus === "ACTIVE"
          ? `"${product.name}" is now Active and visible to shoppers.`
          : `"${product.name}" is now Inactive and hidden from storefront.`
      );
    } catch {
      // Handled by catalog action
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ───────────────────────────────────────────────── */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
            <span>Catalog Management</span>
            <span>•</span>
            <span>{meta.total} Total Items</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Products
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Manage your store catalog, pricing, variants, and storefront visibility.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs sm:text-sm font-bold text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-95 transition-all self-start sm:self-auto shrink-0"
        >
          <Plus className="size-4" />
          <span>Add Product</span>
        </Link>
      </header>

      {/* ── Action Notice ─────────────────────────────────────────────── */}
      <ActionNotice action={action} />

      {/* ── Filter Bar & Quick Status Tabs ───────────────────────────── */}
      <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-3.5 shadow-xs">
        {/* Quick Tabs: All, Active, Draft, Inactive, Featured */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border/60 pb-3 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setStatus("");
              setFeaturedFilter(undefined);
              setPage(1);
            }}
            className={`rounded-lg px-3 py-1.5 transition-colors ${
              status === "" && featuredFilter === undefined
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            All Products
          </button>
          <button
            type="button"
            onClick={() => {
              setStatus("ACTIVE");
              setFeaturedFilter(undefined);
              setPage(1);
            }}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors ${
              status === "ACTIVE" && featuredFilter === undefined
                ? "bg-emerald-600 text-white"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <span className="size-1.5 rounded-full bg-emerald-500" />
            <span>Active</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setStatus("DRAFT");
              setFeaturedFilter(undefined);
              setPage(1);
            }}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors ${
              status === "DRAFT"
                ? "bg-amber-600 text-white"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <span className="size-1.5 rounded-full bg-amber-500" />
            <span>Draft</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setStatus("INACTIVE");
              setFeaturedFilter(undefined);
              setPage(1);
            }}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors ${
              status === "INACTIVE"
                ? "bg-slate-700 text-white"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <span className="size-1.5 rounded-full bg-slate-400" />
            <span>Inactive</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setStatus("");
              setFeaturedFilter(featuredFilter === true ? undefined : true);
              setPage(1);
            }}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors ${
              featuredFilter === true
                ? "bg-amber-500 text-neutral-950 font-bold"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <Star className="size-3.5 fill-current" />
            <span>Featured Only</span>
          </button>
        </div>

        {/* Input Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search product or slug..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 pr-8 h-9 text-xs rounded-xl bg-background border-border/80"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <select
            aria-label="Filter category"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="h-9 px-3 rounded-xl border border-border/80 bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="">All Categories</option>
            {options.data?.categories.map((row) => (
              <option key={row.id} value={row.id}>
                {row.path ?? row.name}
              </option>
            ))}
          </select>

          {/* Brand Dropdown */}
          <select
            aria-label="Filter brand"
            value={brand}
            onChange={(e) => {
              setBrand(e.target.value);
              setPage(1);
            }}
            className="h-9 px-3 rounded-xl border border-border/80 bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="">All Brands</option>
            {options.data?.brands.map((row) => (
              <option key={row.id} value={row.id}>
                {row.name}
              </option>
            ))}
          </select>

          {/* Reset Filters Action */}
          {hasActiveFilters ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              className="h-9 rounded-xl text-xs font-semibold gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
              <span>Reset All Filters</span>
            </Button>
          ) : (
            <div className="hidden lg:flex items-center text-xs text-muted-foreground px-2">
              Showing {products.length} of {meta.total} items
            </div>
          )}
        </div>
      </div>

      {/* ── Table Container ───────────────────────────────────────────── */}
      {query.isLoading ? (
        <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="size-12 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-28 rounded-xl" />
            </div>
          ))}
        </div>
      ) : query.isError ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center text-destructive">
          <p className="font-semibold text-sm">Failed to load product catalog.</p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => query.refetch()}
            className="mt-3 text-xs"
          >
            Retry Loading
          </Button>
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/80 bg-card p-12 text-center max-w-md mx-auto space-y-3">
          <Package className="size-10 text-muted-foreground/40 mx-auto" />
          <h3 className="font-bold text-base text-foreground">
            No products found
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {hasActiveFilters
              ? "No items match your active filters. Try clearing your search keywords."
              : "Start by creating your first product to display on your storefront."}
          </p>
          {hasActiveFilters ? (
            <Button
              size="sm"
              variant="outline"
              onClick={handleClearFilters}
              className="mt-2 text-xs font-semibold rounded-xl"
            >
              Clear Filters
            </Button>
          ) : (
            <Link
              href="/admin/products/new"
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 mt-2"
            >
              <Plus className="size-4" />
              <span>Add Your First Product</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-border/60 bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Product</th>
                  <th className="py-3.5 px-4 font-semibold">Price</th>
                  <th className="py-3.5 px-4 font-semibold">Department & Brand</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Featured</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {products.map((product) => {
                  const primaryCategory =
                    product.categories?.find((item) => item.isPrimary)?.category
                      ?.name ||
                    product.categories?.[0]?.category?.name ||
                    "Unassigned";
                  const variantCount = product.variants?.length || 0;
                  const priceLabel = formatPriceRange(product);

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      {/* Product Thumbnail & Title */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <ProductThumbnail product={product} />
                          <div className="min-w-0 max-w-xs">
                            <Link
                              href={`/admin/products/${product.id}/edit`}
                              className="font-bold text-foreground hover:text-primary transition-colors block truncate"
                            >
                              {product.name}
                            </Link>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                              <span className="truncate max-w-[140px]">
                                /{product.slug}
                              </span>
                              {variantCount > 0 && (
                                <>
                                  <span>•</span>
                                  <span>
                                    {variantCount} {variantCount === 1 ? "variant" : "variants"}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Price Range */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-bold text-foreground">
                          {priceLabel}
                        </span>
                      </td>

                      {/* Category & Brand */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 font-medium text-foreground">
                            <Layers className="size-3 text-primary" />
                            {primaryCategory}
                          </span>
                          <p className="text-[11px] text-muted-foreground">
                            Brand: {product.brand?.name ?? "—"}
                          </p>
                        </div>
                      </td>

                      {/* Status with Quick Toggle */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <StatusPill status={product.status} />
                          <button
                            type="button"
                            title={
                              product.status === "ACTIVE"
                                ? "Click to set Inactive"
                                : "Click to set Active"
                            }
                            onClick={() => handleToggleStatus(product)}
                            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          >
                            {product.status === "ACTIVE" ? (
                              <Eye className="size-3.5 text-emerald-600" />
                            ) : (
                              <EyeOff className="size-3.5 text-muted-foreground" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Featured Star Toggle */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(product)}
                          title={
                            product.isFeatured
                              ? "Featured on Homepage (Click to remove)"
                              : "Not Featured (Click to make Featured)"
                          }
                          className={`p-1.5 rounded-lg border transition-all ${
                            product.isFeatured
                              ? "border-amber-400 bg-amber-400/10 text-amber-500 hover:bg-amber-400/20"
                              : "border-border/60 text-muted-foreground/40 hover:text-amber-500 hover:border-amber-300"
                          }`}
                        >
                          <Star
                            className={`size-4 ${
                              product.isFeatured ? "fill-current" : ""
                            }`}
                          />
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Live Storefront Link */}
                          <Link
                            href={`/products/${product.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View on storefront"
                            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          >
                            <ExternalLink className="size-4" />
                          </Link>

                          {/* Print Barcodes Button */}
                          <button
                            type="button"
                            onClick={() => setBarcodeModalProduct(product)}
                            title="Print variant barcode labels"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-border/80 bg-background px-2.5 py-1.5 text-xs font-semibold hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-2xs"
                          >
                            <Barcode className="size-3.5" />
                            <span className="hidden sm:inline">Barcodes</span>
                          </button>

                          {/* Edit Details */}
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            title="Edit product"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-border/80 bg-background px-3 py-1.5 text-xs font-semibold hover:border-primary hover:text-primary transition-all shadow-2xs"
                          >
                            <Pencil className="size-3.5" />
                            <span>Edit</span>
                          </Link>

                          {/* Delete Action */}
                          <button
                            type="button"
                            title="Delete product"
                            onClick={() => setDeleting(product)}
                            className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── Table Footer & Pagination ─────────────────────────────── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-t border-border/60 bg-muted/20 text-xs text-muted-foreground">
            <div>
              Showing page <strong className="text-foreground">{page}</strong> of{" "}
              <strong className="text-foreground">{Math.max(1, meta.totalPages)}</strong>{" "}
              ({meta.total} total products)
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || query.isFetching}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-8 rounded-xl text-xs gap-1 font-semibold"
              >
                <ChevronLeft className="size-3.5" />
                <span>Previous</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= meta.totalPages || query.isFetching}
                onClick={() => setPage((p) => p + 1)}
                className="h-8 rounded-xl text-xs gap-1 font-semibold"
              >
                <span>Next</span>
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Barcode Print Modal ────────────────────────────────────────── */}
      <ProductBarcodePrintModal
        product={barcodeModalProduct}
        open={Boolean(barcodeModalProduct)}
        onOpenChange={(open) => !open && setBarcodeModalProduct(null)}
      />

      {/* ── Delete Confirmation Dialog ─────────────────────────────────── */}
      {deleting && (
        <DeleteDialog
          name={deleting.name}
          explanation="This will permanently delete the product and its variants from the database. Existing order line items may prevent deletion."
          onClose={() => setDeleting(undefined)}
          onDelete={async () => {
            await remove(deleting.id).unwrap();
            setDeleting(undefined);
            if (products.length === 1 && page > 1) {
              setPage(page - 1);
            }
          }}
        />
      )}
    </div>
  );
}
