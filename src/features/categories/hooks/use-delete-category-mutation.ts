/**
 * `useDeleteCategoryMutation`: React Query wrapper around
 * `adminCategoriesRepository.softDelete` (Requirements 4.9, 4.10,
 * 4.11, 8.6, design.md §5.6).
 *
 * On success, invalidates the categories list cache and surfaces a
 * "Category deleted" toast so the operator sees a consistent
 * confirmation. On failure, routes through the shared
 * `useApiErrorToast` bridge.
 */

import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";

import { adminCategoriesRepository } from "@/features/categories/categories.repository";
import { useApiErrorToast } from "@/hooks/use-api-error-toast";
import { toast } from "@/hooks/use-toast";
import { queryKeys } from "@/lib/query-keys";

export function useDeleteCategoryMutation(): UseMutationResult<
  void,
  unknown,
  string
> {
  const queryClient = useQueryClient();
  const apiErrorToast = useApiErrorToast();

  return useMutation({
    mutationFn: (id: string) => adminCategoriesRepository.softDelete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all() });
      toast({ title: "Category deleted" });
    },
    onError: apiErrorToast,
  });
}
