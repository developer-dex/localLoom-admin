/**
 * `ReviewDetailPage`: route page at `/reviews/:id` showing the full
 * customer review inside the App_Shell. Replaces the previous
 * `ReviewDetailDialog` popup.
 */

import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Star } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/wrappers/page-header";
import { useReviewDetailQuery } from "@/features/reviews/hooks/use-review-detail-query";
import { useApproveReviewMutation } from "@/features/reviews/hooks/use-approve-review-mutation";
import { ReviewRejectDialog } from "@/features/reviews/components/review-reject-dialog";
import type { ApprovalStatus } from "@/features/reviews/reviews.types";

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
    <div
      className="flex items-center gap-0.5"
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={
            i < rating
              ? "h-4 w-4 fill-primary text-primary"
              : "h-4 w-4 text-muted-foreground"
          }
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

export default function ReviewDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    data: review,
    isLoading,
    isError,
    error,
    refetch,
  } = useReviewDetailQuery(id);
  const approveMutation = useApproveReviewMutation();
  const [rejectOpen, setRejectOpen] = React.useState(false);

  const handleBack = React.useCallback(() => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/reviews");
    }
  }, [navigate]);

  const handleApprove = async () => {
    if (!id) return;
    try {
      await approveMutation.mutateAsync(id);
    } catch {
      // Error toast handled by mutation
    }
  };

  const showApprove =
    review?.status === "pending" || review?.status === "rejected";
  const showReject =
    review?.status === "pending" || review?.status === "approved";

  return (
    <div className="space-y-6">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleBack}
        className="-ml-2 w-fit"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back
      </Button>

      <PageHeader
        title="Review Details"
        description="Moderate this customer review."
      />

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-full" />
          ))}
        </div>
      ) : isError ? (
        <div className="space-y-3 rounded-md border border-border bg-card p-4">
          <p className="text-sm text-destructive">
            {(error as Error)?.message ?? "Failed to load review."}
          </p>
          <Button type="button" variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : !review ? (
        <div className="space-y-3 rounded-md border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Review not found.</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate("/reviews")}
          >
            Back to reviews
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-6 rounded-md border border-border bg-card p-6">
            {/* Customer Info */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Customer</h3>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={review.customer.avatar ?? undefined}
                    alt={review.customer.name}
                  />
                  <AvatarFallback>
                    {review.customer.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{review.customer.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {review.customer.email}
                  </p>
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
              <p className="whitespace-pre-wrap text-sm">
                {review.comment || "No comment provided."}
              </p>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Status</h3>
              <div className="space-y-1 text-sm">
                <Field
                  label="Status"
                  value={<StatusBadge status={review.status} />}
                />
                {review.rejectionReason && (
                  <Field
                    label="Rejection Reason"
                    value={review.rejectionReason}
                  />
                )}
                <Field label="Submitted" value={formatDate(review.createdAt)} />
                {review.reviewedAt && (
                  <Field
                    label="Reviewed At"
                    value={formatDate(review.reviewedAt)}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
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
          </div>
        </>
      )}

      {id && (
        <ReviewRejectDialog
          open={rejectOpen}
          onOpenChange={setRejectOpen}
          mode="single"
          reviewId={id}
        />
      )}
    </div>
  );
}
