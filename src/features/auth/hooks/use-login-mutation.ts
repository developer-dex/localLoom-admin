/**
 * `useLoginMutation`: React Query wrapper around
 * `adminAuthRepository.login` (Requirements 4.9, 5.2, design.md §5.6).
 *
 * This hook is a thin, reusable mutation wrapper — it does NOT touch
 * Auth_Storage, does NOT flip `Auth_Context` state, and does NOT invoke
 * any toast helpers. Those responsibilities belong to
 * `Auth_Provider.login` (see `src/providers/auth-provider.tsx`), which
 * is what `LoginPage` actually calls.
 *
 * The hook exists so any consumer that needs raw React Query state
 * (e.g. a future headless login flow, or tests that want to assert on
 * mutation status) can grab `isPending`, `error`, `reset`, etc. without
 * reaching through the provider.
 *
 * Errors propagate unchanged as `ApiError` instances thanks to the
 * Api_Client response interceptor (design.md §5.3, Req 4.5). Callers
 * decide whether to toast, show a field error, or rethrow.
 */

import { useMutation, type UseMutationResult } from "@tanstack/react-query";

import { adminAuthRepository } from "@/features/auth/auth.repository";
import type { LoginResponseData } from "@/features/auth/auth.types";

export interface LoginMutationInput {
  email: string;
  password: string;
}

export function useLoginMutation(): UseMutationResult<
  LoginResponseData,
  unknown,
  LoginMutationInput
> {
  return useMutation({
    mutationFn: (input: LoginMutationInput) =>
      adminAuthRepository.login(input),
  });
}
