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
    const items = Array.isArray(res.data?.data) ? (res.data.data as RawReviewListItem[]) : [];
    return {
      data: items.map(normalizeReviewListItem),
      meta: res.data?.meta as PaginatedResult<ReviewListItem>["meta"],
    };
  }

  async getById(id: string): Promise<ReviewDetail> {
    const res = await apiClient.get(ADMIN_PATHS.reviews.byId(id));
    return normalizeReviewDetail(res.data.data as RawReviewDetail);
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

// --------------------------------------------------------------------------
// Wire-shape normalization
// --------------------------------------------------------------------------
//
// The backend serializes the Sequelize association under the model name
// (`TradieProfile`, PascalCase). Our domain types use `tradieProfile`
// (camelCase). We accept either spelling so the repository stays robust
// to either backend convention without forcing a backend rename.

type RawReviewListItem = Omit<ReviewListItem, "tradieProfile"> & {
  tradieProfile?: ReviewListItem["tradieProfile"];
  TradieProfile?: ReviewListItem["tradieProfile"];
};

type RawReviewDetail = Omit<ReviewDetail, "tradieProfile"> & {
  tradieProfile?: ReviewDetail["tradieProfile"];
  TradieProfile?: ReviewDetail["tradieProfile"];
};

function normalizeReviewListItem(raw: RawReviewListItem): ReviewListItem {
  const { TradieProfile, tradieProfile, ...rest } = raw;
  return {
    ...rest,
    tradieProfile: (tradieProfile ?? TradieProfile ?? { id: "", businessName: "" }) as ReviewListItem["tradieProfile"],
  };
}

function normalizeReviewDetail(raw: RawReviewDetail): ReviewDetail {
  const { TradieProfile, tradieProfile, ...rest } = raw;
  return {
    ...rest,
    tradieProfile: (tradieProfile ?? TradieProfile ?? { id: "", businessName: "" }) as ReviewDetail["tradieProfile"],
  };
}
