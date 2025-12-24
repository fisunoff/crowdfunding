// src/stores/useContribStore.ts
import {defineStore} from 'pinia';
import {ref, computed} from 'vue';
import {contribApi} from '@/api/contrib';
import type {DetailedContribSchema} from '@/api/types';

export const useContribStore = defineStore('contrib', () => {
  const contributions = ref<DetailedContribSchema[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Вычисляемое свойство: Общая сумма потраченных средств
  const totalSpent = computed(() => {
    return contributions.value.reduce((sum, item) => sum + item.reward.price, 0);
  });

  async function fetchMyContributions() {
    isLoading.value = true;
    error.value = null;
    try {
      const realData = await contribApi.getMyContributions();


      contributions.value = [...realData];
    } catch (err) {
      console.error(err);
      error.value = 'Не удалось загрузить историю вкладов';
    } finally {
      isLoading.value = false;
    }
  }

  return {
    contributions,
    isLoading,
    error,
    totalSpent,
    fetchMyContributions
  };
});
