// src/stores/useStatsStore.ts
import {defineStore} from 'pinia';
import {ref} from 'vue';
import {contribApi} from '@/api/contrib';
import type {GlobalStatsData} from '@/api/types';

export const useStatsStore = defineStore('stats', () => {
  // Обновленные дефолтные значения
  const stats = ref<GlobalStatsData>({
    total_count: 0,
    total_amount: 0,
    cool_projects: 0
  });

  const isLoading = ref(false);

  async function fetchGlobalStats() {
    isLoading.value = true;
    try {
      const data = await contribApi.getGlobalStats();
      if (data) {
        stats.value = data;
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
