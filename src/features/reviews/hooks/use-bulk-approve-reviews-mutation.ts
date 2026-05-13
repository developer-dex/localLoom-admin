import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";

import { adminReviewsRepository } from "@/features/reviews/reviews.repository";
import type { BulkActionResult } from "@/features/reviews/reviews.types";
import { useApiErrorToast } from "@/hooks/use-api-error-toast";
import { toast } from "@/hooks/use-toast";
import { queryKeys } from "@/lib/query-keys";

export function useBulkApproveReviewsMutation(): UseMutationResult<
  BulkActionResult,
  unknown,
  string[]
> {
  const queryClient = useQueryClient();
  const apiErrorToast = useApiErrorToast();

  return useMutation({
    mutationFn: (ids: string[]) => adminReviewsRepository.bulkApprove(ids),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all() });
      toast({
        title: "Bulk approve complete",
        description: `${result.processed} approved, ${result.failed} failed`,
      });
    },
    onError: apiErrorToast,
  });
}
