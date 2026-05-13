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

interface BulkRejectInput {
  ids: string[];
  rejectionReason: string;
}

export function useBulkRejectReviewsMutation(): UseMutationResult<
  BulkActionResult,
  unknown,
  BulkRejectInput
> {
  const queryClient = useQueryClient();
  const apiErrorToast = useApiErrorToast();

  return useMutation({
    mutationFn: ({ ids, rejectionReason }: BulkRejectInput) =>
      adminReviewsRepository.bulkReject(ids, rejectionReason),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all() });
      toast({
        title: "Bulk reject complete",
        description: `${result.processed} rejected, ${result.failed} failed`,
      });
    },
    onError: apiErrorToast,
  });
}
