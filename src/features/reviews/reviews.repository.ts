/**
 * Admin reviews repository.
 *
 * Wraps the backend's `/api/admin/reviews` surface behind a typed API.
 * Every call goes through the shared `apiClient` so the request
 * interceptor attaches the bearer token and the response interceptor
 * handles refresh-on-401 plus `ApiError` normalization.
 *
 * Path strings come exclusively from `ADMIN_PATHS.reviews`.
 */

import { apiClient } from "@/api/client";
import { ADMIN_PATHS } from "@/api/paths";
import type { PaginatedResult } from "@/types/api";

import type {
  BulkActionResult,
  ReviewDetail,
  ReviewListItem,
  ReviewListParams,
} from "./reviews.types";

export class AdminReviewsRepository {
  async list(params: ReviewListParams): Promise<PaginatedResult<ReviewListItem>> {
    const res = await apiClient.get(ADMIN_PATHS.reviews.root, { params });
    return res.data.data;
  }

  async getById(id: string): Promise<ReviewDetail> {
    const res = await apiClient.get(ADMIN_PATHS.reviews.byId(id));
    return res.data.data;
  }

  async approve(id: string): Promise<void> {
    await apiClient.patch(ADMIN_PATHS.reviews.approve(id));
  }

  async reject(id: string, rejectionReason: string): Promise<void> {
    await apiClient.patch(ADMIN_PATHS.reviews.reject(id), { rejectionReason });
  }

  async bulkApprove(ids: string[]): Promise<BulkActionResult> {
    const res = await apiClient.post(ADMIN_PATHS.reviews.bulkApprove, { ids });
    return res.data.data;
  }

  async bulkReject(ids: string[], rejectionReason: string): Promise<BulkActionResult> {
    const res = await apiClient.post(ADMIN_PATHS.reviews.bulkReject, {
      ids,
      rejectionReason,
    });
    return res.data.data;
  }
}

export const adminReviewsRepository = new AdminReviewsRepository();
