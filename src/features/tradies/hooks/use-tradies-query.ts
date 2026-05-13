import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import type { PaginatedResult } from "@/types/api";
import { queryKeys } from "@/lib/query-keys";
import { adminTradiesRepository } from "@/features/tradies/tradies.repository";
import type { TradieListItem, TradieListParams } from "@/features/tradies/tradies.types";

export function useTradiesQuery(
  params: TradieListParams
): UseQueryResult<PaginatedResult<TradieListItem>, unknown> {
  return useQuery({
    queryKey: queryKeys.tradies.list(params as unknown as Record<string, unknown>),
    queryFn: () => adminTradiesRepository.list(params),
  });
}
