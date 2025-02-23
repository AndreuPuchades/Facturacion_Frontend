import BaseRepository from './base.repository';

export default class DashboardRepository extends BaseRepository {
  async getStats(companyId) {
    return this.fetchWithAuth(`/dashboard/stats?company_id=${companyId}`);
  }

  async getChartData(companyId, period, year, month) {
    const params = new URLSearchParams({ company_id: companyId, period, year, month });
    return this.fetchWithAuth(`/dashboard/chart?${params}`);
  }
}