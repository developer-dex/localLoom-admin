/**
 * Public API for the reviews Feature_Module.
 * Re-exports page, hooks, repository, schema, types, and components.
 */

export { default as ReviewsPage } from "./pages/reviews-page";

// Repository
export { adminReviewsRepository } from "./reviews.repository";

// Types
export type {
  ApprovalStatus,
  ReviewListItem,
  ReviewDetail,
  ReviewListParams,
  BulkActionResult,
} from "./reviews.types";

// Schema
export { rejectReviewSchema } from "./reviews.schema";
export type { RejectReviewFormValues } from "./reviews.schema";

// Hooks
export { useReviewsQuery } from "./hooks/use-reviews-query";
export { useReviewDetailQuery } from "./hooks/use-review-detail-query";
export { useApproveReviewMutation } from "./hooks/use-approve-review-mutation";
export { useRejectReviewMutation } from "./hooks/use-reject-review-mutation";
export { useBulkApproveReviewsMutation } from "./hooks/use-bulk-approve-reviews-mutation";
export { useBulkRejectReviewsMutation } from "./hooks/use-bulk-reject-reviews-mutation";

// Components
export { ReviewRejectDialog } from "./components/review-reject-dialog";
export { ReviewDetailDialog } from "./components/review-detail-dialog";
export { ReviewBulkToolbar } from "./components/review-bulk-toolbar";
