import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";

import { adminTradiesRepository } from "@/features/tradies/tradies.repository";
import type { BulkActionResult } from "@/features/tradies/tradies.types";
import { useApiErrorToast } from "@/hooks/use-api-error-toast";
import { toast } from "@/hooks/use-toast";
import { queryKeys } from "@/lib/query-keys";

export function useBulkApproveTradieMutation(): UseMutationResult<
  BulkActionResult,
  unknown,
  string[]
> {
  const queryClient = useQueryClient();
  const apiErrorToast = useApiErrorToast();

  return useMutation({
    mutationFn: (ids: string[]) => adminTradiesRepository.bulkApprove(ids),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tradies.all() });
      toast({
        title: "Bulk approve complete",
        description: `${result.processed} approved, ${result.failed} failed`,
      });
    },
    onError: apiErrorToast,
  });
}
