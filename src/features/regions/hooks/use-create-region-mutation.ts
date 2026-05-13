/**
 * `useCreateRegionMutation`: React Query wrapper around
 * `adminRegionsRepository.create` (Requirements 4.9, 4.10, 4.11,
 * 9.3, design.md §5.6).
 *
 * Responsibilities:
 *   - Issue the JSON `POST /api/admin/regions` request via the
 *     repository.
 *   - On success, invalidate `queryKeys.regions.all()` so every
 *     cached list refetches automatically, and surface a "Region
 *     created" toast (Req 4.10).
 *   - On failure, route through the shared `useApiErrorToast` bridge
 *     so the admin sees a consistent destructive toast (Req 4.11).
 *
 * `useQueryClient` and `useApiErrorToast` are captured at hook top so
 * the callbacks referenced inside `useMutation` don't close over stale
 * values across renders.
 */

import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";

import { adminRegionsRepository } from "@/features/regions/regions.repository";
import type {
  CreateRegionInput,
  Region,
} from "@/features/regions/regions.types";
import { useApiErrorToast } from "@/hooks/use-api-error-toast";
import { toast } from "@/hooks/use-toast";
import { queryKeys } from "@/lib/query-keys";

export function useCreateRegionMutation(): UseMutationResult<
  Region,
  unknown,
  CreateRegionInput
> {
  const queryClient = useQueryClient();
  const apiErrorToast = useApiErrorToast();

  return useMutation({
    mutationFn: (input: CreateRegionInput) =>
      adminRegionsRepository.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.regions.all() });
      toast({ title: "Region created" });
    },
    onError: apiErrorToast,
  });
}
