/**
 * `DashboardPage`: authenticated landing route at `/dashboard`
 * (Requirements 7.1, 7.2, 7.3, 7.4, design.md §10.1).
 *
 * Layout:
 *   - `PageHeader` shows the admin's name as the heading and a
 *     formatted "Signed in as <role> · Last login <timestamp>" line as
 *     the description. `lastLogin` is null on first-ever sign-in, so we
 *     fall back to "Never" rather than printing "null".
 *   - Two `Card`s render the Categories and Regions counts. While the
 *     underlying list queries are loading, the count is replaced with a
 *     `Skeleton` so both cards resolve in lockstep (Req 7.4).
 *   - Styling is token-driven exclusively (`text-muted-foreground`,
 *     `text-foreground`, etc.) per Req 3.7.
 *
 * Counts come from `useDashboardCounts`, which today fetches lists
 * inline but uses the centralized `queryKeys.categories.all()` /
 * `queryKeys.regions.all()` keys. Once tasks 16.5 / 17.5 introduce
 * dedicated `useCategoriesQuery` / `useRegionsQuery` hooks, they share
 * the same cache and this page keeps working without changes (design
 * §10.1).
 */

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/wrappers/page-header";
import { useDashboardCounts } from "@/features/dashboard/hooks/use-dashboard-counts";
import { useAuth } from "@/providers/auth-provider";
import type { AdminRole } from "@/types/admin";

const ROLE_LABELS: Record<AdminRole, string> = {
  admin: "Admin",
  super_admin: "Super admin",
};

/** Pretty-prints a role, falling back to the raw value for unknown strings. */
function formatRole(role: string): string {
  return (ROLE_LABELS as Record<string, string>)[role] ?? role;
}

/** Formats an ISO timestamp using the browser locale; returns "Never" for null. */
function formatLastLogin(lastLogin: string | null): string {
  if (!lastLogin) return "Never";
  const date = new Date(lastLogin);
  if (Number.isNaN(date.getTime())) return "Never";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function DashboardPage() {
  const { admin } = useAuth();
  const { categoriesCount, regionsCount, isLoading } = useDashboardCounts();

  const headingTitle = admin?.name ?? "Dashboard";
  const headingDescription = admin
    ? `Signed in as ${formatRole(admin.role)} · Last login ${formatLastLogin(admin.lastLogin)}`
    : undefined;

  return (
    <div className="space-y-6">
      <PageHeader title={headingTitle} description={headingDescription} />

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          title="Categories"
          description="Service categories tradies can be listed under."
          value={categoriesCount}
          isLoading={isLoading}
        />
        <StatCard
          title="Regions"
          description="Service regions available for bookings."
          value={regionsCount}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  description: string;
  value: number;
  isLoading: boolean;
}

function StatCard({ title, description, value, isLoading }: StatCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-9 w-20" />
        ) : (
          <p className="text-3xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

