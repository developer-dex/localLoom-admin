/**
 * `useUpdateCategoryMutation`: React Query wrapper around
 * `adminCategoriesRepository.update` (Requirements 4.9, 4.10, 4.11,
 * 8.5, design.md §5.6).
 *
 * Takes a `{ id, input }` payload so the mutation can route to
 * `/api/admin/categories/:id`. On success it invalidates the
 * categories list cache and surfaces a "Category updated" toast; on
 * failure it routes through the shared `useApiErrorToast` bridge.
 */

import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";

import { adminCategoriesRepository } from "@/features/categories/categories.repository";
import type {
  Category,
  UpdateCategoryInput,
} from "@/features/categories/categories.types";
import { useApiErrorToast } from "@/hooks/use-api-error-toast";
import { toast } from "@/hooks/use-toast";
import { queryKeys } from "@/lib/query-keys";

export interface UpdateCategoryMutationInput {
  id: string;
  input: UpdateCategoryInput;
}

export function useUpdateCategoryMutation(): UseMutationResult<
  Category,
  unknown,
  UpdateCategoryMutationInput
> {
  const queryClient = useQueryClient();
  const apiErrorToast = useApiErrorToast();

  return useMutation({
    mutationFn: ({ id, input }: UpdateCategoryMutationInput) =>
      adminCategoriesRepository.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all() });
      toast({ title: "Category updated" });
    },
    onError: apiErrorToast,
  });
}
