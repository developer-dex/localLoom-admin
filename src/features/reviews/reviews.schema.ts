/**
 * Zod schema for the review rejection reason form.
 *
 * Mirrors the backend validation rule for the `rejectionReason` field
 * on `PATCH /api/admin/reviews/:id/reject` and
 * `POST /api/admin/reviews/bulk-reject`: required, trimmed, 1–1000
 * characters.
 */

import { z } from "zod";

export const rejectReviewSchema = z.object({
  rejectionReason: z
    .string()
    .trim()
    .min(1, "Rejection reason is required")
    .max(1000, "Rejection reason must be 1000 characters or fewer"),
});

export type RejectReviewFormValues = z.infer<typeof rejectReviewSchema>;
