/**
 * `useDashboardCounts`: derives Categories and Regions counts for the
 * dashboard landing page (Requirements 4.9, 7.2, design.md §10.1).
 *
 * Per design.md §10.1 the dashboard reuses `useCategoriesQuery` and
 * `useRegionsQuery` from the categories and regions Feature_Modules.
 * Those hooks ship with tasks 16.5 and 17.5 respectively — they do not
 * exist yet — so this hook issues the two list queries inline against
 * `ADMIN_PATHS.categories.root` and `ADMIN_PATHS.regions.root` via
 * `apiClient`.
 *
 * The query keys are the SAME centralized tuples that the future
 * dedicated hooks will use (`queryKeys.categories.all()`,
 * `queryKeys.regions.all()`). React Query dedupes by key, so once
 * `useCategoriesQuery` / `useRegionsQuery` land they share the cache
 * with this hook automatically — no refactor is required here. The
 * cached value shape must therefore match what the future hooks will
 * cache: a normalized array of rows, NOT just the count.
 *
 * The backend list endpoints may return either a plain array or a
 * paginated envelope `{ items, pagination }` (see design.md §5.5
 * `AdminCategoriesRepository.list`). Both shapes are normalized to an
 * array before `.length` is taken, so the consumer never needs to know
 * which envelope the backend happened to pick.
 *
 * `isLoading` is true while EITHER underlying query is still loading so
 * the dashboard can render both `Skeleton`s in lockstep; `isError` is
 * true if either query rejected.
 */

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/api/client";
import { ADMIN_PATHS } from "@/api/paths";
import { queryKeys } from "@/lib/query-keys";

interface Paginated<T> {
  items: T[];
}

/** Normalize `T[] | { items, pagination }` to a plain array. */
function normalizeList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  const items = (data as Paginated<T> | null | undefined)?.items;
  return Array.isArray(items) ? items : [];
}

async function fetchCategories(): Promise<unknown[]> {
  const res = await apiClient.get(ADMIN_PATHS.categories.root);
  return normalizeList(res.data?.data);
}

async function fetchRegions(): Promise<unknown[]> {
  const res = await apiClient.get(ADMIN_PATHS.regions.root);
  return normalizeList(res.data?.data);
}

export interface DashboardCounts {
  categoriesCount: number;
  regionsCount: number;
  isLoading: boolean;
  isError: boolean;
}

export function useDashboardCounts(): DashboardCounts {
  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories.all(),
    queryFn: fetchCategories,
  });

  const regionsQuery = useQuery({
    queryKey: queryKeys.regions.all(),
    queryFn: fetchRegions,
  });

  return {
    categoriesCount: categoriesQuery.data?.length ?? 0,
    regionsCount: regionsQuery.data?.length ?? 0,
    isLoading: categoriesQuery.isLoading || regionsQuery.isLoading,
    isError: categoriesQuery.isError || regionsQuery.isError,
  };
}
