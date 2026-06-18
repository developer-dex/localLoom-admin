/**
 * `App_Router` (Requirements 5.8, 5.10, 10.3, 11.1, 11.2, 11.6).
 *
 * Route table summary:
 *
 *   Path                  Auth      Lazy  Notes
 *   --------------------  --------  ----  ----------------------------------
 *   /login                public    no    Redirects to /dashboard when the
 *                                         user is already authenticated
 *                                         (Req 5.10). Kept eager so first
 *                                         paint on /login is instant.
 *   /                     guarded   —     <Navigate to="/dashboard" replace>
 *   /dashboard            guarded   yes   Req 7
 *   /categories           guarded   yes   Req 8
 *   /regions              guarded   yes   Req 9
 *   /change-password      guarded   yes   Req 5.11
 *   /users                guarded   yes   Only when features.users   (Req 10.3)
 *   /tradies              guarded   yes   Only when features.tradies (Req 10.3)
 *   /reviews              guarded   yes   Only when features.reviews (Req 10.3)
 *   /reports              guarded   yes   Only when features.reports (Req 10.3)
 *   *                     guarded   yes   <NotFoundPage /> inside the
 *                                         guarded group so unauthenticated
 *                                         visitors are redirected to /login
 *                                         before a 404 is shown (Req 11.6).
 *
 * The guarded group is `<Route element={<ProtectedRoute />}>` wrapping
 * `<Route element={<AppLayout />}>`, so every non-login route flows
 * through the auth check (Req 11.2) and then the shared layout (Req 6.1).
 *
 * Lazy loading is `React.lazy(() => import(...))` + a top-level
 * `<Suspense fallback={<PageSkeleton />}>` so the fallback covers both
 * chunk fetches and any in-tree suspense boundary. `LoginPage` is the
 * only page imported eagerly.
 */

import * as React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { PageSkeleton } from "@/components/layout/page-skeleton";
import { features } from "@/config/features";
import LoginPage from "@/features/auth/pages/login-page";
import { useAuth } from "@/providers/auth-provider";
import { ProtectedRoute } from "@/router/protected-route";

// Lazy-loaded pages. Each target is a default export so `React.lazy` can
// pick it up without an extra adapter.
const AppLayout = React.lazy(
  () => import("@/components/layout/app-layout"),
);
const DashboardPage = React.lazy(
  () => import("@/features/dashboard/pages/dashboard-page"),
);
const CategoriesPage = React.lazy(
  () => import("@/features/categories/pages/categories-page"),
);
const RegionsPage = React.lazy(
  () => import("@/features/regions/pages/regions-page"),
);
const ChangePasswordPage = React.lazy(
  () => import("@/features/auth/pages/change-password-page"),
);
const UsersPage = React.lazy(
  () => import("@/features/users/pages/users-page"),
);
const TradiesPage = React.lazy(
  () => import("@/features/tradies/pages/tradies-page"),
);
const TradieDetailPage = React.lazy(
  () => import("@/features/tradies/pages/tradie-detail-page"),
);
const ReviewsPage = React.lazy(
  () => import("@/features/reviews/pages/reviews-page"),
);
const ReviewDetailPage = React.lazy(
  () => import("@/features/reviews/pages/review-detail-page"),
);
const ReportsPage = React.lazy(
  () => import("@/features/reports/pages/reports-page"),
);
const HelpDeskPage = React.lazy(
  () => import("@/features/help-desk/pages/help-desk-page"),
);
const NotFoundPage = React.lazy(
  () => import("@/features/not-found/pages/not-found-page"),
);

export function AppRouter() {
  const { status } = useAuth();

  return (
    <React.Suspense fallback={<PageSkeleton />}>
      <Routes>
        {/*
         * Public entry point (Req 11.1). When the user is already
         * authenticated, bounce them to /dashboard (Req 5.10) so a manual
         * visit to /login after sign-in does not re-render the form.
         */}
        <Route
          path="/login"
          element={
            status === "authenticated" ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LoginPage />
            )
          }
        />

        {/*
         * Guarded group: ProtectedRoute handles the auth decision,
         * AppLayout provides the persistent shell, everything else is a
         * nested route that renders inside the Outlet.
         */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/regions" element={<RegionsPage />} />
            <Route path="/change-password" element={<ChangePasswordPage />} />

            {/*
             * Reserved modules (Req 10.3): the route only exists while the
             * corresponding flag is `true`. When false the <Route /> is
             * not rendered and react-router falls through to the `*`
             * NotFound entry below — which means navigating to /users
             * with the flag off shows the guarded 404 page rather than a
             * blank screen.
             */}
            {features.users ? (
              <Route path="/users" element={<UsersPage />} />
            ) : null}
            {features.tradies ? (
              <Route path="/tradies" element={<TradiesPage />} />
            ) : null}
            {features.tradies ? (
              <Route path="/tradies/:id" element={<TradieDetailPage />} />
            ) : null}
            {features.reviews ? (
              <Route path="/reviews" element={<ReviewsPage />} />
            ) : null}
            {features.reviews ? (
              <Route path="/reviews/:id" element={<ReviewDetailPage />} />
            ) : null}
            {features.reports ? (
              <Route path="/reports" element={<ReportsPage />} />
            ) : null}
            {features.helpDesk ? (
              <Route path="/help-desk" element={<HelpDeskPage />} />
            ) : null}

            {/*
             * 404 still lives inside the guarded group (Req 11.6) so an
             * unauthenticated visitor hitting an unknown path is first
             * redirected to /login by ProtectedRoute, then sees the 404
             * only after signing in.
             */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
      </Routes>
    </React.Suspense>
  );
}
