"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Star,
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
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  useGetMyReviewsQuery,
  useDeleteReviewMutation,
} from "../reviewApi";
import { ReviewModal } from "./ReviewModal";
import { AccountLayoutShell } from "@/modules/account/components/AccountLayoutShell";
import type { ProductReview } from "../types";

export function CustomerReviewsPage() {
  const { data, isLoading, isFetching, refetch } = useGetMyReviewsQuery();
  const [deleteReview, { isLoading: isDeleting }] = useDeleteReviewMutation();

  const [editingReview, setEditingReview] = useState<ProductReview | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const reviews = data?.data ?? [];

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

  const actions = (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => refetch()}
      disabled={isFetching}
      className="gap-1.5 text-xs font-semibold"
    >
      <RefreshCw className={cn("size-3.5", isFetching && "animate-spin")} />
      <span>Refresh</span>
    </Button>
  );

  return (
    <>
      <AccountLayoutShell
        title="My Product Reviews"
        description="Review history, ratings, and customer feedback you've submitted."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Account", href: "/account" },
          { label: "Reviews" },
        ]}
        actions={actions}
      >
        <div className="space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-xs"
                >
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-5 w-40 rounded-md" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-14 w-full rounded-xl" />
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border/80 bg-card p-8 sm:p-14 text-center shadow-xs">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground shadow-2xs">
                <Star className="size-7" />
              </div>
              <h3 className="mt-4 text-xl font-bold text-foreground">
                No reviews submitted yet
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Share your valuable thoughts on delivered orders to help other
                customers make informed purchasing decisions.
              </p>
              <Link
                href="/account/orders"
                className={cn(buttonVariants({ size: "default" }), "mt-6 gap-2 rounded-xl font-bold shadow-md")}
              >
                <ShoppingBag className="size-4" />
                <span>Go to My Orders</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev) => {
                const productName =
                  rev.product?.name || rev.orderItem?.productName || "Product";
                const isApproved = rev.status === "APPROVED";
                const isPending = rev.status === "PENDING";
                const isRejected = rev.status === "REJECTED";

                return (
                  <div
                    key={rev.id}
                    className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs transition-all hover:border-primary/40 hover:shadow-md"
                  >
                    <div>
                      {/* Top Bar: Product Name & Status */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3.5 mb-3.5">
                        <div>
                          <h4 className="font-bold text-sm sm:text-base text-foreground line-clamp-1">
                            {productName}
                          </h4>
                          <span className="text-[11px] text-muted-foreground">
                            Reviewed on{" "}
                            {new Date(rev.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          {isApproved && (
                            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-bold">
                              <CheckCircle2 className="size-3 mr-1" /> Published
                            </Badge>
                          )}
                          {isPending && (
                            <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] font-bold">
                              <Clock className="size-3 mr-1" /> Pending Approval
                            </Badge>
                          )}
                          {isRejected && (
                            <Badge variant="destructive" className="text-[10px] font-bold">
                              <XCircle className="size-3 mr-1" /> Rejected
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Rating Stars & Title */}
                      <div className="flex items-center gap-1 text-amber-400 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              "size-4",
                              star <= rev.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-muted-foreground/30"
                            )}
                          />
                        ))}
                        <span className="ml-2 text-xs font-bold text-foreground">
                          {rev.rating} / 5
                        </span>
                      </div>

                      {rev.title && (
                        <h5 className="font-bold text-sm text-foreground mb-1">
                          {rev.title}
                        </h5>
                      )}

                      {rev.comment && (
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                          {rev.comment}
                        </p>
                      )}

                      {/* Admin Feedback note if rejected */}
                      {isRejected && rev.adminFeedback && (
                        <div className="mt-3 rounded-xl bg-destructive/10 p-3 text-xs text-destructive">
                          <strong>Admin Feedback:</strong> {rev.adminFeedback}
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        {rev.isVerifiedPurchase && (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
                            <CheckCircle2 className="size-3.5" /> Verified Purchase
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(rev)}
                          className="h-8 gap-1.5 text-xs font-semibold rounded-lg"
                        >
                          <Edit3 className="size-3.5" />
                          <span>Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(rev.id)}
                          disabled={isDeleting}
                          className="h-8 gap-1.5 text-xs font-semibold text-muted-foreground hover:text-destructive rounded-lg"
                        >
                          <Trash2 className="size-3.5" />
                          <span>Delete</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </AccountLayoutShell>

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
    </>
  );
}
