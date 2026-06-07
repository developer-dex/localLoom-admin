import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";

import { adminTradiesRepository } from "@/features/tradies/tradies.repository";
import type { DeleteUserResult } from "@/features/tradies/tradies.repository";
import { useApiErrorToast } from "@/hooks/use-api-error-toast";
import { toast } from "@/hooks/use-toast";
import { queryKeys } from "@/lib/query-keys";

export function useDeleteUserMutation(): UseMutationResult<
  DeleteUserResult,
  unknown,
  string
> {
  const queryClient = useQueryClient();
  const apiErrorToast = useApiErrorToast();

  return useMutation({
    mutationFn: (userId: string) => adminTradiesRepository.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tradies.all() });
      toast({ title: "User deleted successfully" });
    },
    onError: apiErrorToast,
  });
}
