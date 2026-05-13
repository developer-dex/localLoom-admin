import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";

import { adminTradiesRepository } from "@/features/tradies/tradies.repository";
import { useApiErrorToast } from "@/hooks/use-api-error-toast";
import { toast } from "@/hooks/use-toast";
import { queryKeys } from "@/lib/query-keys";

export function useApproveTradieMutation(): UseMutationResult<
  void,
  unknown,
  string
> {
  const queryClient = useQueryClient();
  const apiErrorToast = useApiErrorToast();

  return useMutation({
    mutationFn: (id: string) => adminTradiesRepository.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tradies.all() });
      toast({ title: "Tradie approved" });
    },
    onError: apiErrorToast,
  });
}
