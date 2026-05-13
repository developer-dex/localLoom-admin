/**
 * Shared domain types for the backend envelope and paginated payloads.
 *
 * These match the response envelope the LocalLoom backend wraps every
 * `/api/admin/*` response with: `{ success, message, data, errors? }`.
 *
 * The `errors` array can contain either plain strings or `{ field?, message }`
 * objects. `src/api/errors.ts` is responsible for mapping the latter shape into
 * `ApiError.fieldErrors` so feature forms can surface per-field validation.
 */

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Array<string | { field?: string; message: string }>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface PaginatedResultMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginatedResultMeta;
}
