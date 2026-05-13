/**
 * `useRegionsQuery`: React Query wrapper around
 * `adminRegionsRepository.list` (Requirements 4.9, 9.1,
 * design.md §5.6).
 *
 * Keyed by `queryKeys.regions.all()` so the regions page, the
 * dashboard counts hook, and every mutation's invalidation call
 * converge on the same cache entry.
 *
 * Errors surface as `ApiError` instances (Req 4.5). Consumers are
 * expected to render a toast via `useApiErrorToast` or fall back to
 * an empty-state row in the table.
 */

import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import { adminRegionsRepository } from "@/features/regions/regions.repository";
import type { Region } from "@/features/regions/regions.types";
import { queryKeys } from "@/lib/query-keys";

export function useRegionsQuery(): UseQueryResult<Region[], unknown> {
  return useQuery({
    queryKey: queryKeys.regions.all(),
    queryFn: () => adminRegionsRepository.list(),
  });
}
