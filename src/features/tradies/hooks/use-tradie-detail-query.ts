import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import { adminTradiesRepository } from "@/features/tradies/tradies.repository";
import type { TradieDetail } from "@/features/tradies/tradies.types";

export function useTradieDetailQuery(
  id: string | undefined
): UseQueryResult<TradieDetail, unknown> {
  return useQuery({
    queryKey: queryKeys.tradies.detail(id!),
    queryFn: () => adminTradiesRepository.getById(id!),
    enabled: !!id,
  });
}
