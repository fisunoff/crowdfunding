// src/stores/useProjectsStore.ts
import {defineStore} from 'pinia';
import {ref} from 'vue';
import {projectsApi} from '@/api/projects';
import type {CreatedProjectData, BaseProjectData, RewardData, BaseRewardData} from '@/api/types';

export const useProjectsStore = defineStore('projects', () => {
  // Список проектов
  const projects = ref<CreatedProjectData[]>([]);

  // Временное хранилище наград для редактируемого проекта
  const currentRewards = ref<RewardData[]>([]);

  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // --- ACTIONS ---

  // 1. Получение проектов
  async function fetchProjects() {
    isLoading.value = true;
    error.value = null;
    try {
      // Пытаемся получить реальные данные
      const realProjects = await projectsApi.getProjects();

      // --- MOCK DATA (для разработки интерфейса) ---
      // Предполагаем, что твой user.id = 1.
      const mockProjects: CreatedProjectData[] = [
        {
          id: 901,
          author_id: 1,
          status: 'draft',
          title: 'Черновик: Книга о грибах',
          description: 'Здесь пока мало текста, нужно дописать...',
          goal_amount: 50000,
          project_type: 'Литература',
          start_date: '2024-06-01',
          end_date: '2024-09-01',
          moderator_comment: null
        },
        {
          id: 902,
          author_id: 1,
          status: 'onModeration',
          title: 'Умный ошейник v2',
          description: 'Проект отправлен на проверку.',
          goal_amount: 250000,
          project_type: 'Технологии',
          start_date: '2024-05-15',
          end_date: '2024-08-15',
          moderator_comment: null
        },
        {
          id: 903,
          author_id: 1,
          status: 'accepted',
          title: 'Фестиваль джаза (Активен)',
          description: 'Сбор средств идет полным ходом!',
          goal_amount: 1000000,
          project_type: 'События',
          start_date: '2024-05-01',
          end_date: '2024-10-01',
          moderator_comment: 'Удачи в сборах!'
        },
        {
          id: 904,
          author_id: 1,
          status: 'rejected',
          title: 'Отклоненный проект',
          description: 'Этот проект нарушал правила.',
          goal_amount: 5000,
          project_type: 'Развлечения',
          start_date: '2024-01-01',
          end_date: '2024-02-01',
          moderator_comment: 'Сбор средств на личные нужды (вечеринку) запрещен правилами платформы.'
        },
        // ВАЖНО: Черновик, возвращенный на доработку
        {
          id: 905,
          author_id: 1,
          status: 'draft',
          title: 'Настольная игра (Нужны правки)',
          description: 'Игра про средневековье.',
          goal_amount: 150000,
          project_type: 'Игры',
          start_date: '2024-09-01',
          end_date: '2024-12-01',
          moderator_comment: 'Пожалуйста, добавьте более подробное описание правил игры и загрузите фото прототипа. После этого отправьте повторно.'
        }
      ];
      // ---------------------------------------------

      projects.value = [...realProjects, ...mockProjects];

    } catch (err) {
      console.error(err);
      error.value = 'Не удалось загрузить проекты';
    } finally {
      isLoading.value = false;
    }
  }

  // 2. Создание проекта
  async function createProject(data: BaseProjectData) {
    isLoading.value = true;
    try {
      await projectsApi.createProject(data);
      await fetchProjects(); // Обновляем список
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  // 3. Обновление проекта (PATCH)
  async function updateProject(id: number, data: BaseProjectData) {
    isLoading.value = true;
    try {
      const updated = await projectsApi.updateProject(id, data);

      // Находим проект в списке и обновляем его данные без перезагрузки всего списка
      const index = projects.value.findIndex(p => p.id === id);
      if (index !== -1) {
        projects.value[index] = updated;
      }
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  // 4. Удаление проекта
  async function deleteProject(id: number) {
    try {
      await projectsApi.deleteProject(id);
      projects.value = projects.value.filter(p => p.id !== id);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  // 5. Отправка на модерацию
  async function submitProject(id: number) {
    try {
      const updatedProject = await projectsApi.submitProject(id);
      const index = projects.value.findIndex(p => p.id === id);
      if (index !== -1) {
        projects.value[index] = updatedProject;
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  // --- ACTIONS: REWARDS ---

  async function fetchRewards(projectId: number) {
    try {
      currentRewards.value = await projectsApi.getRewards(projectId);
    } catch (err) {
      console.error('Failed to fetch rewards', err);
      // Если ошибка, можно очистить или оставить пустым
      currentRewards.value = [];
    }
  }

  async function addReward(projectId: number, data: BaseRewardData) {
    try {
      const newReward = await projectsApi.createReward(projectId, data);
      currentRewards.value.push(newReward);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async function removeReward(projectId: number, rewardId: number) {
    try {
      await projectsApi.deleteReward(projectId, rewardId);
      currentRewards.value = currentRewards.value.filter(r => r.id !== rewardId);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  return {
    projects,
    currentRewards, // State для наград
    isLoading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    submitProject,
    fetchRewards,
    addReward,
    removeReward
  };
});
