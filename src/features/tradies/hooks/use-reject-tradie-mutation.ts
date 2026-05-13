import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";

import { adminTradiesRepository } from "@/features/tradies/tradies.repository";
import { useApiErrorToast } from "@/hooks/use-api-error-toast";
import { toast } from "@/hooks/use-toast";
import { queryKeys } from "@/lib/query-keys";

interface RejectTradieInput {
  id: string;
  rejectionReason: string;
}

export function useRejectTradieMutation(): UseMutationResult<
  void,
  unknown,
  RejectTradieInput
> {
  const queryClient = useQueryClient();
  const apiErrorToast = useApiErrorToast();

  return useMutation({
    mutationFn: ({ id, rejectionReason }: RejectTradieInput) =>
      adminTradiesRepository.reject(id, rejectionReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tradies.all() });
      toast({ title: "Tradie rejected" });
    },
    onError: apiErrorToast,
  });
}
