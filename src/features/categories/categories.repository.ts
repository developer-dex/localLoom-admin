/**
 * Admin categories Repository (design.md §5.5, Requirements 4.8,
 * 4.12, 8.4, 8.5, 8.6).
 *
 * Wraps the backend's `/api/admin/categories` surface behind a small,
 * typed API. Every call goes through the shared `apiClient` axios
 * instance so the request interceptor attaches the bearer token and
 * the response interceptor handles refresh-on-401 plus `ApiError`
 * normalization.
 *
 * Path strings come exclusively from `ADMIN_PATHS.categories` so no
 * raw URL literal appears in feature code (Req 4.6, 4.7).
 *
 * Multipart uploads (create and update) set
 * `Content-Type: multipart/form-data` explicitly per Req 4.12; the
 * axios instance lets the browser append the boundary automatically
 * when a `FormData` payload is passed.
 *
 * `list()` normalizes both response envelopes the backend may return:
 * a plain `Category[]` and a paginated `{ items, pagination }` shape
 * (see design.md §5.5). Callers therefore always receive an array.
 */

import { apiClient } from "@/api/client";
import { ADMIN_PATHS } from "@/api/paths";

import {
  buildCategoryFormData,
  type Category,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from "./categories.types";

export class AdminCategoriesRepository {
  async list(): Promise<Category[]> {
    const res = await apiClient.get(ADMIN_PATHS.categories.root);
    const data = res.data?.data;
    return Array.isArray(data) ? data : data?.items ?? [];
  }

  async create(input: CreateCategoryInput): Promise<Category> {
    const fd = buildCategoryFormData(input);
    const res = await apiClient.post(ADMIN_PATHS.categories.root, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  }

  async update(id: string, input: UpdateCategoryInput): Promise<Category> {
    const fd = buildCategoryFormData(input);
    const res = await apiClient.patch(ADMIN_PATHS.categories.byId(id), fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  }

  async softDelete(id: string): Promise<void> {
    await apiClient.delete(ADMIN_PATHS.categories.byId(id));
  }
}

export const adminCategoriesRepository = new AdminCategoriesRepository();
