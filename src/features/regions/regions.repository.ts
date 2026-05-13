/**
 * Admin regions Repository (design.md §5.5, Requirements 4.8,
 * 9.3, 9.4, 9.5).
 *
 * Wraps the backend's `/api/admin/regions` surface behind a small,
 * typed API. Every call goes through the shared `apiClient` axios
 * instance so the request interceptor attaches the bearer token and
 * the response interceptor handles refresh-on-401 plus `ApiError`
 * normalization.
 *
 * Path strings come exclusively from `ADMIN_PATHS.regions` so no
 * raw URL literal appears in feature code (Req 4.6, 4.7).
 *
 * Unlike the categories module, region create and update payloads
 * are plain JSON rather than `multipart/form-data` — the endpoints
 * do not accept file uploads, so axios' default
 * `Content-Type: application/json` for plain object bodies is the
 * correct wire format (Req 9.3, 9.4).
 *
 * `list()` normalizes both response envelopes the backend may return:
 * a plain `Region[]` and a paginated `{ items, pagination }` shape
 * (see design.md §5.5). Callers therefore always receive an array.
 */

import { apiClient } from "@/api/client";
import { ADMIN_PATHS } from "@/api/paths";

import type {
  CreateRegionInput,
  Region,
  UpdateRegionInput,
} from "./regions.types";

export class AdminRegionsRepository {
  async list(): Promise<Region[]> {
    const res = await apiClient.get(ADMIN_PATHS.regions.root);
    const data = res.data?.data;
    return Array.isArray(data) ? data : data?.items ?? [];
  }

  async create(input: CreateRegionInput): Promise<Region> {
    const res = await apiClient.post(ADMIN_PATHS.regions.root, input);
    return res.data.data;
  }

  async update(id: string, input: UpdateRegionInput): Promise<Region> {
    const res = await apiClient.patch(ADMIN_PATHS.regions.byId(id), input);
    return res.data.data;
  }

  async softDelete(id: string): Promise<void> {
    await apiClient.delete(ADMIN_PATHS.regions.byId(id));
  }
}

export const adminRegionsRepository = new AdminRegionsRepository();
