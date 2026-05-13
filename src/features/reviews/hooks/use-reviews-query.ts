import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import type { PaginatedResult } from "@/types/api";
import { queryKeys } from "@/lib/query-keys";
import { adminReviewsRepository } from "@/features/reviews/reviews.repository";
import type { ReviewListItem, ReviewListParams } from "@/features/reviews/reviews.types";

export function useReviewsQuery(
  params: ReviewListParams
): UseQueryResult<PaginatedResult<ReviewListItem>, unknown> {
  return useQuery({
    queryKey: queryKeys.reviews.list(params as unknown as Record<string, unknown>),
    queryFn: () => adminReviewsRepository.list(params),
  });
}
