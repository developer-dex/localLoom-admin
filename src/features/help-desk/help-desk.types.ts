export type HelpDeskStatus = 'pending' | 'resolved';

export interface HelpDeskRequest {
  id: string;
  name: string;
  email: string;
  message: string;
  status: HelpDeskStatus;
  createdAt: string;
  updatedAt: string;
}

export interface HelpDeskListParams {
  page: number;
  limit: number;
  status?: HelpDeskStatus;
}
