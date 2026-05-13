/**
 * Full-page loading skeleton used by `Protected_Route` during auth
 * hydration (Requirement 5.9) and by `App_Router`'s `<Suspense>` fallback
 * while a lazy page chunk is being fetched.
 *
 * Uses the shadcn `Skeleton` primitive directly and composes it with
 * token classes (`bg-background`, `text-foreground`) so the theme flows
 * through without any hex literals (Requirement 3.7).
 */

import { Skeleton } from "@/components/ui/skeleton";

export function PageSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="min-h-dvh w-full bg-background p-6"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}
