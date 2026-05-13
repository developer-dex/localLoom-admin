/**
 * Public API for the auth Feature_Module (Requirement 12.2, task 14.7,
 * design.md §10.1).
 *
 * Re-exports the page components (default-exported as `LoginPage` and
 * `ChangePasswordPage`), the repository + storage singletons and their
 * types, and every React Query hook so consumers — notably the router,
 * the app layout's user menu, and future surfaces — can reach the
 * module through a single import path rather than deep-linking into
 * `./pages`, `./hooks`, `./auth.repository`, etc.
 */

export { default as LoginPage } from "./pages/login-page";
export { default as ChangePasswordPage } from "./pages/change-password-page";

export {
  AdminAuthRepository,
  adminAuthRepository,
} from "./auth.repository";

export { authStorage } from "./auth.storage";

export type { LoginTokens, LoginResponseData } from "./auth.types";

export {
  useLoginMutation,
  type LoginMutationInput,
} from "./hooks/use-login-mutation";
export { useLogoutMutation } from "./hooks/use-logout-mutation";
export { useProfileQuery } from "./hooks/use-profile-query";
export {
  useChangePasswordMutation,
  type ChangePasswordMutationInput,
} from "./hooks/use-change-password-mutation";
