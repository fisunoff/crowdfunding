// src/api/contrib.ts
import api from './instance';
import type {GlobalStatsData, DetailedContribSchema} from './types';

export const contribApi = {
  // Получить общую статистику (было ранее)
  async getGlobalStats(): Promise<GlobalStatsData> {
    const response = await api.get<GlobalStatsData>('/contrib/stats/');
    return response.data;
  },

  // [НОВОЕ] Получить мои вклады
  async getMyContributions(): Promise<DetailedContribSchema[]> {
    const response = await api.get<DetailedContribSchema[]>('/contrib/my');
    return response.data;
  },
  // GET /contrib/{project_pk}/rewards/{reward_pk}/contrib
  async getContributionsByReward(projectId: number, rewardId: number): Promise<ContribSchema[]> {
    const response = await api.get<ContribSchema[]>(`/contrib/${projectId}/rewards/${rewardId}/contrib`);
    return response.data;
  }
};
