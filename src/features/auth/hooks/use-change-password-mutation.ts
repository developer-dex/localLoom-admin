/**
 * `useChangePasswordMutation`: React Query wrapper around
 * `adminAuthRepository.changePassword` (Requirements 4.9, 5.11,
 * design.md §5.6).
 *
 * On success this hook surfaces a shadcn toast — unlike the login/logout
 * mutation hooks, which delegate side effects to `Auth_Provider` —
 * because the change-password flow has no provider counterpart: it
 * neither mutates Auth_Context state nor touches Auth_Storage. Emitting
 * the toast here keeps the `ChangePasswordPage` component free of
 * cross-cutting feedback logic while still giving callers the raw
 * mutation object (`isPending`, `error`, `reset`, etc.) they need to
 * drive form UI.
 *
 * Errors propagate unchanged as `ApiError` instances via the Api_Client
 * response interceptor (design.md §5.3, Req 4.5). Callers decide
 * whether to surface field errors inline or route them through
 * `useApiErrorToast`.
 */

import { useMutation, type UseMutationResult } from "@tanstack/react-query";

import { adminAuthRepository } from "@/features/auth/auth.repository";
import { useToast } from "@/hooks/use-toast";

export interface ChangePasswordMutationInput {
  currentPassword: string;
  newPassword: string;
}

export function useChangePasswordMutation(): UseMutationResult<
  void,
  unknown,
  ChangePasswordMutationInput
> {
  const { toast } = useToast();
  return useMutation({
    mutationFn: (input: ChangePasswordMutationInput) =>
      adminAuthRepository.changePassword(input),
    onSuccess: () => {
      toast({
        title: "Password changed",
        description: "Your password has been updated successfully.",
      });
    },
  });
}
