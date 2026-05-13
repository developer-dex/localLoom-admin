import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import { adminReviewsRepository } from "@/features/reviews/reviews.repository";
import type { ReviewDetail } from "@/features/reviews/reviews.types";

export function useReviewDetailQuery(
  id: string | undefined
): UseQueryResult<ReviewDetail, unknown> {
  return useQuery({
    queryKey: queryKeys.reviews.detail(id!),
    queryFn: () => adminReviewsRepository.getById(id!),
    enabled: !!id,
  });
}
