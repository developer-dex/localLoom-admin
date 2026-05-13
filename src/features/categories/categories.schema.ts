/**
 * Zod schema for the category create/edit form
 * (Requirement 8.3, design.md §5.6).
 *
 * The fields and limits mirror the backend validation rules for
 * `POST|PATCH /api/admin/categories`:
 *   - `name` is required, trimmed, 1..100 characters.
 *   - `description` is optional, trimmed, 0..500 characters. An empty
 *     string is accepted because `<Textarea>` produces `""` when the
 *     user clears the field; the repository layer drops empty strings
 *     before sending the multipart payload so the backend never
 *     receives a blank description.
 *   - `sortOrder` is an optional non-negative integer. `z.coerce.number`
 *     is used because RHF surfaces numeric inputs as strings.
 *   - `icon` is an optional `File`; the dialog never pre-fills this
 *     field on edit, so leaving it untouched keeps the stored asset.
 *
 * Keeping these constraints in sync with the backend ensures the
 * client rejects invalid input with the same error shape the server
 * would return, so the user experience is consistent regardless of
 * which layer catches the error first.
 */

import { z } from "zod";

export const categoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or fewer"),
  description: z
    .string()
    .trim()
    .max(500, "Description must be 500 characters or fewer")
    .optional()
    .or(z.literal("")),
  sortOrder: z.coerce
    .number()
    .int("Sort order must be a whole number")
    .min(0, "Sort order must be 0 or greater")
    .optional(),
  icon: z.instanceof(File).optional(),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
