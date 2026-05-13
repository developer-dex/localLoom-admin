/**
 * `useDeleteRegionMutation`: React Query wrapper around
 * `adminRegionsRepository.softDelete` (Requirements 4.9, 4.10,
 * 4.11, 9.5, design.md §5.6).
 *
 * On success, invalidates the regions list cache and surfaces a
 * "Region deleted" toast so the operator sees a consistent
 * confirmation. On failure, routes through the shared
 * `useApiErrorToast` bridge.
 */

import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";

import { adminRegionsRepository } from "@/features/regions/regions.repository";
import { useApiErrorToast } from "@/hooks/use-api-error-toast";
import { toast } from "@/hooks/use-toast";
import { queryKeys } from "@/lib/query-keys";

export function useDeleteRegionMutation(): UseMutationResult<
  void,
  unknown,
  string
> {
  const queryClient = useQueryClient();
  const apiErrorToast = useApiErrorToast();

  return useMutation({
    mutationFn: (id: string) => adminRegionsRepository.softDelete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.regions.all() });
      toast({ title: "Region deleted" });
    },
    onError: apiErrorToast,
  });
}
