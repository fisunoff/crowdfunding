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

      // MOCK DATA (оставляем пока для разработки, как у тебя было)
      const mockProjects: CreatedProjectData[] = [
        // ... (твой старый массив моков, чтобы не дублировать код здесь, считаем что он тут есть)
        // Но добавим один проект с ID автора, который совпадет с твоим юзером, чтобы проверить фильтрацию
        {
          id: 999,
          author_id: 1, // Предположим, у твоего юзера ID=1
          status: 'draft', // Статус черновик
          title: 'Мой тестовый черновик',
          description: 'Описание черновика проекта...',
          goal_amount: 50000,
          project_type: 'Тесты',
          start_date: '2024-01-01',
          end_date: '2024-12-31'
        },
        {
          id: 101,
          author_id: 1,
          status: 'active',
          title: 'Студийная запись песни "Ржавые ангелы"',
          description: 'Студийная запись песни на стихи Кирилла Иванова, 13 лет. Кириллу нравится творчество Виктора Цоя. Особенно честность в его произведениях.',
          goal_amount: 100000,
          project_type: 'Музыка',
          start_date: '2023-10-01',
          end_date: '2024-05-20' // Будущая дата
        },
        {
          id: 102,
          author_id: 2,
          status: 'active',
          title: 'Пожарный Аудит',
          description: 'Приложение «Пожарный Аудит» - персональный инструмент контроля пожарной безопасности для малого и среднего бизнеса.',
          goal_amount: 500000,
          project_type: 'Технологии',
          start_date: '2023-09-15',
          end_date: '2024-04-10'
        },
        {
          id: 103,
          author_id: 1,
          status: 'active',
          title: 'Ольгин День - на её родине: подари себе праздник',
          description: '24 июля - День Святой княгини Ольги. Её родина - п.Выбуты под Псковом ждет гостей на праздник, организованный с вашей помощью.',
          goal_amount: 150000,
          project_type: 'События',
          start_date: '2023-11-01',
          end_date: '2024-06-01'
        },
        {
          id: 104,
          author_id: 3,
          status: 'active',
          title: 'Краеведческий альбом «Тавенга. Душа Русского Севера»',
          description: 'Альбом, посвященный кусту деревень Тавенге. Вожегодский округ, Вологодская область. Уникальные фотографии и истории.',
          goal_amount: 320000,
          project_type: 'Литература',
          start_date: '2023-12-01',
          end_date: '2024-07-15'
        }
      ];

      // Если бэкенд пустой, показываем моки, иначе реальные + моки (для теста)
      projects.value = [...realProjects, ...mockProjects];

    } catch (err) {
      console.error(err);
      error.value = 'Не удалось загрузить проекты';
    } finally {
      isLoading.value = false;
    }
  }

  // Создание проекта
  async function createProject(data: BaseProjectData) {
    isLoading.value = true;
    try {
      await projectsApi.createProject(data);
      // После создания обновляем список
      await fetchProjects();
    } catch (err) {
      console.error(err);
      throw err; // Пробрасываем ошибку компоненту
    } finally {
      isLoading.value = false;
    }
  }

  // Удаление проекта
  async function deleteProject(id: number) {
    try {
      await projectsApi.deleteProject(id);
      // Удаляем из локального стейта, чтобы не делать лишний запрос
      projects.value = projects.value.filter(p => p.id !== id);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  // Публикация (Submit)
  async function submitProject(id: number) {
    try {
      const updatedProject = await projectsApi.submitProject(id);
      // Обновляем проект в списке
      const index = projects.value.findIndex(p => p.id === id);
      if (index !== -1) {
        projects.value[index] = updatedProject;
      }
    } catch (err) {
      console.error(err);
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
