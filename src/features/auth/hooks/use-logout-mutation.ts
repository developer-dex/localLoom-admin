/**
 * `useLogoutMutation`: React Query wrapper around
 * `adminAuthRepository.logout` (Requirements 4.9, 5.7, design.md §5.6).
 *
 * Like `useLoginMutation`, this hook is intentionally minimal: it does
 * NOT clear Auth_Storage or alter `Auth_Context` status. Those actions
 * are handled by `Auth_Provider.logout`, which the layout's user menu
 * invokes. This hook exists for components that need raw mutation
 * state (e.g. a future confirm-before-logout dialog) without pulling
 * in the provider.
 *
 * Because the backend logout is best-effort (Req 5.7), callers are
 * expected to tolerate rejection — `Auth_Provider.logout` does exactly
 * this today.
 */

import { useMutation, type UseMutationResult } from "@tanstack/react-query";

import { adminAuthRepository } from "@/features/auth/auth.repository";

export function useLogoutMutation(): UseMutationResult<void, unknown, void> {
  return useMutation({
    mutationFn: () => adminAuthRepository.logout(),
  });
}
