/**
 * Singleton axios instance for every `/api/admin/*` call.
 *
 * Responsibilities (Requirement 4, design.md §5.3):
 *   - Carry the admin base URL so Repositories can use relative paths from
 *     `ADMIN_PATHS` (e.g. `/categories`) without ever repeating `/api/admin`.
 *   - Attach `Authorization: Bearer <accessToken>` from `authStorage` on
 *     every outgoing request when a token is present.
 *   - Transparently refresh a 401-rejected business request exactly once
 *     per request, sharing a single in-flight refresh promise across
 *     concurrent 401s so we don't hammer `/auth/refresh-token`.
 *   - On refresh failure: clear storage, emit a `forced-logout` event so
 *     `Auth_Provider` can flip to `unauthenticated`, and reject the
 *     original request.
 *   - Normalize every rejection to an `ApiError` so consumers never see
 *     raw axios errors.
 *
 * The refresh call itself uses the BARE `axios` import (not `apiClient`)
 * so it never re-enters this response interceptor.
 */

import axios, {
  AxiosError,
  AxiosHeaders,
  type InternalAxiosRequestConfig,
} from "axios";

import { ADMIN_PATHS } from "@/api/paths";
import { ApiError, normalizeAxiosError } from "@/api/errors";
import { env } from "@/config/env";
import { authStorage } from "@/features/auth/auth.storage";

// --------------------------------------------------------------------------
// Auth event bus
// --------------------------------------------------------------------------
//
// `Api_Client` publishes `forced-logout` when token refresh fails. The
// `Auth_Provider` subscribes via `onAuthEvent` and flips to
// `unauthenticated`, at which point `ProtectedRoute` routes to `/login`.
// Keeping the bus tiny and synchronous avoids a circular dependency
// between the HTTP layer and the React context.

export type AuthEvent = "forced-logout";

const listeners = new Set<(event: AuthEvent) => void>();

export function onAuthEvent(fn: (event: AuthEvent) => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function emitForcedLogout(): void {
  listeners.forEach((listener) => listener("forced-logout"));
}

// --------------------------------------------------------------------------
// Axios instance
// --------------------------------------------------------------------------

type RetryConfig = InternalAxiosRequestConfig & { _retried?: boolean };

export const apiClient = axios.create({
  baseURL: `${env.apiBaseUrl}/api/admin`,
  headers: { Accept: "application/json" },
});

// Request interceptor: attach bearer token when available (Req 4.2).
apiClient.interceptors.request.use((config) => {
  const token = authStorage.getAccessToken();
  if (token) {
    if (config.headers instanceof AxiosHeaders) {
      config.headers.set("Authorization", `Bearer ${token}`);
    } else {
      config.headers = {
        ...(config.headers as Record<string, string> | undefined),
        Authorization: `Bearer ${token}`,
      } as InternalAxiosRequestConfig["headers"];
    }
  }
  return config;
});

// --------------------------------------------------------------------------
// Refresh coordination
// --------------------------------------------------------------------------
//
// `refreshPromise` collapses concurrent 401s into a single refresh request.
// It resolves to the new access token (on success) or `null` (on failure).
// Each individual request still guards itself with `_retried` so it can
// only be replayed once, even if a caller triggers a second failure path
// during the same refresh window.

let refreshPromise: Promise<string | null> | null = null;

async function refreshTokens(): Promise<string | null> {
  const rt = authStorage.getRefreshToken();
  if (!rt) return null;
  try {
    const res = await axios.post(
      `${env.apiBaseUrl}/api/admin${ADMIN_PATHS.auth.refreshToken}`,
      { refreshToken: rt },
      { headers: { "Content-Type": "application/json" } },
    );
    const tokens = res.data?.data?.tokens;
    const accessToken: unknown = tokens?.accessToken;
    const refreshToken: unknown = tokens?.refreshToken;
    if (typeof accessToken !== "string" || typeof refreshToken !== "string") {
      return null;
    }
    authStorage.setTokens({ accessToken, refreshToken });
    return accessToken;
  } catch {
    return null;
  }
}

// Response interceptor: one-shot refresh-on-401 + ApiError normalization
// (Req 4.3, 4.4, 4.5).
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryConfig | undefined;
    const status = error.response?.status;

    // Skip the refresh flow entirely for the login and refresh endpoints
    // themselves. A 401 from `/auth/login` is a credentials failure that
    // the login page must surface directly; a 401 from `/auth/refresh`
    // means the refresh itself was rejected, and `refreshTokens()`
    // already handles that internally.
    const requestUrl = config?.url ?? "";
    const isAuthEndpoint =
      requestUrl.includes(ADMIN_PATHS.auth.login) ||
      requestUrl.includes(ADMIN_PATHS.auth.refreshToken);

    if (status === 401 && config && config._retried !== true && !isAuthEndpoint) {
      config._retried = true;
      refreshPromise ??= refreshTokens().finally(() => {
        refreshPromise = null;
      });
      const newAccessToken = await refreshPromise;
      if (newAccessToken) {
        if (config.headers instanceof AxiosHeaders) {
          config.headers.set("Authorization", `Bearer ${newAccessToken}`);
        } else {
          config.headers = {
            ...(config.headers as Record<string, string> | undefined),
            Authorization: `Bearer ${newAccessToken}`,
          } as InternalAxiosRequestConfig["headers"];
        }
        return apiClient.request(config);
      }

      // Refresh failed: purge storage and let Auth_Provider react. The
      // rejection below still resolves to a normalized `ApiError` so
      // callers that awaited the original request see a consistent shape.
      authStorage.clear();
      emitForcedLogout();
    }

    return Promise.reject(normalizeAxiosError(error));
  },
);

// Re-export the error class for convenience so feature code can
// `import { ApiError, apiClient } from "@/api/client"` if desired without
// pulling from two files.
export { ApiError };
