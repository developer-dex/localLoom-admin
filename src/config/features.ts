/**
 * Compile-time feature flags for reserved admin modules (Requirement 10.2).
 *
 * The sidebar registry (`app-sidebar.tsx`) and `App_Router`
 * (`src/router/index.tsx`) both read these flags. When a flag is `false`
 * the route is not registered and the sidebar entry is not rendered
 * (Requirement 10.3). Flipping a flag to `true` is the single switch that
 * activates a reserved module once its backend endpoints ship
 * (Requirement 10.4).
 *
 * NOTE: This minimal scaffold ships every flag as `false` on purpose; the
 * full module wiring is completed in task 11.
 */

export const features = {
  users: false,
  tradies: true,
  reviews: true,
  reports: false,
} as const;

export type FeatureKey = keyof typeof features;
