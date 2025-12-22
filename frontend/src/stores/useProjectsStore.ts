import {defineStore} from 'pinia';
import {ref} from 'vue';
import {projectsApi} from '@/api/projects';
import type {CreatedProjectData} from '@/api/types';

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref<CreatedProjectData[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function fetchProjects() {
    isLoading.value = true;
    error.value = null;
    try {
      // 1. Получаем реальные данные с сервера
      const realProjects = await projectsApi.getProjects();

      // --- TODO: УДАЛИТЬ ЭТОТ БЛОК ПОЗЖЕ (MOCK DATA) ---
      const mockProjects: CreatedProjectData[] = [
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
      // Объединяем реальные и фейковые (фейковые добавляем в конец или начало, как удобно)
      projects.value = [...realProjects, ...mockProjects];
      // ---------------------------------------------------

    } catch (err) {
      console.error(err);
      error.value = 'Не удалось загрузить проекты';

      // Даже если ошибка сети, покажем фейковые данные для разработки?
      // Если хочешь, раскомментируй строку ниже:
      // projects.value = mockProjects;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    projects,
    isLoading,
    error,
    fetchProjects
  };
});
