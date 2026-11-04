"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Barcode,
  Package,
  Layers,
  Printer,
  Pencil,
  ExternalLink,
  RefreshCw,
  X,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useListProductsQuery } from "@/modules/product/productApi";
import { mediaUrl } from "@/modules/catalog/catalog.utils";
import type { Product, ProductVariant } from "@/modules/product/types";
import { ProductBarcodePrintModal } from "@/modules/product/components/admin/ProductBarcodePrintModal";

interface FlatVariantItem {
  product: Product;
  variant: ProductVariant;
}

export default function AdminVariantsPage() {
  const [search, setSearch] = useState("");
  const [selectedProductForBarcode, setSelectedProductForBarcode] = useState<Product | null>(null);

  // Fetch all products with their variants
  const { data, isLoading, isError, refetch, isFetching } = useListProductsQuery({
    limit: 100,
  });

  const products = data?.data || [];

  // Flatten products into variant items
  const allVariants = useMemo(() => {
    const list: FlatVariantItem[] = [];
    products.forEach((p) => {
      (p.variants || []).forEach((v) => {
        list.push({ product: p, variant: v });
      });
    });
    return list;
  }, [products]);

  // Filter variants by search query (SKU or product title or attribute)
  const filteredVariants = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allVariants;

    return allVariants.filter(({ product, variant }) => {
      const matchSku = variant.sku?.toLowerCase().includes(q);
      const matchName = product.name?.toLowerCase().includes(q);
      const matchAttr = (variant.attributeValues || []).some((av) =>
        av.attributeValue?.value?.toLowerCase().includes(q)
      );
      return matchSku || matchName || matchAttr;
    });
  }, [allVariants, search]);

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card p-4 sm:p-6 rounded-2xl border shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
              <Layers className="size-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Product Variants & Barcodes
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Browse catalog variants, look up SKUs, and print barcode sticker labels.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-9 gap-1.5 text-xs font-semibold rounded-xl"
          >
            <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Link href="/admin/products/new">
            <Button size="sm" className="h-9 gap-1.5 text-xs font-semibold rounded-xl">
              Add New Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border bg-card p-3 shadow-2xs">
        <div className="flex items-center gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by SKU, barcode, product name, or size/color..."
              className="pl-9 h-9 text-xs rounded-xl"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap px-1">
            {filteredVariants.length} variants found
          </span>
        </div>
      </div>

      {/* Variants Table */}
      {isLoading ? (
        <div className="rounded-2xl border bg-card p-6 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="size-10 rounded-xl" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-28" />
              </div>
              <Skeleton className="h-4 w-24 font-mono" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-8 w-24 rounded-xl" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center text-destructive">
          <p className="font-semibold text-sm">Failed to load product variants.</p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetch()}
            className="mt-3 text-xs"
          >
            Retry Loading
          </Button>
        </div>
      ) : filteredVariants.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-card p-12 text-center max-w-md mx-auto space-y-3">
          <Package className="size-10 text-muted-foreground/40 mx-auto" />
          <h3 className="font-bold text-base text-foreground">No variants found</h3>
          <p className="text-xs text-muted-foreground">
            {search
              ? "No variants match your search keywords. Try searching another SKU or product name."
              : "No product variants exist yet. Create a product with variants to view them here."}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border bg-card overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b text-muted-foreground font-semibold">
                <tr>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Variant Options</th>
                  <th className="py-3 px-4 font-mono">SKU / Barcode</th>
                  <th className="py-3 px-4 text-right">Selling Price</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredVariants.map(({ product, variant }) => {
                  const primaryImg =
                    product.images?.find((img) => img.isPrimary) || product.images?.[0];
                  const src = primaryImg?.imageUrl ? mediaUrl(primaryImg.imageUrl) : null;

                  const attrSummary = (variant.attributeValues || [])
                    .map((av) => av.attributeValue?.value)
                    .filter(Boolean)
                    .join(" / ");

                  return (
                    <tr key={variant.id} className="hover:bg-muted/30 transition-colors">
                      {/* Product Thumbnail & Title */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative size-10 shrink-0 rounded-lg overflow-hidden border bg-muted/30 flex items-center justify-center">
                            {src ? (
                              <Image
                                src={src}
                                alt={product.name}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            ) : (
                              <Package className="size-4 text-muted-foreground/40" />
                            )}
                          </div>
                          <div>
                            <Link
                              href={`/admin/products/${product.id}/edit`}
                              className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1"
                            >
                              {product.name}
                            </Link>
                            <span className="text-[11px] text-muted-foreground">
                              ID: #{product.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Variant Attributes */}
                      <td className="py-3 px-4">
                        <span className="font-medium text-foreground">
                          {attrSummary || "Default Variant"}
                        </span>
                      </td>

                      {/* SKU / Barcode */}
                      <td className="py-3 px-4 font-mono font-semibold text-foreground">
                        <div className="flex items-center gap-1.5">
                          <Barcode className="size-3.5 text-muted-foreground" />
                          <span>{variant.sku}</span>
                        </div>
                      </td>

                      {/* Selling Price */}
                      <td className="py-3 px-4 text-right font-bold text-foreground">
                        ৳{Number(variant.price).toFixed(0)}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        {variant.isActive ? (
                          <Badge className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] text-muted-foreground">
                            Inactive
                          </Badge>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedProductForBarcode(product)}
                            className="h-7 text-xs px-2.5 gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50 font-semibold"
                          >
                            <Barcode className="size-3" />
                            Print Barcode
                          </Button>

                          <Link href={`/admin/products/${product.id}/edit`}>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-muted-foreground hover:text-foreground"
                            >
                              <Pencil className="size-3" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Barcode Print Modal */}
      <ProductBarcodePrintModal
        product={selectedProductForBarcode}
        open={Boolean(selectedProductForBarcode)}
        onOpenChange={(open) => !open && setSelectedProductForBarcode(null)}
      />
    </div>
  );
}
