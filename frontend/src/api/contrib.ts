import api from './instance';
import type {GlobalStatsData} from './types';

export const contribApi = {
  // Получить общую статистику
  async getGlobalStats(): Promise<GlobalStatsData> {
    const response = await api.get<GlobalStatsData>('/contrib/stats/');
    return response.data;
  }
};
