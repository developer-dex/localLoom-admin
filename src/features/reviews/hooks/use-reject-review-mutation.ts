import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";

import { adminReviewsRepository } from "@/features/reviews/reviews.repository";
import { useApiErrorToast } from "@/hooks/use-api-error-toast";
import { toast } from "@/hooks/use-toast";
import { queryKeys } from "@/lib/query-keys";

interface RejectReviewInput {
  id: string;
  rejectionReason: string;
}

export function useRejectReviewMutation(): UseMutationResult<
  void,
  unknown,
  RejectReviewInput
> {
  const queryClient = useQueryClient();
  const apiErrorToast = useApiErrorToast();

  return useMutation({
    mutationFn: ({ id, rejectionReason }: RejectReviewInput) =>
      adminReviewsRepository.reject(id, rejectionReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all() });
      toast({ title: "Review rejected" });
    },
    onError: apiErrorToast,
  });
}
