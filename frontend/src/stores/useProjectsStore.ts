// src/stores/useProjectsStore.ts
import {defineStore} from 'pinia';
import {ref} from 'vue';
import {projectsApi} from '@/api/projects';
import type {CreatedProjectData, BaseProjectData} from '@/api/types';

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref<CreatedProjectData[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function fetchProjects() {
    isLoading.value = true;
    error.value = null;
    try {
      const realProjects = await projectsApi.getProjects();

      // MOCK DATA для проверки всех статусов
      // Предполагаем, что ID текущего юзера = 1 (как в useAuthStore моках, если бы они были)
      // В реальном приложении фильтрация идет по author_id, убедись, что он совпадает с твоим юзером
      const mockProjects: CreatedProjectData[] = [
        {
          id: 901,
          author_id: 1, // Твой ID
          status: 'draft',
          title: 'Черновик: Книга о грибах',
          description: 'Нужно доработать описание и добавить фото...',
          goal_amount: 50000,
          project_type: 'Литература',
          start_date: '2024-06-01',
          end_date: '2024-09-01'
        },
        {
          id: 902,
          author_id: 1, // Твой ID
          status: 'onModeration',
          title: 'На проверке: Умный ошейник',
          description: 'Проект отправлен модератору, ждем решения.',
          goal_amount: 250000,
          project_type: 'Технологии',
          start_date: '2024-05-15',
          end_date: '2024-08-15'
        },
        {
          id: 903,
          author_id: 1, // Твой ID
          status: 'accepted',
          title: 'Активен: Фестиваль джаза',
          description: 'Проект одобрен и сбор средств уже идет!',
          goal_amount: 1000000,
          project_type: 'События',
          start_date: '2024-05-01',
          end_date: '2024-10-01'
        },
        {
          id: 904,
          author_id: 1, // Твой ID
          status: 'rejected',
          title: 'Отклонен: Сбор на пиво',
          description: 'К сожалению, проект не соответствует правилам платформы.',
          goal_amount: 5000,
          project_type: 'Развлечения',
          start_date: '2024-01-01',
          end_date: '2024-02-01'
        }
      ];

      projects.value = [...realProjects, ...mockProjects];

    } catch (err) {
      console.error(err);
      error.value = 'Не удалось загрузить проекты';
    } finally {
      isLoading.value = false;
    }
  }

  // ... createProject, deleteProject, submitProject оставляем такими же ...
  async function createProject(data: BaseProjectData) {
    isLoading.value = true;
    try {
      await projectsApi.createProject(data);
      await fetchProjects();
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteProject(id: number) {
    try {
      await projectsApi.deleteProject(id);
      projects.value = projects.value.filter(p => p.id !== id);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async function submitProject(id: number) {
    try {
      // Оптимистичное обновление интерфейса
      // Сначала меняем статус локально, чтобы юзер сразу увидел результат
      const index = projects.value.findIndex(p => p.id === id);
      if (index !== -1) {
        // Предполагаем, что после сабмита статус становится onModeration
        projects.value[index].status = 'onModeration';
      }

      const updatedProject = await projectsApi.submitProject(id);

      // Обновляем реальными данными с сервера
      if (index !== -1) {
        projects.value[index] = updatedProject;
      }
    } catch (err) {
      console.error(err);
      // Если ошибка - откатываем статус (можно добавить перезагрузку списка)
      await fetchProjects();
      throw err;
    }
  }

  return {
    projects,
    isLoading,
    error,
    fetchProjects,
    createProject,
    deleteProject,
    submitProject
  };
});
