/**
 * Default MSW request handlers for the admin panel test suite (Task 21.1).
 *
 * These handlers cover the smallest set of endpoints every test needs so
 * that no test hits the real network: login, refresh-token, profile,
 * categories list, and regions list. Individual test files are expected
 * to override handlers via `server.use(...)` to simulate error cases
 * (401, 409, network failure, etc.).
 *
 * The paths below intentionally use the full `/api/admin/*` prefix
 * because `Api_Client` is configured with
 * `baseURL = \`${env.apiBaseUrl}/api/admin\``. MSW matches against the
 * final request URL, so the prefix must match what axios actually
 * sends.
 */

import { http, HttpResponse } from "msw";

import { env } from "@/config/env";
import { ADMIN_PATHS } from "@/api/paths";

const base = `${env.apiBaseUrl}/api/admin`;

type Envelope<T> = {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
};

function ok<T>(data: T, message = "OK"): Envelope<T> {
  return { success: true, message, data };
}

const fixtureAdmin = {
  id: "admin-1",
  name: "Test Admin",
  email: "admin@localloom.test",
  avatar: null,
  role: "admin" as const,
  status: "active" as const,
  lastLogin: "2026-05-11T00:00:00.000Z",
  createdAt: "2026-01-01T00:00:00.000Z",
};

const fixtureTokens = {
  accessToken: "fixture-access-token",
  refreshToken: "fixture-refresh-token",
};

export const handlers = [
  // POST /api/admin/auth/login — returns `{ admin, tokens }` on success.
  http.post(`${base}${ADMIN_PATHS.auth.login}`, async () => {
    return HttpResponse.json(
      ok({ admin: fixtureAdmin, tokens: fixtureTokens }, "Logged in"),
    );
  }),

  // POST /api/admin/auth/refresh-token — returns a new token pair.
  http.post(`${base}${ADMIN_PATHS.auth.refreshToken}`, async () => {
    return HttpResponse.json(
      ok(
        {
          tokens: {
            accessToken: "fixture-access-token-refreshed",
            refreshToken: "fixture-refresh-token-refreshed",
          },
        },
        "Token refreshed",
      ),
    );
  }),

  // GET /api/admin/auth/profile — returns the current admin.
  http.get(`${base}${ADMIN_PATHS.auth.profile}`, async () => {
    return HttpResponse.json(ok(fixtureAdmin, "Profile"));
  }),

  // GET /api/admin/categories — returns an empty list by default.
  http.get(`${base}${ADMIN_PATHS.categories.root}`, async () => {
    return HttpResponse.json(ok([], "Categories"));
  }),

  // GET /api/admin/regions — returns an empty list by default.
  http.get(`${base}${ADMIN_PATHS.regions.root}`, async () => {
    return HttpResponse.json(ok([], "Regions"));
  }),
];
