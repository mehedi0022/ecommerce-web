"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Star,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Filter,
  RefreshCw,
  Search,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  Package,
  User,
  AlertCircle,
  Eye,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AdminPagination } from "@/components/admin/AdminPagination";
import {
  useGetAdminReviewsQuery,
  useApproveReviewMutation,
  useRejectReviewMutation,
  useAdminDeleteReviewMutation,
} from "../reviewApi";
import type { ProductReview } from "../types";
import { cn } from "@/lib/utils";

export function AdminReviewsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [ratingFilter, setRatingFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  const queryParams = {
    page,
    limit,
    status:
      statusFilter === "PENDING" ||
      statusFilter === "APPROVED" ||
      statusFilter === "REJECTED"
        ? (statusFilter as "PENDING" | "APPROVED" | "REJECTED")
        : undefined,
    rating: ratingFilter !== "ALL" ? Number(ratingFilter) : undefined,
  };

  const { data, isLoading, isFetching, refetch } =
    useGetAdminReviewsQuery(queryParams);

  const [approveReview, { isLoading: isApproving }] = useApproveReviewMutation();
  const [rejectReview, { isLoading: isRejecting }] = useRejectReviewMutation();
  const [deleteReview, { isLoading: isDeleting }] = useAdminDeleteReviewMutation();

  const [selectedReview, setSelectedReview] = useState<ProductReview | null>(null);
  const [deletingReview, setDeletingReview] = useState<ProductReview | null>(null);

  const reviews = data?.data ?? [];
  const meta = data?.meta;

  // Filter client-side search across reviewer name, comment, title, and product name
  const filteredReviews = search.trim()
    ? reviews.filter((r) => {
        const term = search.toLowerCase();
        return (
          r.title?.toLowerCase().includes(term) ||
          r.comment?.toLowerCase().includes(term) ||
          r.product?.name.toLowerCase().includes(term) ||
          r.user?.fullName?.toLowerCase().includes(term) ||
          r.user?.userName?.toLowerCase().includes(term)
        );
      })
    : reviews;

  // Quick action handlers
  const handleApprove = async (id: number) => {
    try {
      await approveReview(id).unwrap();
      toast.success("Review approved successfully");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to approve review");
    }
  };

  const handleReject = async (id: number) => {
    try {
      await rejectReview(id).unwrap();
      toast.success("Review rejected");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to reject review");
    }
  };

  const handleDelete = async () => {
    if (!deletingReview) return;
    try {
      await deleteReview(deletingReview.id).unwrap();
      toast.success("Review deleted permanently");
      setDeletingReview(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete review");
    }
  };

  // Stats
  const totalCount = meta?.total ?? reviews.length;
  const pendingCount = reviews.filter((r) => r.status === "PENDING").length;
  const approvedCount = reviews.filter((r) => r.status === "APPROVED").length;
  const rejectedCount = reviews.filter((r) => r.status === "REJECTED").length;

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Review Moderation</h1>
          <p className="text-sm text-muted-foreground">
            Verify customer ratings, approve genuine product reviews, and filter spam.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="gap-2 shrink-0 h-9"
        >
          <RefreshCw className={cn("size-3.5", isFetching && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* ── Metrics Cards ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="shadow-none border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <MessageSquare className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Reviews</p>
              <p className="text-xl font-bold">{totalCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
              <Clock className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Pending Moderation</p>
              <p className="text-xl font-bold">{pendingCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Approved</p>
              <p className="text-xl font-bold">{approvedCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600">
              <XCircle className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Rejected</p>
              <p className="text-xl font-bold">{rejectedCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Filters & Search ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-3">
        <div className="flex flex-1 flex-wrap items-center gap-2 min-w-[280px]">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by review, product or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
              <option value="PENDING">Pending Moderation</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <select
            value={ratingFilter}
            onChange={(e) => {
              setRatingFilter(e.target.value);
              setPage(1);
            }}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="ALL">All Ratings</option>
            <option value="5">5 Stars ★★★★★</option>
            <option value="4">4 Stars ★★★★☆</option>
            <option value="3">3 Stars ★★★☆☆</option>
            <option value="2">2 Stars ★★☆☆☆</option>
            <option value="1">1 Star ★☆☆☆☆</option>
          </select>
        </div>
      </div>

      {/* ── Reviews Table ── */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl border bg-muted/30" />
          ))}
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center">
          <div className="rounded-full bg-muted p-4">
            <MessageSquare className="size-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-base font-semibold">No reviews found</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {search || statusFilter !== "ALL" || ratingFilter !== "ALL"
              ? "No reviews match your selected filter criteria. Try clearing filters."
              : "Customer reviews will appear here once submitted."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReviews.map((rev) => {
            const isPending = rev.status === "PENDING";
            const isApproved = rev.status === "APPROVED";
            const isRejected = rev.status === "REJECTED";

            return (
              <Card
                key={rev.id}
                className="overflow-hidden border bg-card shadow-none transition-all hover:border-primary/30"
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    {/* Left: Product & Review Content */}
                    <div className="space-y-2 flex-1">
                      {/* Product Header */}
                      <div className="flex flex-wrap items-center gap-2">
                        {rev.product ? (
                          <Link
                            href={`/products/${rev.product.slug}`}
                            target="_blank"
                            className="group flex items-center gap-1.5 font-semibold text-sm text-foreground hover:text-primary transition-colors"
                          >
                            <Package className="size-4 text-muted-foreground group-hover:text-primary" />
                            {rev.product.name}
                            <ExternalLink className="size-3 opacity-60 group-hover:opacity-100" />
                          </Link>
                        ) : (
                          <span className="font-semibold text-sm text-muted-foreground">
                            Product #{rev.productId}
                          </span>
                        )}

                        <span className="text-muted-foreground/40">•</span>

                        {/* Status Badge */}
                        {isPending && (
                          <Badge variant="outline" className="border-amber-300 bg-amber-50 text-[10px] text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
                            <Clock className="size-3 mr-1" /> Pending
                          </Badge>
                        )}
                        {isApproved && (
                          <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-[10px] text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                            <CheckCircle2 className="size-3 mr-1" /> Approved
                          </Badge>
                        )}
                        {isRejected && (
                          <Badge variant="outline" className="border-rose-300 bg-rose-50 text-[10px] text-rose-700 dark:bg-rose-950/30 dark:text-rose-400">
                            <XCircle className="size-3 mr-1" /> Rejected
                          </Badge>
                        )}

                        {rev.isVerifiedPurchase && (
                          <Badge variant="secondary" className="text-[10px] bg-muted text-muted-foreground">
                            <ShieldCheck className="size-3 mr-1 text-emerald-600" /> Verified Purchase
                          </Badge>
                        )}
                      </div>

                      {/* Stars & Title */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={cn(
                                "size-3.5",
                                s <= rev.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "fill-muted text-muted-foreground/20"
                              )}
                            />
                          ))}
                        </div>
                        {rev.title && (
                          <span className="text-sm font-bold text-foreground">
                            {rev.title}
                          </span>
                        )}
                      </div>

                      {/* Review Comment */}
                      {rev.comment && (
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {rev.comment}
                        </p>
                      )}

                      {/* Customer & Timestamp Info */}
                      <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <User className="size-3.5 text-muted-foreground/70" />
                          <span className="font-medium text-foreground">
                            {rev.user?.fullName || rev.user?.userName || "Customer"}
                          </span>
                          {rev.user?.userName && (
                            <span className="text-muted-foreground">
                              ({rev.user.userName})
                            </span>
                          )}
                        </div>

                        <span>•</span>

                        <span>
                          Submitted:{" "}
                          {new Date(rev.createdAt).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Right: Moderation Actions */}
                    <div className="flex sm:flex-col items-center gap-2 shrink-0 pt-2 sm:pt-0">
                      {isPending && (
                        <>
                          <Button
                            size="sm"
                            className="h-8 gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-28"
                            onClick={() => handleApprove(rev.id)}
                            disabled={isApproving}
                          >
                            <CheckCircle2 className="size-3.5" />
                            Approve
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1 text-xs border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/30 w-full sm:w-28"
                            onClick={() => handleReject(rev.id)}
                            disabled={isRejecting}
                          >
                            <XCircle className="size-3.5" />
                            Reject
                          </Button>
                        </>
                      )}

                      {isApproved && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1 text-xs border-rose-200 text-rose-600 hover:bg-rose-50 w-full sm:w-28"
                          onClick={() => handleReject(rev.id)}
                          disabled={isRejecting}
                        >
                          <XCircle className="size-3.5" />
                          Unapprove
                        </Button>
                      )}

                      {isRejected && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1 text-xs border-emerald-200 text-emerald-600 hover:bg-emerald-50 w-full sm:w-28"
                          onClick={() => handleApprove(rev.id)}
                          disabled={isApproving}
                        >
                          <CheckCircle2 className="size-3.5" />
                          Approve
                        </Button>
                      )}

                      <div className="flex items-center gap-1 w-full justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                          onClick={() => setSelectedReview(rev)}
                          title="View Details"
                        >
                          <Eye className="size-3.5" />
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10"
                          onClick={() => setDeletingReview(rev)}
                          title="Delete Review"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Pagination ── */}
      {meta && (
        <AdminPagination
          page={page}
          limit={limit}
          total={meta.total}
          totalPages={meta.totalPages}
          onPageChange={setPage}
          onLimitChange={setLimit}
          pageSizeOptions={[10, 20, 50]}
          disabled={isFetching}
          className="rounded-xl border"
        />
      )}

      {/* ── Details Dialog ── */}
      <Dialog open={!!selectedReview} onOpenChange={(open) => !open && setSelectedReview(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Details #{selectedReview?.id}</DialogTitle>
          </DialogHeader>

          {selectedReview && (
            <div className="space-y-4 text-sm">
              <div className="rounded-xl border bg-muted/20 p-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Product:</span>
                  <span className="font-semibold text-foreground text-right">
                    {selectedReview.product?.name || `Product ID ${selectedReview.productId}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reviewer:</span>
                  <span className="font-semibold text-foreground text-right">
                    {selectedReview.user?.fullName || selectedReview.user?.userName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rating:</span>
                  <span className="font-bold text-amber-500">
                    {selectedReview.rating} / 5 Stars
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Status:</span>
                  <Badge variant="outline">{selectedReview.status}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Verified Purchase:</span>
                  <span className="font-medium">
                    {selectedReview.isVerifiedPurchase ? "Yes (Delivered Order Item)" : "No"}
                  </span>
                </div>
              </div>

              <div>
                <p className="font-semibold mb-1">Headline / Title:</p>
                <p className="text-muted-foreground">
                  {selectedReview.title || "No headline provided"}
                </p>
              </div>

              <div>
                <p className="font-semibold mb-1">Feedback Comment:</p>
                <div className="rounded-xl border bg-muted/10 p-3 text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {selectedReview.comment || "No comment provided"}
                </div>
              </div>

              <div className="text-xs text-muted-foreground space-y-1 border-t pt-3">
                <p>Created: {new Date(selectedReview.createdAt).toLocaleString()}</p>
                {selectedReview.approvedAt && (
                  <p>Approved At: {new Date(selectedReview.approvedAt).toLocaleString()}</p>
                )}
                {selectedReview.rejectedAt && (
                  <p>Rejected At: {new Date(selectedReview.rejectedAt).toLocaleString()}</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ── */}
      <AlertDialog
        open={!!deletingReview}
        onOpenChange={(open) => !open && setDeletingReview(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review Permanently?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete review #{deletingReview?.id}? This action
              cannot be undone and will remove the rating from product averages.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete Review"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
