<script setup lang="ts">
import {computed, onMounted, ref} from 'vue';
import {useRouter} from 'vue-router';
import {useProjectsStore} from '@/stores/useProjectsStore';
import {useAuthStore} from '@/stores/useAuthStore';

// Импорты компонентов
import ProjectCard from '@/components/ProjectCard.vue';
import CreateProjectModal from '@/modules/projects/components/CreateProjectModal.vue';
import EditProjectModal from '@/modules/projects/components/EditProjectModal.vue';

// Импорты типов
import type {BaseProjectData, CreatedProjectData, ProjectStatus} from '@/api/types';

const router = useRouter();
const projectsStore = useProjectsStore();
const authStore = useAuthStore();

// Состояния модальных окон
const isCreateModalOpen = ref(false);
const isEditModalOpen = ref(false);

// Проект, который мы сейчас редактируем
const projectToEdit = ref<CreatedProjectData | null>(null);

onMounted(() => {
  projectsStore.fetchProjects();
});

// Фильтрация проектов текущего пользователя
const myProjects = computed(() => {
  if (!authStore.user) return [];
  // Показываем только проекты, где author_id совпадает с ID залогиненного юзера
  return projectsStore.projects.filter(p => p.author_id === authStore.user!.id);
});

// --- Обработчики ---

const handleCardClick = (id: number) => {
  router.push({name: 'projectCard', params: {id}});
};

// Создание
const handleCreateProject = async (data: BaseProjectData) => {
  try {
    await projectsStore.createProject(data);
    isCreateModalOpen.value = false;
  } catch (e) {
    alert('Ошибка при создании проекта');
  }
};

// Открытие окна редактирования
const handleEditClick = (project: CreatedProjectData) => {
  projectToEdit.value = project;
  isEditModalOpen.value = true;
};

// Удаление
const handleDelete = async (id: number) => {
  if (confirm('Вы уверены, что хотите удалить этот проект? Это действие необратимо.')) {
    try {
      await projectsStore.deleteProject(id);
    } catch (e) {
      alert('Ошибка при удалении. Возможно, удаление запрещено на текущей стадии.');
    }
  }
};

// Отправка на модерацию
const handleSubmit = async (id: number) => {
  try {
    await projectsStore.submitProject(id);
  } catch (e) {
    alert('Ошибка при отправке на модерацию');
  }
};

// --- Хелпер для текста статуса ---
const getStatusLabel = (status: ProjectStatus) => {
  switch (status) {
    case 'draft':
      return 'Черновик';
    case 'onModeration':
      return 'На проверке';
    case 'accepted':
      return 'Активен';
    case 'rejected':
      return 'Отклонен';
    default:
      return status;
  }
};
</script>

<template>
  <div class="my-projects-page">

    <!-- Header -->
    <div class="page-header">
      <div class="container header-content">
        <h1 class="page-title">Мои проекты</h1>
        <button class="create-btn-main" @click="isCreateModalOpen = true">
          <span class="plus-icon">+</span> Создать проект
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container content-area">

      <!-- Loading -->
      <div v-if="projectsStore.isLoading" class="state-message">
        Загрузка...
      </div>

      <!-- Empty State -->
      <div v-else-if="myProjects.length === 0" class="empty-state">
        <div class="empty-icon">📂</div>
        <p>У вас пока нет проектов.</p>
        <button class="create-btn-text" @click="isCreateModalOpen = true">Создать первый проект</button>
      </div>

      <!-- Grid -->
      <div v-else class="projects-grid">
        <div v-for="project in myProjects" :key="project.id" class="project-column">
          <div class="project-wrapper">

            <!-- Бейдж статуса (справа сверху) -->
            <div class="status-badge" :class="project.status">
              {{ getStatusLabel(project.status) }}
            </div>

            <!-- Сама карточка -->
            <ProjectCard
                :project="project"
                @click="handleCardClick"
            />

            <!-- Блок сообщения от модератора -->
            <!-- Показываем, если есть комментарий И статус либо черновик (вернули), либо отказ -->
            <div
                v-if="project.moderator_comment && (project.status === 'draft' || project.status === 'rejected')"
                class="moderator-message"
                :class="project.status"
            >
              <div class="mod-title">
                {{ project.status === 'rejected' ? 'Причина отказа:' : 'Замечания модератора:' }}
              </div>
              <div class="mod-text">{{ project.moderator_comment }}</div>

              <!-- Кнопка "Быстрое исправление" внутри алерта -->
              <button
                  v-if="project.status === 'draft'"
                  class="fix-btn"
                  @click.stop="handleEditClick(project)"
              >
                Исправить сейчас
              </button>
            </div>

            <!-- Панель управления (кнопки снизу) -->
            <div class="control-panel">

              <!-- 1. Кнопка редактирования (только для черновиков) -->
              <button
                  v-if="project.status === 'draft'"
                  class="control-btn edit-btn"
                  @click.stop="handleEditClick(project)"
              >
                Изменить
              </button>

              <!-- 2. Кнопка отправки (только для черновиков) -->
              <button
                  v-if="project.status === 'draft'"
                  class="control-btn submit-btn"
                  @click.stop="handleSubmit(project.id)"
              >
                {{ project.moderator_comment ? 'Повторно' : 'На модерацию' }}
              </button>

              <!-- 3. Кнопка удаления (черновики и на проверке) -->
              <button
                  v-if="['draft', 'onModeration'].includes(project.status)"
                  class="control-btn delete-btn"
                  @click.stop="handleDelete(project.id)"
              >
                Удалить
              </button>

              <!-- 4. Инфо для активных/отклоненных -->
              <div
                  v-if="project.status === 'accepted'"
                  class="status-info accepted"
              >
                Активен 🚀
              </div>
              <div
                  v-if="project.status === 'rejected' && !project.moderator_comment"
                  class="status-info rejected"
              >
                Закрыт
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Create -->
    <CreateProjectModal
        v-if="isCreateModalOpen"
        @close="isCreateModalOpen = false"
        @create="handleCreateProject"
    />

    <!-- Modal: Edit (Advanced with Rewards) -->
    <EditProjectModal
        v-if="isEditModalOpen && projectToEdit"
        :project="projectToEdit"
        @close="isEditModalOpen = false"
    />

  </div>
