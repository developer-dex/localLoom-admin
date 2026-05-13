/**
 * Public API for the dashboard Feature_Module (Requirement 12.2,
 * design.md §10.1).
 *
 * Exposes the page component (default-exported as `DashboardPage` to
 * match the convention used by the other feature modules) and the
 * `useDashboardCounts` hook so other surfaces — or tests — can derive
 * the same counts without reaching through the page component.
 */

export { default as DashboardPage } from "./pages/dashboard-page";
export {
  useDashboardCounts,
  type DashboardCounts,
} from "./hooks/use-dashboard-counts";
