/**
 * Auth_Provider: single source of truth for admin authentication state.
 *
 * Responsibilities (design.md §6.3, Requirements 4.4, 5.3, 5.6, 5.7, 11.5):
 *   - Initialize `admin` from `authStorage` so a freshly mounted tree can
 *     render the top-bar name and user menu synchronously on reload.
 *   - Start in `"hydrating"` when an access token is present, then call
 *     `adminAuthRepository.profile()` exactly once to confirm the session;
 *     on 401 the tokens are purged and status flips to `"unauthenticated"`.
 *   - Subscribe to `Api_Client`'s `forced-logout` event so a refresh-
 *     failure mid-session transitions the UI to `/login` via
 *     `Protected_Route` without a manual navigate() call here.
 *   - Expose `login` and `logout` mutations that keep storage + state in
 *     lockstep. `logout` tolerates a failing backend call (best effort).
 *
 * `useAuth()` throws when consumed outside the provider so a missing
 * wrapper fails loudly in development instead of silently defaulting.
 */

import * as React from "react";

import { ApiError } from "@/api/errors";
import { onAuthEvent } from "@/api/client";
import { authStorage } from "@/features/auth/auth.storage";
import { adminAuthRepository } from "@/features/auth/auth.repository";
import type { Admin } from "@/types/admin";

export type AuthStatus =
  | "idle"
  | "hydrating"
  | "authenticated"
  | "unauthenticated";

export interface AuthContextValue {
  status: AuthStatus;
  admin: Admin | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = React.useState<Admin | null>(() =>
    authStorage.getProfile(),
  );
  const [status, setStatus] = React.useState<AuthStatus>(() =>
    authStorage.getAccessToken() ? "hydrating" : "unauthenticated",
  );

  // One-shot profile hydration when an access token was already present
  // on mount. On 401 the tokens are stale, so we purge storage before
  // flipping to `unauthenticated`. Any other error (network, 5xx) also
  // ends in `unauthenticated`: per the design, we don't keep a partially
  // authenticated state around after a failed hydration.
  React.useEffect(() => {
    if (status !== "hydrating") return;
    let cancelled = false;
    adminAuthRepository
      .profile()
      .then((me) => {
        if (cancelled) return;
        authStorage.setProfile(me);
        setAdmin(me);
        setStatus("authenticated");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          authStorage.clear();
        }
        setAdmin(null);
        setStatus("unauthenticated");
      });
    return () => {
      cancelled = true;
    };
  }, [status]);

  // Forced-logout bus (Req 4.4, 11.5): Api_Client emits this when refresh
  // fails; the subscription returns an unsubscribe so React can clean up.
  React.useEffect(() => {
    return onAuthEvent((evt) => {
      if (evt === "forced-logout") {
        setAdmin(null);
        setStatus("unauthenticated");
      }
    });
  }, []);

  const login = React.useCallback(
    async (email: string, password: string) => {
      const { admin: me, tokens } = await adminAuthRepository.login({
        email,
        password,
      });
      authStorage.setTokens(tokens);
      authStorage.setProfile(me);
      setAdmin(me);
      setStatus("authenticated");
    },
    [],
  );

  const logout = React.useCallback(async () => {
    try {
      await adminAuthRepository.logout();
    } catch {
      // Best effort (Req 5.7): even if the backend call fails, we still
      // clear local storage so the user is locally signed out.
    }
    authStorage.clear();
    setAdmin(null);
    setStatus("unauthenticated");
  }, []);

  const value = React.useMemo<AuthContextValue>(
    () => ({ status, admin, login, logout }),
    [status, admin, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