</template>

<style scoped>
.my-projects-page {
  min-height: 80vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Header */
.page-header {
  background-color: #f9f9f9;
  padding: 40px 0;
  border-bottom: 1px solid #eee;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 36px;
  font-weight: 700;
  margin: 0;
}

.create-btn-main {
  background-color: #587bf2;
  color: white;
  border: none;
  border-radius: 30px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: transform 0.2s;
}

.create-btn-main:hover {
  transform: translateY(-2px);
}

/* Content Grid */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  margin-top: 40px;
}

@media (max-width: 992px) {
  .projects-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .projects-grid {
    grid-template-columns: 1fr;
  }
}

.project-column {
  display: flex;
  flex-direction: column;
}

.project-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* Status Badge */
.status-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  z-index: 10;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  color: white;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.status-badge.draft {
  background-color: #9E9E9E;
}

.status-badge.onModeration {
  background-color: #FFB039;
}

.status-badge.accepted {
  background-color: #4CAF50;
}

.status-badge.rejected {
  background-color: #E85A5A;
}

/* Moderator Message Block */
.moderator-message {
  margin-top: 15px;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.4;
}

.moderator-message.draft {
  background-color: #FFF8E1;
  border: 1px solid #FFECB3;
  color: #8D6E63;
}

.moderator-message.rejected {
  background-color: #FFEBEE;
  border: 1px solid #FFCDD2;
  color: #B71C1C;
}

.mod-title {
  font-weight: 700;
  margin-bottom: 4px;
}

/* Fix Button inside alert */
.fix-btn {
  margin-top: 10px;
  background-color: white;
  border: 1px solid currentColor;
  color: inherit;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  width: 100%;
}

.fix-btn:hover {
  background-color: rgba(255, 255, 255, 0.5);
}

/* Control Panel */
.control-panel {
  margin-top: 15px;
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.control-btn {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: opacity 0.2s;
  white-space: nowrap;
}

.control-btn:hover {
  opacity: 0.8;
}

.edit-btn {
  background-color: #333;
  color: white;
}

.submit-btn {
  background-color: #587bf2;
  color: white;
}

.delete-btn {
  background-color: #E85A5A;
  color: white;
}

/* Status Info Text */
.status-info {
  width: 100%;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  padding: 10px;
  border-radius: 10px;
  opacity: 0.8;
}

.status-info.accepted {
  color: #4CAF50;
  background: rgba(76, 175, 80, 0.1);
}

.status-info.rejected {
  color: #E85A5A;
  background: rgba(232, 90, 90, 0.1);
}

/* Empty State */
.empty-state {
  text-align: center;
  margin-top: 60px;
  background: white;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.create-btn-text {
  background: none;
  border: 2px solid #587bf2;
  color: #587bf2;
  padding: 10px 20px;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
}

.create-btn-text:hover {
  background: #587bf2;
  color: white;
}

.state-message {
  text-align: center;
  color: #666;
  margin-top: 50px;
}
</style>
