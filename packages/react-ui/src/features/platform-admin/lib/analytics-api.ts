import { api } from '@/lib/api';
import { AnalyticsReportResponse, ProjectUsageHistoryResponse } from '@activepieces/shared';

export const analyticsApi = {
  get(): Promise<AnalyticsReportResponse> {
    return api.get<AnalyticsReportResponse>('/v1/analytics');
  },
  getProjectUsageHistory(months: number = 6): Promise<ProjectUsageHistoryResponse> {
    return api.get<ProjectUsageHistoryResponse>(`/v1/analytics/projects/usage-history?months=${months}`);
  },
};
