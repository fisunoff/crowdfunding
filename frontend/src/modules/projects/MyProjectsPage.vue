<script setup lang="ts">
import {computed, onMounted, ref} from 'vue';
import {useRouter} from 'vue-router';
import {useProjectsStore} from '@/stores/useProjectsStore';
import {useAuthStore} from '@/stores/useAuthStore';
import ProjectCard from '@/components/ProjectCard.vue';
import CreateProjectModal from '@/modules/projects/components/CreateProjectModal.vue';
import type {BaseProjectData} from '@/api/types';

const router = useRouter();
const projectsStore = useProjectsStore();
const authStore = useAuthStore();

const isModalOpen = ref(false);

onMounted(() => {
  projectsStore.fetchProjects();
});

// Фильтруем проекты: показываем только те, где author_id совпадает с текущим пользователем
const myProjects = computed(() => {
  if (!authStore.user) return [];
  return projectsStore.projects.filter(p => p.author_id === authStore.user!.id);
});

// Обработка клика по карточке (переход на детальную страницу)
const handleCardClick = (id: number) => {
  router.push({name: 'projectCard', params: {id}});
};

// Создание проекта
const handleCreateProject = async (data: BaseProjectData) => {
  try {
    await projectsStore.createProject(data);
    isModalOpen.value = false;
  } catch (e) {
    alert('Ошибка при создании проекта');
  }
};

// Удаление
const handleDelete = async (id: number) => {
  if (confirm('Вы уверены, что хотите удалить этот проект?')) {
    await projectsStore.deleteProject(id);
  }
};

// Публикация
const handleSubmit = async (id: number) => {
  try {
    await projectsStore.submitProject(id);
  } catch (e) {
    alert('Ошибка при отправке на модерацию');
  }
};
</script>

<template>
  <div class="my-projects-page">

    <!-- Header -->
    <div class="page-header">
      <div class="container header-content">
        <h1 class="page-title">Мои проекты</h1>
        <button class="create-btn-main" @click="isModalOpen = true">
          <span class="plus-icon">+</span> Создать проект
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="container content-area">

      <div v-if="projectsStore.isLoading" class="state-message">
        Загрузка...
      </div>

      <div v-else-if="myProjects.length === 0" class="empty-state">
        <div class="empty-icon">📂</div>
        <p>У вас пока нет созданных проектов.</p>
        <button class="create-btn-text" @click="isModalOpen = true">Создать первый проект</button>
      </div>

      <div v-else class="projects-grid">
        <!-- Обертка для карточки, чтобы добавить кнопки управления -->
        <div v-for="project in myProjects" :key="project.id" class="project-wrapper">

          <!-- Статус проекта -->
          <div class="status-badge" :class="project.status">
            {{ project.status === 'draft' ? 'Черновик' : 'Активен' }}
          </div>

          <!-- Сама карточка -->
          <ProjectCard
              :project="project"
              @click="handleCardClick"
          />

          <!-- Панель управления -->
          <div class="control-panel">
            <button
                v-if="project.status === 'draft'"
                class="control-btn submit-btn"
                @click.stop="handleSubmit(project.id)"
            >
              На модерацию
            </button>
            <button
                class="control-btn delete-btn"
                @click.stop="handleDelete(project.id)"
            >
              Удалить
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
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
  transition: transform 0.2s, box-shadow 0.2s;
}

.create-btn-main:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(88, 123, 242, 0.3);
}

.plus-icon {
  font-size: 20px;
  line-height: 1;
}

/* Content */
.content-area {
  padding-top: 40px;
  padding-bottom: 60px;
}

.state-message {
  text-align: center;
  color: #666;
  margin-top: 50px;
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

.empty-state p {
  font-size: 18px;
  color: #666;
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
  transition: all 0.2s;
}

.create-btn-text:hover {
  background: #587bf2;
  color: white;
}

/* Grid */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
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

/* Project Item Wrapper */
.project-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
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
}

.status-badge.draft {
  background-color: #999;
}

.status-badge.active {
  background-color: #4CAF50;
}

/* Control Panel */
.control-panel {
  margin-top: 15px;
  display: flex;
  gap: 10px;
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
  background-color: #FFB039; /* Желтый/Оранжевый из лого */
  color: white;
}

.delete-btn {
  background-color: #E85A5A; /* Красный из лого */
  color: white;
}
</style>
