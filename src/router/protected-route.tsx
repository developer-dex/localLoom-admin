/**
 * `Protected_Route` guard (Requirements 5.8, 5.9, 11.2, 11.3).
 *
 * Behaviour matrix driven by `useAuth().status`:
 *
 *   status              render
 *   ------------------  ------------------------------------------------
 *   "idle"              full-page `<PageSkeleton />`  (defensive; the
 *                       provider normally starts in `hydrating` or
 *                       `unauthenticated`, but we treat `idle` the same
 *                       as `hydrating` so the UI never flashes a redirect
 *                       before state settles — Req 5.9)
 *   "hydrating"         full-page `<PageSkeleton />`  (Req 5.9)
 *   "unauthenticated"   `<Navigate to="/login?redirectTo=<encoded>">`
 *                       with `replace` so the guarded URL does not linger
 *                       in history (Req 11.3). `redirectTo` captures both
 *                       `pathname` and `search` so query strings survive
 *                       the round-trip, and is URL-encoded so values like
 *                       `?filter=foo&tab=bar` stay intact through the
 *                       `/login?redirectTo=` wrapper.
 *   "authenticated"     `<Outlet />`  (Req 11.2 — nested layout renders)
 *
 * `LoginPage` is responsible for validating the `redirectTo` value on
 * login success (Req 11.4); this component only *sets* it.
 */

import { Navigate, Outlet, useLocation } from "react-router-dom";

import { PageSkeleton } from "@/components/layout/page-skeleton";
import { useAuth } from "@/providers/auth-provider";

export function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "idle" || status === "hydrating") {
    return <PageSkeleton />;
  }

  if (status !== "authenticated") {
    const redirectTo = encodeURIComponent(
      `${location.pathname}${location.search}`,
    );
    return <Navigate to={`/login?redirectTo=${redirectTo}`} replace />;
  }

  return <Outlet />;
}
