/**
 * `ReviewDetailDialog`: dialog showing full review details including
 * customer info, tradie reference, rating with stars, comment, status,
 * and conditional action buttons.
 */

import * as React from "react";
import { Star } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useReviewDetailQuery } from "@/features/reviews/hooks/use-review-detail-query";
import { useApproveReviewMutation } from "@/features/reviews/hooks/use-approve-review-mutation";
import { ReviewRejectDialog } from "@/features/reviews/components/review-reject-dialog";
import type { ApprovalStatus } from "@/features/reviews/reviews.types";

export interface ReviewDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reviewId: string | undefined;
}

const DATE_FORMATTER = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
});

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return DATE_FORMATTER.format(date);
}

function StatusBadge({ status }: { status: ApprovalStatus }) {
  const variant =
    status === "approved"
      ? "default"
      : status === "rejected"
        ? "destructive"
        : "secondary";
  return <Badge variant={variant}>{status}</Badge>;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
        />
      ))}
      <span className="ml-1 text-sm text-muted-foreground">({rating}/5)</span>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <span className="min-w-[140px] shrink-0 text-muted-foreground">
        {label}
      </span>
      <span className="text-foreground">{value ?? "—"}</span>
    </div>
  );
}

export function ReviewDetailDialog({
  open,
  onOpenChange,
  reviewId,
}: ReviewDetailDialogProps) {
  const { data: review, isLoading } = useReviewDetailQuery(reviewId);
  const approveMutation = useApproveReviewMutation();
  const [rejectOpen, setRejectOpen] = React.useState(false);

  const handleApprove = async () => {
    if (!reviewId) return;
    try {
      await approveMutation.mutateAsync(reviewId);
    } catch {
      // Error toast handled by mutation
    }
  };

  const showApprove =
    review?.status === "pending" || review?.status === "rejected";
  const showReject =
    review?.status === "pending" || review?.status === "approved";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
          </DialogHeader>

          {isLoading || !review ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-5 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Customer</h3>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={review.customer.avatar ?? undefined} alt={review.customer.name} />
                    <AvatarFallback>
                      {review.customer.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{review.customer.name}</p>
                    <p className="text-sm text-muted-foreground">{review.customer.email}</p>
                  </div>
                </div>
              </div>

              {/* Tradie Reference */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Tradie</h3>
                <p className="text-sm">{review.tradieProfile.businessName}</p>
              </div>

              {/* Rating */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Rating</h3>
                <StarRating rating={review.rating} />
              </div>

              {/* Comment */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Comment</h3>
                <p className="text-sm whitespace-pre-wrap">
                  {review.comment || "No comment provided."}
                </p>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Status</h3>
                <div className="space-y-1 text-sm">
                  <Field label="Status" value={<StatusBadge status={review.status} />} />
                  {review.rejectionReason && (
                    <Field label="Rejection Reason" value={review.rejectionReason} />
                  )}
                  <Field label="Submitted" value={formatDate(review.createdAt)} />
                  {review.reviewedAt && (
                    <Field label="Reviewed At" value={formatDate(review.reviewedAt)} />
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            {showApprove && (
              <Button
                onClick={handleApprove}
                disabled={approveMutation.isPending}
              >
                {approveMutation.isPending ? "Approving…" : "Approve"}
              </Button>
            )}
            {showReject && (
              <Button
                variant="destructive"
                onClick={() => setRejectOpen(true)}
                disabled={approveMutation.isPending}
              >
                Reject
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {reviewId && (
        <ReviewRejectDialog
          open={rejectOpen}
          onOpenChange={setRejectOpen}
          mode="single"
          reviewId={reviewId}
        />
      )}
    </>
  );
}
