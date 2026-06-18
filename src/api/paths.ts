/**
 * Admin API path constants.
 *
 * Every Repository constructs URLs from this object so path strings never
 * appear as raw literals in feature code (Requirement 4.6, 4.7).
 *
 * Paths here are RELATIVE to the admin base URL. The Api_Client adds the
 * `${env.apiBaseUrl}/api/admin` prefix exactly once at axios-instance
 * creation, so every constant below starts at `/auth/...`, `/categories`,
 * `/regions`, etc.
 *
 * The reserved groups (`users`, `tradies`, `reviews`, `reports`,
 * `dashboard`, `suburbs`) are included per design.md §5.1 so that the
 * upcoming backend modules (Requirement 10) can be enabled by flipping a
 * feature flag and wiring a Repository without editing this module.
 */

export const ADMIN_PATHS = {
  auth: {
    login: "/auth/login",
    refreshToken: "/auth/refresh-token",
    logout: "/auth/logout",
    profile: "/auth/profile",
    changePassword: "/auth/change-password",
  },
  categories: {
    root: "/categories",
    byId: (id: string) => `/categories/${id}`,
  },
  regions: {
    root: "/regions",
    byId: (id: string) => `/regions/${id}`,
  },
  users: {
    root: "/users",
    byId: (id: string) => `/users/${id}`,
  },
  tradies: {
    root: "/tradies",
    byId: (id: string) => `/tradies/${id}`,
    approve: (id: string) => `/tradies/${id}/approve`,
    reject: (id: string) => `/tradies/${id}/reject`,
    bulkApprove: "/tradies/bulk-approve",
    bulkReject: "/tradies/bulk-reject",
  },
  reviews: {
    root: "/reviews",
    byId: (id: string) => `/reviews/${id}`,
    approve: (id: string) => `/reviews/${id}/approve`,
    reject: (id: string) => `/reviews/${id}/reject`,
    bulkApprove: "/reviews/bulk-approve",
    bulkReject: "/reviews/bulk-reject",
  },
  reports: {
    root: "/reports",
  },
  dashboard: {
    stats: "/dashboard/stats",
    recentActivity: "/dashboard/recent-activity",
  },
  helpDesk: {
    root: "/help-desk",
    byId: (id: string) => `/help-desk/${id}`,
    resolve: (id: string) => `/help-desk/${id}/resolve`,
  },
  suburbs: {
    root: "/locations/suburbs",
    byId: (id: string) => `/locations/suburbs/${id}`,
  },
} as const;
