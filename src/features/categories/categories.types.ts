/**
 * Domain types for the admin categories Feature_Module
 * (Requirements 4.12, 8.3, 8.5, design.md §5.5).
 *
 * `Category` mirrors the shape returned by the backend's
 * `/api/admin/categories` endpoints. `description` and `icon` are
 * declared as nullable because the backend serializes missing values
 * as `null` rather than omitting the field.
 *
 * `CreateCategoryInput` describes the admin-UI-facing shape used when
 * building a multipart request — it accepts a `File` for `icon` rather
 * than a URL because the client is the one uploading the image.
 * `UpdateCategoryInput` is a plain `Partial<CreateCategoryInput>` so
 * the same dialog can drive both create and edit flows, only sending
 * fields the administrator actually modified.
 *
 * `buildCategoryFormData` is the single place that converts a
 * create/update input object into the `multipart/form-data` payload
 * the backend expects (Req 4.12). It obeys two rules:
 *
 *   1. Undefined fields are skipped entirely — we never append an
 *      empty string for an optional field because the backend would
 *      then see `""` and treat it as a cleared value.
 *   2. `icon` is only appended when it is a `File` instance, so an
 *      edit submission that leaves the icon untouched does not
 *      accidentally overwrite the stored asset with random metadata.
 */

/**
 * Admin-facing category record returned by the backend admin API.
 */
export interface Category {
  id: string;
  name: string;
  description?: string | null;
  /** Absolute URL to the category icon asset, or null when unset. */
  icon?: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

/** Payload accepted by `POST /api/admin/categories`. */
export interface CreateCategoryInput {
  name: string;
  description?: string;
  sortOrder?: number;
  icon?: File;
  /** Allow callers to include `isActive` on edits even though create ignores it. */
  isActive?: boolean;
}

/** Payload accepted by `PATCH /api/admin/categories/:id`. */
export type UpdateCategoryInput = Partial<CreateCategoryInput>;

/**
 * Convert a category create/update input into a `FormData` payload.
 *
 * Rules (see file-level JSDoc):
 *   - Omit undefined fields entirely.
 *   - Only append `icon` when it is an actual `File`.
 *   - Numbers and booleans are stringified via `String(value)` so the
 *     server receives them as form fields rather than typed values.
 */
export function buildCategoryFormData(
  input: CreateCategoryInput | UpdateCategoryInput,
): FormData {
  const fd = new FormData();

  if (input.name !== undefined) {
    fd.append("name", input.name);
  }
  if (input.description !== undefined) {
    fd.append("description", input.description);
  }
  if (input.sortOrder !== undefined) {
    fd.append("sortOrder", String(input.sortOrder));
  }
  if (input.isActive !== undefined) {
    fd.append("isActive", String(input.isActive));
  }
  if (input.icon instanceof File) {
    fd.append("icon", input.icon);
  }

  return fd;
}
