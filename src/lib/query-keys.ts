/**
 * Centralized React Query key factory.
 *
 * Responsibilities (design.md §5.6, Requirements 4.9, 4.10):
 *   - Give every feature module one, and only one, place to produce
 *     query keys so that mutation `onSuccess` handlers can
 *     `invalidateQueries({ queryKey: queryKeys.<resource>.all() })`
 *     without guessing at the exact tuple shape used by the queries.
 *   - Return `readonly` tuples (via `as const`) so TypeScript catches
 *     accidental mutation and so React Query's structural equality stays
 *     stable across renders.
 *
 * Key namespace convention: every key starts with `"admin"` to avoid
 * collisions if this cache is ever shared with another app bundle, then
 * the resource name, then any parameters. Factory functions — rather
 * than constants — leave room for parameterized keys (e.g. detail
 * lookups by id) without changing call sites later.
 */

export const queryKeys = {
  auth: {
    profile: () => ["admin", "auth", "profile"] as const,
  },
  categories: {
    all: () => ["admin", "categories"] as const,
  },
  regions: {
    all: () => ["admin", "regions"] as const,
  },
  tradies: {
    all: () => ["admin", "tradies"] as const,
    list: (params: Record<string, unknown>) =>
      ["admin", "tradies", "list", params] as const,
    detail: (id: string) => ["admin", "tradies", "detail", id] as const,
  },
  reviews: {
    all: () => ["admin", "reviews"] as const,
    list: (params: Record<string, unknown>) =>
      ["admin", "reviews", "list", params] as const,
    detail: (id: string) => ["admin", "reviews", "detail", id] as const,
  },
} as const;

export type QueryKeys = typeof queryKeys;
