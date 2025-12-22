<script setup lang="ts">
import {computed, onMounted, ref} from 'vue';
import {useRouter} from 'vue-router';
import {useProjectsStore} from '@/stores/useProjectsStore';
import {useAuthStore} from '@/stores/useAuthStore';
import ProjectCard from '@/components/ProjectCard.vue';
import CreateProjectModal from '@/modules/projects/components/CreateProjectModal.vue';
import type {BaseProjectData, ProjectStatus} from '@/api/types';

const router = useRouter();
const projectsStore = useProjectsStore();
const authStore = useAuthStore();
const isModalOpen = ref(false);

onMounted(() => {
  projectsStore.fetchProjects();
});

const myProjects = computed(() => {
  if (!authStore.user) return [];
  // Фильтруем по ID автора
  return projectsStore.projects.filter(p => p.author_id === authStore.user!.id);
});

const handleCardClick = (id: number) => {
  router.push({name: 'projectCard', params: {id}});
};

const handleCreateProject = async (data: BaseProjectData) => {
  try {
    await projectsStore.createProject(data);
    isModalOpen.value = false;
  } catch (e) {
    alert('Ошибка при создании проекта');
  }
};

const handleDelete = async (id: number) => {
  if (confirm('Вы уверены, что хотите удалить этот проект?')) {
    try {
      await projectsStore.deleteProject(id);
    } catch (e) {
      alert('Ошибка при удалении. Возможно, удаление запрещено на текущей стадии.');
    }
  }
};

const handleSubmit = async (id: number) => {
  try {
    await projectsStore.submitProject(id);
  } catch (e) {
    alert('Ошибка при отправке на модерацию');
  }
};

// --- Helpers для статусов ---

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

    <div class="page-header">
      <div class="container header-content">
        <h1 class="page-title">Мои проекты</h1>
        <button class="create-btn-main" @click="isModalOpen = true">
          <span class="plus-icon">+</span> Создать проект
        </button>
      </div>
    </div>

    <div class="container content-area">

      <div v-if="projectsStore.isLoading" class="state-message">
        Загрузка...
      </div>

      <div v-else-if="myProjects.length === 0" class="empty-state">
        <div class="empty-icon">📂</div>
        <p>У вас пока нет проектов.</p>
        <button class="create-btn-text" @click="isModalOpen = true">Создать первый проект</button>
      </div>

      <div v-else class="projects-grid">
        <div v-for="project in myProjects" :key="project.id" class="project-wrapper">

          <!-- STATUS BADGE -->
          <div class="status-badge" :class="project.status">
            {{ getStatusLabel(project.status) }}
          </div>

          <ProjectCard
              :project="project"
              @click="handleCardClick"
          />

          <!-- CONTROL PANEL -->
          <div class="control-panel">

            <!-- Кнопка "На модерацию": Только для Draft -->
            <button
                v-if="project.status === 'draft'"
                class="control-btn submit-btn"
                @click.stop="handleSubmit(project.id)"
            >
              На модерацию
            </button>

            <!-- Кнопка удаления: Draft или OnModeration (согласно Swagger) -->
            <button
                v-if="['draft', 'onModeration'].includes(project.status)"
                class="control-btn delete-btn"
                @click.stop="handleDelete(project.id)"
            >
              Удалить
            </button>

            <!-- Для активных или отклоненных можно показать заглушку или ничего -->
            <div
                v-if="['accepted', 'rejected'].includes(project.status)"
                class="status-info"
                :class="project.status"
            >
              {{ project.status === 'accepted' ? 'Сбор средств идет' : 'Проект закрыт' }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <CreateProjectModal
        v-if="isModalOpen"
        @close="isModalOpen = false"
        @create="handleCreateProject"
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

/* Grid */
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

.project-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
}

/* --- Status Badge Styles --- */
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
  background-color: #9E9E9E; /* Серый */
}

.status-badge.onModeration {
  background-color: #FFB039; /* Желтый/Оранжевый */
}

.status-badge.accepted {
  background-color: #4CAF50; /* Зеленый */
}

.status-badge.rejected {
  background-color: #E85A5A; /* Красный */
}

/* Control Panel */
.control-panel {
  margin-top: 15px;
  display: flex;
  gap: 10px;
  min-height: 40px;
  align-items: center;
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
}

.control-btn:hover {
  opacity: 0.8;
}

.submit-btn {
  background-color: #587bf2;
  color: white;
}

.delete-btn {
  background-color: #E85A5A;
  color: white;
}

/* Status Info Text (instead of buttons) */
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
