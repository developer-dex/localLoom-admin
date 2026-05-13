/**
 * Auth payload types mirrored from the backend admin auth responses.
 *
 * `LoginTokens` matches the `data.tokens` object returned by
 * `POST /api/admin/auth/login` and `POST /api/admin/auth/refresh-token`
 * (Requirement 5.2). `LoginResponseData` is the full `data` envelope
 * consumed by `Auth_Provider` to persist credentials + profile in one
 * step (Requirement 5.3).
 */

import type { Admin } from "@/types/admin";

export interface LoginTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponseData {
  admin: Admin;
  tokens: LoginTokens;
}
