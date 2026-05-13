/**
 * `useCategoriesQuery`: React Query wrapper around
 * `adminCategoriesRepository.list` (Requirements 4.9, 8.1,
 * design.md §5.6).
 *
 * Keyed by `queryKeys.categories.all()` so the categories page, the
 * dashboard counts hook, and every mutation's invalidation call
 * converge on the same cache entry.
 *
 * Errors surface as `ApiError` instances (Req 4.5). Consumers are
 * expected to render a toast via `useApiErrorToast` or fall back to
 * an empty-state row in the table.
 */

import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import { adminCategoriesRepository } from "@/features/categories/categories.repository";
import type { Category } from "@/features/categories/categories.types";
import { queryKeys } from "@/lib/query-keys";

export function useCategoriesQuery(): UseQueryResult<Category[], unknown> {
  return useQuery({
    queryKey: queryKeys.categories.all(),
    queryFn: () => adminCategoriesRepository.list(),
  });
}
