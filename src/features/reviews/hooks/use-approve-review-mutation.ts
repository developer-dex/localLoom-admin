import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";

import { adminReviewsRepository } from "@/features/reviews/reviews.repository";
import { useApiErrorToast } from "@/hooks/use-api-error-toast";
import { toast } from "@/hooks/use-toast";
import { queryKeys } from "@/lib/query-keys";

export function useApproveReviewMutation(): UseMutationResult<
  void,
  unknown,
  string
> {
  const queryClient = useQueryClient();
  const apiErrorToast = useApiErrorToast();

  return useMutation({
    mutationFn: (id: string) => adminReviewsRepository.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all() });
      toast({ title: "Review approved" });
    },
    onError: apiErrorToast,
  });
}
