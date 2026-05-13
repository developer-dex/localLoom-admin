/**
 * Domain types for the admin reviews feature module.
 *
 * These interfaces mirror the shapes returned by the backend's
 * `/api/admin/reviews` endpoints. `ReviewListItem` is the compact
 * representation used in the paginated list view; `ReviewDetail`
 * extends it with additional fields needed by the detail dialog.
 */

export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface ReviewListItem {
  id: string;
  rating: number;
  comment: string | null;
  status: ApprovalStatus;
  createdAt: string;
  customer: { id: string; name: string };
  tradieProfile: { id: string; businessName: string };
}

export interface ReviewDetail extends ReviewListItem {
  customer: { id: string; name: string; email: string; avatar: string | null };
  tradieProfile: { id: string; businessName: string };
  rejectionReason: string | null;
  reviewedByAdmin: string | null;
  reviewedAt: string | null;
}

export interface ReviewListParams {
  page: number;
  limit: number;
  status?: ApprovalStatus;
  search?: string;
}

export interface BulkActionResult {
  processed: number;
  failed: number;
}
