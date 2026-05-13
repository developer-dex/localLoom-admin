/**
 * Browser-side persistence layer for admin auth state (Requirement 5.3,
 * design.md §6.1). All three keys are namespaced to the admin panel so
 * they never collide with other LocalLoom front-ends that might share the
 * same origin in a deployed environment.
 *
 * `getProfile()` guards the JSON.parse so a corrupted entry (manually
 * edited, truncated, etc.) returns `null` instead of throwing during
 * Auth_Provider initialization.
 */

import type { Admin } from "@/types/admin";

const KEYS = {
  access: "localloom-admin-access-token",
  refresh: "localloom-admin-refresh-token",
  profile: "localloom-admin-profile",
} as const;

export const authStorage = {
  getAccessToken: (): string | null => localStorage.getItem(KEYS.access),
  getRefreshToken: (): string | null => localStorage.getItem(KEYS.refresh),
  getProfile: (): Admin | null => {
    const raw = localStorage.getItem(KEYS.profile);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Admin;
    } catch {
      return null;
    }
  },
  setTokens: ({
    accessToken,
    refreshToken,
  }: {
    accessToken: string;
    refreshToken: string;
  }): void => {
    localStorage.setItem(KEYS.access, accessToken);
    localStorage.setItem(KEYS.refresh, refreshToken);
  },
  setProfile: (admin: Admin): void => {
    localStorage.setItem(KEYS.profile, JSON.stringify(admin));
  },
  clear: (): void => {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  },
};
