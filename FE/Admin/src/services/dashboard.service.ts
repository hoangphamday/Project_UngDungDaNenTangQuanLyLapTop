import { apiClient } from '../api/client'
import type { DashboardData } from '../types/dashboard'

export const dashboardService = {
  async getOverview(): Promise<DashboardData> {
    const { data } = await apiClient.get<DashboardData>('/admin/dashboard')
    return data
  },
}
