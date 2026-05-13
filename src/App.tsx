/**
 * Root provider composition (Requirement 12.5).
 *
 * Order matters and is locked to:
 *
 *   Query_Provider
 *     └── Theme_Provider
 *           └── BrowserRouter
 *                 └── Auth_Provider
 *                       └── App_Router
 *
 * Rationale:
 *   - `QueryProvider` is outermost so every descendant — including the
 *     auth hydration effect inside `AuthProvider` — can call React Query
 *     hooks through the same client.
 *   - `ThemeProvider` is independent of data and routing; placing it
 *     above the router lets `/login` (which renders outside `AppLayout`)
 *     still react to theme changes.
 *   - `BrowserRouter` sits above `AuthProvider` so the provider can call
 *     `useLocation`/`useNavigate`-adjacent hooks internally if needed,
 *     and so `ProtectedRoute` + `AppRouter` share a single router
 *     context.
 *   - `AuthProvider` wraps `AppRouter` so routing decisions (including
 *     the `/login` ↔ authenticated bounce in `AppRouter`) observe the
 *     same auth state.
 *
 * This file intentionally contains no feature logic, data fetching, or
 * UI beyond the provider chain.
 */

import { BrowserRouter } from "react-router-dom";

import { AuthProvider } from "@/providers/auth-provider";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { AppRouter } from "@/router";

function App() {
  return (
    <QueryProvider>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <AppRouter />
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryProvider>
  );
}

export default App;
