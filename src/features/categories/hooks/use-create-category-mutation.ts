/**
 * `useCreateCategoryMutation`: React Query wrapper around
 * `adminCategoriesRepository.create` (Requirements 4.9, 4.10, 4.11,
 * 8.4, design.md §5.6).
 *
 * Responsibilities:
 *   - Issue the multipart `POST /api/admin/categories` request via the
 *     repository.
 *   - On success, invalidate `queryKeys.categories.all()` so every
 *     cached list refetches automatically, and surface a "Category
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

import { adminCategoriesRepository } from "@/features/categories/categories.repository";
import type {
  Category,
  CreateCategoryInput,
} from "@/features/categories/categories.types";
import { useApiErrorToast } from "@/hooks/use-api-error-toast";
import { toast } from "@/hooks/use-toast";
import { queryKeys } from "@/lib/query-keys";

export function useCreateCategoryMutation(): UseMutationResult<
  Category,
  unknown,
  CreateCategoryInput
> {
  const queryClient = useQueryClient();
  const apiErrorToast = useApiErrorToast();

  return useMutation({
    mutationFn: (input: CreateCategoryInput) =>
      adminCategoriesRepository.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all() });
      toast({ title: "Category created" });
    },
    onError: apiErrorToast,
  });
}
