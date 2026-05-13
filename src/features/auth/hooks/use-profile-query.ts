/**
 * `useProfileQuery`: React Query wrapper around
 * `adminAuthRepository.profile` (Requirements 4.9, 5.6, 7.1,
 * design.md §5.6, §10.1).
 *
 * Keyed by `queryKeys.auth.profile()` so any component — in particular
 * the dashboard — can consume the cached admin profile without issuing
 * a second network round-trip after the one already performed by
 * `Auth_Provider` during hydration.
 *
 * `enabled: authenticated` guards against firing the query before the
 * user has a valid session (would redirect-loop through `/login`), and
 * is the primary reason this hook is preferred over calling the
 * repository directly from feature components.
 *
 * Errors surface as `ApiError` instances (design.md §5.3, Req 4.5).
 * Consumers typically pass the resulting `error` through
 * `useApiErrorToast` or fall back to the cached profile on the
 * Auth_Context.
 */

import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import { adminAuthRepository } from "@/features/auth/auth.repository";
import { queryKeys } from "@/lib/query-keys";
import { useAuth } from "@/providers/auth-provider";
import type { Admin } from "@/types/admin";

export function useProfileQuery(): UseQueryResult<Admin, unknown> {
  const { status } = useAuth();
  return useQuery({
    queryKey: queryKeys.auth.profile(),
    queryFn: () => adminAuthRepository.profile(),
    enabled: status === "authenticated",
  });
}
