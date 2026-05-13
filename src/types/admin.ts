/**
 * Admin domain types mirrored from the backend admin auth responses
 * (`POST /api/admin/auth/login` and `GET /api/admin/auth/profile`).
 *
 * `AdminStatus` accepts the canonical values the backend currently returns
 * plus a string fallback so an unknown status from the server does not
 * break type narrowing in the UI layer.
 */

export type AdminRole = "admin" | "super_admin";

export type AdminStatus = "active" | "inactive" | "suspended" | string;

export interface Admin {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: AdminRole;
  status: AdminStatus;
  lastLogin: string | null;
  createdAt: string;
}
