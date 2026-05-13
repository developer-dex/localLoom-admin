/**
 * `useUpdateRegionMutation`: React Query wrapper around
 * `adminRegionsRepository.update` (Requirements 4.9, 4.10, 4.11,
 * 9.4, design.md §5.6).
 *
 * Takes a `{ id, input }` payload so the mutation can route to
 * `/api/admin/regions/:id`. On success it invalidates the
 * regions list cache and surfaces a "Region updated" toast; on
 * failure it routes through the shared `useApiErrorToast` bridge.
 */

import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";

import { adminRegionsRepository } from "@/features/regions/regions.repository";
import type {
  Region,
  UpdateRegionInput,
} from "@/features/regions/regions.types";
import { useApiErrorToast } from "@/hooks/use-api-error-toast";
import { toast } from "@/hooks/use-toast";
import { queryKeys } from "@/lib/query-keys";

export interface UpdateRegionMutationInput {
  id: string;
  input: UpdateRegionInput;
}

export function useUpdateRegionMutation(): UseMutationResult<
  Region,
  unknown,
  UpdateRegionMutationInput
> {
  const queryClient = useQueryClient();
  const apiErrorToast = useApiErrorToast();

  return useMutation({
    mutationFn: ({ id, input }: UpdateRegionMutationInput) =>
      adminRegionsRepository.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.regions.all() });
      toast({ title: "Region updated" });
    },
    onError: apiErrorToast,
  });
}
