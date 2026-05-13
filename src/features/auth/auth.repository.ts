/**
 * Admin auth Repository.
 *
 * Wraps the backend's `/api/admin/auth/*` endpoints behind a small, typed
 * surface. Every call goes through the shared `apiClient` axios instance
 * so the request interceptor attaches the `Authorization: Bearer` header
 * and the response interceptor handles refresh-on-401 plus `ApiError`
 * normalization (Requirements 4.8, 5.2, 5.6, 5.7, 5.11).
 *
 * Path strings come exclusively from `ADMIN_PATHS.auth` so no raw URL
 * literal appears in feature code (design.md §5.5).
 */

import { apiClient } from "@/api/client";
import { ADMIN_PATHS } from "@/api/paths";
import type { Admin } from "@/types/admin";
import type { LoginResponseData } from "@/features/auth/auth.types";

export class AdminAuthRepository {
  async login({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<LoginResponseData> {
    const res = await apiClient.post(ADMIN_PATHS.auth.login, { email, password });
    return res.data.data;
  }

  async profile(): Promise<Admin> {
    const res = await apiClient.get(ADMIN_PATHS.auth.profile);
    return res.data.data;
  }

  async logout(): Promise<void> {
    await apiClient.post(ADMIN_PATHS.auth.logout);
  }

  async changePassword({
    currentPassword,
    newPassword,
  }: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    await apiClient.patch(ADMIN_PATHS.auth.changePassword, {
      currentPassword,
      newPassword,
    });
  }
}

export const adminAuthRepository = new AdminAuthRepository();
