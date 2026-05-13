/**
 * Query_Provider: owns the admin panel's single React Query cache.
 *
 * Responsibilities (design.md §5.6, Requirements 1.6, 12.4):
 *   - Create one `QueryClient` for the whole SPA with defaults tuned for
 *     an admin back office: one retry on transient failures so we don't
 *     mask real bugs, and no window-focus refetch so returning to the
 *     tab after a long form edit doesn't silently invalidate the view.
 *   - Expose `QueryProvider` as the outermost data provider in
 *     `App.tsx`, keeping `App.tsx` to provider composition only
 *     (Requirement 12.5).
 *
 * The client is instantiated in a ref so hot module replacement during
 * development doesn't throw away the cache between renders.
 */

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Lazy-init in a ref so the client survives re-renders and HMR without
  // being rebuilt (which would drop the cache on every state change).
  const clientRef = React.useRef<QueryClient | null>(null);
  if (clientRef.current === null) {
    clientRef.current = createQueryClient();
  }

  return (
    <QueryClientProvider client={clientRef.current}>
      {children}
    </QueryClientProvider>
  );
}
