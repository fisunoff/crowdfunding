<script setup lang="ts">
import {computed, onMounted} from 'vue';
import {useRouter} from 'vue-router';
import {useProjectsStore} from '@/stores/useProjectsStore';
import ProjectCard from '@/components/ProjectCard.vue';

const router = useRouter();
const projectsStore = useProjectsStore();

onMounted(() => {
  projectsStore.fetchProjects();
});

// Фильтруем только проекты "На проверке"
const moderationQueue = computed(() => {
  return projectsStore.projects.filter(p => p.status === 'onModeration');
});

const handleCardClick = (id: number) => {
  // Переходим на ту же детальную страницу, там мы уже сделали панель модератора
  router.push({name: 'projectCard', params: {id}});
};
</script>

<template>
  <div class="moderation-page">

    <!-- Header -->
    <div class="page-header">
      <div class="container">
        <h1 class="page-title">Панель модератора</h1>
        <p class="subtitle">Проекты, ожидающие вашего решения</p>
      </div>
    </div>

    <!-- Content -->
    <div class="container content-area">

      <!-- Loader -->
      <div v-if="projectsStore.isLoading" class="state-message">
        Загрузка очереди...
      </div>

      <!-- Empty State -->
      <div v-else-if="moderationQueue.length === 0" class="empty-state">
        <div class="empty-icon">✅</div>
        <h3>Очередь пуста</h3>
        <p>Все проекты проверены.</p>
      </div>

      <!-- Grid -->
      <div v-else class="projects-grid">
        <div v-for="project in moderationQueue" :key="project.id" class="project-wrapper">
          <!-- Добавим метку даты создания/обновления, если бы она была в API, но пока просто карточка -->
          <ProjectCard
            :project="project"
            @click="handleCardClick"
          />
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.moderation-page {
  min-height: 80vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Header */
.page-header {
  background-color: #333; /* Темный фон для админки */
  color: white;
  padding: 40px 0;
  margin-bottom: 40px;
}

.page-title {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
}

.subtitle {
  opacity: 0.7;
  margin-top: 10px;
  font-size: 16px;
}

/* Content */
.content-area {
  padding-bottom: 60px;
}

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

.state-message {
  text-align: center;
  margin-top: 50px;
  font-size: 18px;
  color: #666;
}

/* Empty State */
.empty-state {
  text-align: center;
  background: #f9f9f9;
  padding: 50px;
  border-radius: 20px;
  margin-top: 20px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.empty-state h3 {
  margin: 0 0 10px 0;
  color: #333;
}

.empty-state p {
  margin: 0;
  color: #777;
}
</style>
