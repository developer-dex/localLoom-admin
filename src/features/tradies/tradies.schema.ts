/**
 * Zod schema for the tradie rejection reason form.
 *
 * Mirrors the backend validation rule for the `rejectionReason` field
 * on `PATCH /api/admin/tradies/:id/reject` and
 * `POST /api/admin/tradies/bulk-reject`: required, trimmed, 1–1000
 * characters.
 */

import { z } from "zod";

export const rejectTradieSchema = z.object({
  rejectionReason: z
    .string()
    .trim()
    .min(1, "Rejection reason is required")
    .max(1000, "Rejection reason must be 1000 characters or fewer"),
});

export type RejectTradieFormValues = z.infer<typeof rejectTradieSchema>;
