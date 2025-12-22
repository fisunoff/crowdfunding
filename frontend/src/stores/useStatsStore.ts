import {defineStore} from 'pinia';
import {ref} from 'vue';
import {contribApi} from '@/api/contrib';
import type {GlobalStatsData} from '@/api/types';

export const useStatsStore = defineStore('stats', () => {
  // Дефолтные значения (нули), пока данные не загрузились
  const stats = ref<GlobalStatsData>({
    total_money: 0,
    rewards_count: 0,
    successful_projects: 0
  });
  const isLoading = ref(false);

  async function fetchGlobalStats() {
    isLoading.value = true;
    try {
      const data = await contribApi.getGlobalStats();
      // Если бэкенд возвращает пустой объект (так как схема {}),
      // нужно убедиться, что мы не затрем дефолтные нули undefined-ами
      if (data) {
        // Мапим поля, если названия отличаются, или берем как есть
        // @ts-ignore - так как схема в Swagger пустая, TS может ругаться, если данные придут другие
        stats.value = {
          total_money: data.total_money || 0,
          rewards_count: data.rewards_count || 0,
          successful_projects: data.successful_projects || 0
        };
      }
    } catch (err) {
      console.error('Ошибка загрузки статистики:', err);
    } finally {
      isLoading.value = false;
    }
  }

  return {
    stats,
    isLoading,
    fetchGlobalStats
  };
});
