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

      // MOCK DATA
      // author_id: 1 - предполагаем, что это текущий юзер
      const mockProjects: CreatedProjectData[] = [
        {
          id: 901,
          author_id: 1,
          status: 'draft',
          title: 'Просто черновик',
          description: 'Я только начал заполнять этот проект.',
          goal_amount: 50000,
          project_type: 'Литература',
          start_date: '2024-06-01',
          end_date: '2024-09-01',
          moderator_comment: null // Комментария нет
        },
        {
          id: 902,
          author_id: 1,
          status: 'onModeration',
          title: 'Умный ошейник v2',
          description: 'Ждем решения администратора.',
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
          title: 'Фестиваль джаза',
          description: 'Проект одобрен и собирает деньги.',
          goal_amount: 1000000,
          project_type: 'События',
          start_date: '2024-05-01',
          end_date: '2024-10-01',
          moderator_comment: 'Отличный проект, удачи!' // Иногда админ может написать и хорошее
        },
        {
          id: 904,
          author_id: 1,
          status: 'rejected',
          title: 'Сбор на вечеринку',
          description: 'Отказано полностью.',
          goal_amount: 5000,
          project_type: 'Развлечения',
          start_date: '2024-01-01',
          end_date: '2024-02-01',
          moderator_comment: 'Нарушение правил платформы: сбор личных средств запрещен.'
        },
        // ВАЖНЫЙ КЕЙС: Вернули на доработку
        {
          id: 905,
          author_id: 1,
          status: 'draft',
          title: 'Книга о грибах (Нужны правки)',
          description: 'Описание проекта...',
          goal_amount: 100000,
          project_type: 'Книги',
          start_date: '2024-01-01',
          end_date: '2024-02-01',
          moderator_comment: 'Пожалуйста, добавьте смету расходов в описание и загрузите более качественную обложку.'
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

  // ... остальные методы (create, delete, submit) без изменений
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
    await projectsApi.deleteProject(id);
    projects.value = projects.value.filter(p => p.id !== id);
  }

  async function submitProject(id: number) {
    const updated = await projectsApi.submitProject(id);
    const index = projects.value.findIndex(p => p.id === id);
    if (index !== -1) projects.value[index] = updated;
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
