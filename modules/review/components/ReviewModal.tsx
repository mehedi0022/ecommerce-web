"use client";

import { useState, useEffect } from "react";
import { Star, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  useCreateReviewMutation,
  useUpdateReviewMutation,
} from "../reviewApi";
import type { ProductReview } from "../types";

interface ReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderItemId: number;
  productName: string;
  initialReview?: ProductReview | null;
  onSuccess?: () => void;
}

export function ReviewModal({
  open,
  onOpenChange,
  orderItemId,
  productName,
  initialReview,
  onSuccess,
}: ReviewModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");

  const [createReview, { isLoading: isCreating }] = useCreateReviewMutation();
  const [updateReview, { isLoading: isUpdating }] = useUpdateReviewMutation();

  const isSubmitting = isCreating || isUpdating;
  const isEditing = Boolean(initialReview);

  useEffect(() => {
    if (initialReview) {
      setRating(initialReview.rating || 5);
      setTitle(initialReview.title || "");
      setComment(initialReview.comment || "");
    } else {
      setRating(5);
      setTitle("");
      setComment("");
    }
    setHoverRating(null);
  }, [initialReview, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!rating || rating < 1 || rating > 5) {
      toast.error("Please select a rating between 1 and 5 stars");
      return;
    }

    try {
      if (isEditing && initialReview) {
        await updateReview({
          id: initialReview.id,
          rating,
          title: title.trim() || null,
          comment: comment.trim() || null,
        }).unwrap();
        toast.success("Review updated successfully and pending approval!");
      } else {
        await createReview({
          orderItemId,
          rating,
          title: title.trim() || null,
          comment: comment.trim() || null,
        }).unwrap();
        toast.success("Thank you! Your review has been submitted for review.");
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      toast.error(
        err?.data?.message ||
          "Failed to submit review. You might have already reviewed this item."
      );
    }
  };

  const currentDisplayRating = hoverRating !== null ? hoverRating : rating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-lg font-bold text-foreground">
            {isEditing ? "Edit Your Review" : "Write a Review"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            Sharing your feedback for{" "}
            <strong className="text-foreground">{productName}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-3">
          {/* Star Rating Select */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Your Overall Rating</Label>
            <div className="flex items-center gap-1.5 py-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="rounded-md p-1 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <Star
                    className={cn(
                      "size-7 transition-colors",
                      star <= currentDisplayRating
                        ? "fill-amber-400 text-amber-400"
                        : "fill-muted text-muted-foreground/30"
                    )}
                  />
                </button>
              ))}
              <span className="ml-2 text-xs font-bold text-muted-foreground">
                {currentDisplayRating === 1 && "Poor"}
                {currentDisplayRating === 2 && "Fair"}
                {currentDisplayRating === 3 && "Good"}
                {currentDisplayRating === 4 && "Very Good"}
                {currentDisplayRating === 5 && "Excellent"}
              </span>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="review-title" className="text-xs font-semibold">
              Headline or Summary (Optional)
            </Label>
            <Input
              id="review-title"
              placeholder="e.g. Great quality, fits perfectly!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={150}
              className="text-xs"
            />
          </div>

          {/* Comment */}
          <div className="space-y-1.5">
            <Label htmlFor="review-comment" className="text-xs font-semibold">
              Detailed Experience (Optional)
            </Label>
            <Textarea
              id="review-comment"
              placeholder="What did you like or dislike about this product? How is the material, sizing, or build quality?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={2000}
              className="text-xs resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="text-xs font-semibold gap-1.5"
            >
              {isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
              {isEditing ? "Save Changes" : "Submit Review"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
