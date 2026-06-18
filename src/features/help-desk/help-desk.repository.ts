import { apiClient } from '@/api/client';
import { ADMIN_PATHS } from '@/api/paths';
import type { HelpDeskRequest, HelpDeskListParams } from './help-desk.types';

interface PaginatedResponse {
  data: HelpDeskRequest[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export const helpDeskRepository = {
  async list(params: HelpDeskListParams): Promise<PaginatedResponse> {
    const { data } = await apiClient.get(ADMIN_PATHS.helpDesk.root, { params });
    return data;
  },

  async getById(id: string): Promise<HelpDeskRequest> {
    const { data } = await apiClient.get(ADMIN_PATHS.helpDesk.byId(id));
    return data.data;
  },

  async resolve(id: string): Promise<HelpDeskRequest> {
    const { data } = await apiClient.patch(ADMIN_PATHS.helpDesk.resolve(id));
    return data.data;
  },
};
