"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Layers,
  Plus,
  ExternalLink,
  Copy,
  Edit2,
  Trash2,
  Eye,
  Check,
  Package,
  TrendingUp,
  Clock,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  useListLandingPagesQuery,
  useDeleteLandingPageMutation,
  useUpdateLandingPageMutation,
} from "@/modules/landing-page/landingPageApi";
import { getApiErrorMessage } from "@/lib/api/api-error";
import type { LandingPage } from "@/modules/landing-page/types";

export default function AdminLandingPagesPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading, error, refetch } = useListLandingPagesQuery({ search: search || undefined });
  const landingPages = data?.data || [];

  const [deleteLandingPage] = useDeleteLandingPageMutation();
  const [updateLandingPage] = useUpdateLandingPageMutation();

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}/deal/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Landing page URL copied to clipboard!", {
      description: url,
    });
  };

  const handleTogglePublished = async (page: LandingPage) => {
    try {
      await updateLandingPage({
        id: page.id,
        body: { isPublished: !page.isPublished },
      }).unwrap();
      toast.success(
        page.isPublished
          ? "Landing page moved to Draft (hidden from visitors)."
          : "Landing page published successfully!"
      );
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to update status"));
    }
  };

  const handleDelete = async (page: LandingPage) => {
    if (!confirm(`Are you sure you want to delete landing page "${page.title}"? This cannot be undone.`)) {
      return;
    }
    try {
      await deleteLandingPage(page.id).unwrap();
      toast.success("Landing page deleted successfully.");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to delete landing page"));
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Layers className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Product Landing Pages</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              High-converting single-page funnels with embedded 1-click express order checkout for social media ads.
            </p>
          </div>
        </div>

        <Link
          href="/admin/landing-pages/new"
          className={cn(buttonVariants(), "gap-2 shrink-0 rounded-xl font-bold shadow-sm")}
        >
          <Plus className="size-4" />
          <span>Create Landing Page</span>
        </Link>
      </div>

      {/* ── Search & Filter ── */}
      <div className="flex items-center gap-3 max-w-sm">
        <Input
          placeholder="Search landing pages by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 text-xs"
        />
      </div>

      {/* ── Landing Pages List ── */}
      {error ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center space-y-3">
          <p className="text-sm font-semibold text-destructive">
            {getApiErrorMessage(error, "Failed to load landing pages.")}
          </p>
          <Button size="sm" variant="outline" onClick={() => refetch()} className="text-xs font-semibold cursor-pointer">
            Retry
          </Button>
        </div>
      ) : isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-56 rounded-2xl border bg-muted/20 animate-pulse" />
          ))}
        </div>
      ) : landingPages.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center bg-card">
          <div className="size-12 rounded-2xl bg-muted/50 flex items-center justify-center mb-4 text-muted-foreground">
            <Layers className="size-6" />
          </div>
          <h3 className="text-lg font-bold">No Landing Pages Found</h3>
          <p className="text-sm text-muted-foreground max-w-md mt-1 mb-6">
            Create high-converting landing pages for your hero products to run Facebook, Instagram, or TikTok ads with 1-click Cash on Delivery order forms.
          </p>
          <Link
            href="/admin/landing-pages/new"
            className={cn(buttonVariants(), "gap-2 rounded-xl font-bold")}
          >
            <Plus className="size-4" />
            <span>Create Your First Landing Page</span>
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {landingPages.map((page) => (
            <div
              key={page.id}
              className="flex flex-col justify-between rounded-2xl border bg-card p-5 shadow-xs hover:border-primary/40 transition-all group"
            >
              <div>
                {/* Header status row */}
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <Badge
                    variant={page.isPublished ? "default" : "outline"}
                    className={cn(
                      "text-[10px] font-bold cursor-pointer",
                      page.isPublished
                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                        : "text-muted-foreground"
                    )}
                    onClick={() => handleTogglePublished(page)}
                    title="Click to toggle publish status"
                  >
                    {page.isPublished ? "Active / Published" : "Draft (Hidden)"}
                  </Badge>

                  <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                    <Eye className="size-3.5 text-primary" />
                    <span>{page.viewsCount || 0} views</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-bold text-base leading-snug group-hover:text-primary transition-colors line-clamp-2">
                  {page.title}
                </h3>

                {/* Slug / Public URL */}
                <div className="flex items-center gap-2 mt-2 bg-muted/40 px-2.5 py-1 rounded-lg border font-mono text-[11px] text-muted-foreground">
                  <span className="truncate">/deal/{page.slug}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyLink(page.slug)}
                    className="ml-auto hover:text-foreground text-primary shrink-0 p-0.5 cursor-pointer"
                    title="Copy public link"
                  >
                    <Copy className="size-3.5" />
                  </button>
                </div>

                {/* Linked Product Info */}
                {page.product && (
                  <div className="mt-3.5 flex items-center gap-2.5 rounded-xl border bg-muted/20 p-2.5">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Package className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-medium text-muted-foreground">Linked Product</p>
                      <p className="text-xs font-bold truncate text-foreground">
                        {page.product.name}
                      </p>
                    </div>
                  </div>
                )}

                {/* Headline or badge teaser */}
                {page.badgeText && (
                  <div className="mt-2.5 flex items-center gap-1.5 text-xs text-rose-600 font-semibold dark:text-rose-400">
                    <Sparkles className="size-3 shrink-0" />
                    <span className="truncate">{page.badgeText}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons Footer */}
              <div className="flex items-center justify-between border-t pt-3.5 mt-4">
                <Link
                  href={`/deal/${page.slug}`}
                  target="_blank"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                  )}
                >
                  <ExternalLink className="size-3.5" />
                  <span>View Page</span>
                </Link>

                <div className="flex items-center gap-1.5">
                  <Link
                    href={`/admin/landing-pages/${page.id}/edit`}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "h-8 gap-1.5 text-xs"
                    )}
                  >
                    <Edit2 className="size-3.5" />
                    <span>Edit</span>
                  </Link>

                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(page)}
                    className="h-8 size-8 p-0 text-destructive hover:bg-destructive/10 cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
