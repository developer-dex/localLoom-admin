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

interface BulkRejectInput {
  ids: string[];
  rejectionReason: string;
}

export function useBulkRejectTradieMutation(): UseMutationResult<
  BulkActionResult,
  unknown,
  BulkRejectInput
> {
  const queryClient = useQueryClient();
  const apiErrorToast = useApiErrorToast();

  return useMutation({
    mutationFn: ({ ids, rejectionReason }: BulkRejectInput) =>
      adminTradiesRepository.bulkReject(ids, rejectionReason),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tradies.all() });
      toast({
        title: "Bulk reject complete",
        description: `${result.processed} rejected, ${result.failed} failed`,
      });
    },
    onError: apiErrorToast,
  });
}
