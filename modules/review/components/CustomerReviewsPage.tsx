"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Star,
  Package,
  MapPin,
  Heart,
  RotateCcw,
  UserRound,
  LogOut,
  RefreshCw,
  ShoppingBag,
  ExternalLink,
  Edit3,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { StoreContainer } from "@/components/layout/store/StoreContainer";
import { Card } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/redux/hooks";
import { useLogoutMutation } from "@/modules/auth/authApi";
import {
  useGetMyReviewsQuery,
  useDeleteReviewMutation,
} from "../reviewApi";
import { ReviewModal } from "./ReviewModal";
import type { ProductReview } from "../types";

const menuItems = [
  { href: "/account", label: "Overview", icon: UserRound },
  { href: "/account/orders", label: "My orders", icon: Package },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/reviews", label: "My reviews", icon: Star },
  { href: "/account/returns", label: "Returns", icon: RotateCcw },
];

export function CustomerReviewsPage() {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  const { data, isLoading, isFetching, refetch } = useGetMyReviewsQuery();
  const [deleteReview, { isLoading: isDeleting }] = useDeleteReviewMutation();

  const [editingReview, setEditingReview] = useState<ProductReview | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const reviews = data?.data ?? [];

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } finally {
      router.replace("/login");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      await deleteReview(id).unwrap();
      toast.success("Review deleted successfully");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete review");
    }
  };

  const handleEdit = (rev: ProductReview) => {
    setEditingReview(rev);
    setIsModalOpen(true);
  };

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-muted/30 py-8 sm:py-12">
      <StoreContainer>
        {/* ── Breadcrumb ─── */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex items-center gap-2 text-xs text-muted-foreground"
        >
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span>/</span>
          <Link href="/account" className="hover:text-foreground">
            Account
          </Link>
          <span>/</span>
          <span className="font-medium text-foreground">Reviews</span>
        </nav>

        {/* ── Header ─── */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              My Product Reviews
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Review history and ratings you&apos;ve submitted for purchased items.
            </p>
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "gap-1.5 text-xs font-semibold self-start sm:self-auto"
            )}
          >
            <RefreshCw className={cn("size-3.5", isFetching && "animate-spin")} />
            Refresh
          </button>
        </div>

        {/* ── Layout Grid ─── */}
        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          {/* Account Sidebar Navigation */}
          <aside className="hidden lg:block">
            <Card className="overflow-hidden">
              <div className="border-b bg-primary p-4 text-primary-foreground">
                <p className="font-semibold text-sm truncate">
                  {user?.fullName || user?.userName}
                </p>
                <p className="mt-0.5 truncate text-xs text-primary-foreground/70">
                  {user?.email}
                </p>
              </div>
              <nav className="p-2 space-y-0.5" aria-label="Account navigation">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.href === "/account/reviews";
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Icon className="size-4" />
                      {item.label}
                    </Link>
                  );
                })}
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-destructive transition hover:bg-destructive/10"
                >
                  <LogOut className="size-4" />
                  {isLoggingOut ? "Signing out..." : "Sign out"}
                </button>
              </nav>
            </Card>
          </aside>

          {/* Reviews List */}
          <section className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="overflow-hidden rounded-xl border border-border bg-card p-5 space-y-3"
                  >
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-16 w-full rounded-md" />
                  </div>
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
                <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-amber-50 text-amber-500 dark:bg-amber-950/40">
                  <Star className="size-7" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-foreground">
                  No reviews submitted yet
                </h3>
                <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
                  When you receive delivered orders, you can leave helpful feedback and
                  star ratings directly from your orders page.
                </p>
                <Link
                  href="/account/orders"
                  className={cn(buttonVariants({ size: "default" }), "mt-6 gap-2")}
                >
                  <Package className="size-4" />
                  View Delivered Orders
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs font-medium text-muted-foreground">
                  You have submitted <strong>{reviews.length}</strong> {reviews.length === 1 ? "review" : "reviews"}
                </p>

                {reviews.map((rev) => {
                  const statusMap = {
                    PENDING: {
                      label: "Pending Moderation",
                      icon: Clock,
                      className: "border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
                    },
                    APPROVED: {
                      label: "Published",
                      icon: CheckCircle2,
                      className: "border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
                    },
                    REJECTED: {
                      label: "Declined",
                      icon: XCircle,
                      className: "border-rose-300 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400",
                    },
                  };

                  const currentStatus = statusMap[rev.status] || statusMap.PENDING;
                  const StatusIcon = currentStatus.icon;

                  return (
                    <div
                      key={rev.id}
                      className="group rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs transition hover:border-primary/40 hover:shadow-sm"
                    >
                      {/* Top Bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            {rev.product ? (
                              <Link
                                href={`/products/${rev.product.slug}`}
                                className="font-semibold text-sm text-foreground hover:text-primary transition line-clamp-1"
                              >
                                {rev.product.name}
                              </Link>
                            ) : (
                              <span className="font-semibold text-sm text-foreground">
                                {rev.orderItem?.productName || "Product Review"}
                              </span>
                            )}
                            <Badge variant="outline" className={cn("text-[10px] font-semibold gap-1", currentStatus.className)}>
                              <StatusIcon className="size-3" />
                              {currentStatus.label}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground mt-0.5 block">
                            Reviewed on{" "}
                            {new Date(rev.createdAt).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>

                        {/* Stars */}
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={cn(
                                "size-4",
                                s <= rev.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "fill-muted text-muted-foreground/30"
                              )}
                            />
                          ))}
                          <span className="ml-1 text-xs font-bold text-foreground">
                            {rev.rating}.0
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="mt-4 space-y-1.5">
                        {rev.title && (
                          <h4 className="text-sm font-bold text-foreground">
                            {rev.title}
                          </h4>
                        )}
                        {rev.comment ? (
                          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                            {rev.comment}
                          </p>
                        ) : (
                          <p className="text-xs italic text-muted-foreground/60">
                            No written review provided.
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs">
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <CheckCircle2 className="size-3.5 text-emerald-600" />
                          Verified Purchase
                        </span>

                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(rev)}
                            className="h-8 gap-1 text-xs"
                          >
                            <Edit3 className="size-3" />
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={isDeleting}
                            onClick={() => handleDelete(rev.id)}
                            className="h-8 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="size-3" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </StoreContainer>

      {/* Edit Review Modal */}
      {editingReview && (
        <ReviewModal
          open={isModalOpen}
          onOpenChange={(open) => {
            setIsModalOpen(open);
            if (!open) setEditingReview(null);
          }}
          orderItemId={editingReview.orderItemId}
          productName={editingReview.product?.name || editingReview.orderItem?.productName || "Product"}
          initialReview={editingReview}
        />
      )}
    </main>
  );
}
