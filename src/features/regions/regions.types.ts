/**
 * Domain types for the admin regions Feature_Module
 * (Requirements 4.8, 9.2, 9.3, 9.4, design.md §5.5).
 *
 * `Region` mirrors the shape returned by the backend's
 * `/api/admin/regions` endpoints. Every record is keyed by its
 * opaque string `id` and carries an `isActive` flag that the UI
 * renders as a shadcn `Badge`.
 *
 * `CreateRegionInput` describes the payload sent to
 * `POST /api/admin/regions`. Unlike the categories module — which
 * uploads an image and therefore ships `multipart/form-data` — the
 * regions endpoints accept a plain JSON body, so these types are
 * used directly as the axios request body. `isActive` is optional
 * because the Zod schema defaults it to `true`, matching the
 * backend's own default.
 *
 * `UpdateRegionInput` is a plain `Partial<CreateRegionInput>` so
 * the same dialog can drive both create and edit flows, only
 * sending fields the administrator actually modified.
 */

/**
 * Admin-facing region record returned by the backend admin API.
 */
export interface Region {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

/** Payload accepted by `POST /api/admin/regions` (JSON body). */
export interface CreateRegionInput {
  name: string;
  /** Defaults to `true` server-side when omitted. */
  isActive?: boolean;
}

/** Payload accepted by `PATCH /api/admin/regions/:id` (JSON body). */
export type UpdateRegionInput = Partial<CreateRegionInput>;
