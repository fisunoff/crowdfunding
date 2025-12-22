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

      // --- MOCK DATA (Для красоты, если с бэка пусто) ---
      // Удали этот блок перед продакшеном
      const mockData: DetailedContribSchema[] = [
        {
          id: 1,
          project_id: 101,
          reward_id: 5,
          profile_id: 1,
          status: 'paid',
          created_at: '2024-03-15T10:00:00Z',
          project: {
            id: 101,
            author_id: 2,
            title: 'Студийная запись альбома',
            description: 'Запись первого альбома рок-группы...',
            goal_amount: 100000,
            project_type: 'Музыка',
            start_date: '2024-01-01',
            end_date: '2024-06-01',
            status: 'accepted'
          },
          reward: {
            id: 5,
            title: 'Цифровая копия альбома',
            description: 'Вы получите ссылку на скачивание за неделю до релиза.',
            price: 500,
            quantity: 100,
            active: true
          }
        },
        {
          id: 2,
          project_id: 102,
          reward_id: 8,
          profile_id: 1,
          status: 'paid',
          created_at: '2024-02-20T14:30:00Z',
          project: {
            id: 102,
            author_id: 3,
            title: 'Умный дом для кота',
            description: 'Автоматическая кормушка с камерой.',
            goal_amount: 500000,
            project_type: 'Технологии',
            start_date: '2024-02-01',
            end_date: '2024-08-01',
            status: 'accepted'
          },
          reward: {
            id: 8,
            title: 'Early Bird: Кормушка',
            description: 'Кормушка из первой партии со скидкой 30%.',
            price: 4500,
            quantity: 50,
            active: true
          }
        }
      ];
      // --------------------------------------------------

      contributions.value = [...realData, ...mockData];
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
