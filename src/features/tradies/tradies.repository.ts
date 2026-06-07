/**
 * Admin tradies Repository.
 *
 * Wraps the backend's `/api/admin/tradies` surface behind a typed API.
 * Every call goes through the shared `apiClient` so the request
 * interceptor attaches the bearer token and the response interceptor
 * handles refresh-on-401 plus `ApiError` normalization.
 *
 * Path strings come exclusively from `ADMIN_PATHS.tradies`.
 */

import { apiClient } from "@/api/client";
import { ADMIN_PATHS } from "@/api/paths";
import type { PaginatedResult } from "@/types/api";

import type {
  BulkActionResult,
  TradieDetail,
  TradieListItem,
  TradieListParams,
} from "./tradies.types";

export interface DeleteUserResult {
  id: string;
}

export class AdminTradiesRepository {
  async list(params: TradieListParams): Promise<PaginatedResult<TradieListItem>> {
    const res = await apiClient.get(ADMIN_PATHS.tradies.root, { params });
    return { data: res.data.data, meta: res.data.meta };
  }

  async getById(id: string): Promise<TradieDetail> {
    const res = await apiClient.get(ADMIN_PATHS.tradies.byId(id));
    return res.data.data;
  }

  async approve(id: string): Promise<void> {
    await apiClient.patch(ADMIN_PATHS.tradies.approve(id));
  }

  async reject(id: string, rejectionReason: string): Promise<void> {
    await apiClient.patch(ADMIN_PATHS.tradies.reject(id), { rejectionReason });
  }

  async bulkApprove(ids: string[]): Promise<BulkActionResult> {
    const res = await apiClient.post(ADMIN_PATHS.tradies.bulkApprove, { ids });
    return res.data.data;
  }

  async bulkReject(ids: string[], rejectionReason: string): Promise<BulkActionResult> {
    const res = await apiClient.post(ADMIN_PATHS.tradies.bulkReject, {
      ids,
      rejectionReason,
    });
    return res.data.data;
  }

  async deleteUser(userId: string): Promise<DeleteUserResult> {
    const res = await apiClient.delete(ADMIN_PATHS.users.byId(userId));
    return res.data.data;
  }
}

export const adminTradiesRepository = new AdminTradiesRepository();
