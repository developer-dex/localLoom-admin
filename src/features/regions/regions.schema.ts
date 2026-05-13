/**
 * Zod schema for the region create/edit form
 * (Requirement 9.2, design.md §5.6).
 *
 * The fields and limits mirror the backend validation rules for
 * `POST|PATCH /api/admin/regions`:
 *   - `name` is required, trimmed, 1..100 characters.
 *   - `isActive` is a boolean that defaults to `true` so the
 *     create dialog renders the switch in the enabled position out
 *     of the box, matching the backend's own default.
 *
 * Keeping these constraints in sync with the backend ensures the
 * client rejects invalid input with the same error shape the server
 * would return, so the user experience is consistent regardless of
 * which layer catches the error first.
 */

import { z } from "zod";

export const regionFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or fewer"),
  isActive: z.boolean().default(true),
});

export type RegionFormValues = z.infer<typeof regionFormSchema>;
