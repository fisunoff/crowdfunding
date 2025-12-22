<script setup lang="ts">
import {onMounted, computed} from 'vue'; // Добавил computed
import {useRouter} from 'vue-router';
import {useProjectsStore} from '@/stores/useProjectsStore';
import {useStatsStore} from '@/stores/useStatsStore';
import ProjectCard from '@/components/ProjectCard.vue';

const router = useRouter();
const projectsStore = useProjectsStore();
const statsStore = useStatsStore();

onMounted(() => {
  projectsStore.fetchProjects();
  statsStore.fetchGlobalStats();
});

// [НОВОЕ] Фильтруем только активные проекты и берем первые 3
const activeProjects = computed(() => {
  return projectsStore.projects
    .filter(p => p.status === 'accepted') // Только активные
    .slice(0, 3); // Максимум 3 штуки
});

const goToProjects = () => {
  router.push({name: 'projects'});
};

const goToProjectCard = (id: number) => {
  router.push({name: 'projectCard', params: {id}});
};

// Хелпер
const formatMoney = (value: number) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0
  }).format(value);
};
</script>

<template>
  <div class="main-page container">

    <!-- Stats Banner -->
    <div class="stats-banner">
      <div class="stat-item">
        <div class="stat-icon">💰</div>
        <div class="stat-info">
          <!-- Используем total_amount -->
          <div class="stat-value">
            {{ formatMoney(statsStore.stats.total_amount) }}
          </div>
          <div class="stat-label">ОБЩАЯ СУММА СБОРА</div>
        </div>
      </div>

      <div class="stat-item">
        <div class="stat-icon">🎁</div>
        <div class="stat-info">
          <!-- Используем total_count -->
          <div class="stat-value">
            {{ statsStore.stats.total_count.toLocaleString('ru-RU') }}
          </div>
          <div class="stat-label">ВСЕГО ВЗНОСОВ</div>
        </div>
      </div>

      <div class="stat-item">
        <div class="stat-icon">🚀</div>
        <div class="stat-info">
          <!-- Используем cool_projects -->
          <div class="stat-value">
            {{ statsStore.stats.cool_projects.toLocaleString('ru-RU') }}
          </div>
          <div class="stat-label">УСПЕШНЫХ ПРОЕКТОВ</div>
        </div>
      </div>
    </div>

    <!-- New Projects Section -->
    <div class="section-header">
      <h2 class="section-title">Новые проекты</h2>
      <button class="view-all-btn" @click="goToProjects">Посмотреть все</button>
    </div>

    <!-- Loader -->
    <div v-if="projectsStore.isLoading" class="loader">
      Загрузка проектов...
    </div>

    <!-- Error -->
    <div v-else-if="projectsStore.error" class="error">
      {{ projectsStore.error }}
    </div>

    <!-- Projects Grid -->
    <!-- Используем вычисляемое свойство activeProjects -->
    <div v-else-if="activeProjects.length > 0" class="projects-grid">
      <ProjectCard
        v-for="project in activeProjects"
        :key="project.id"
        :project="project"
        @click="goToProjectCard"
      />
    </div>

    <!-- Empty State -->
    <div v-else class="empty-text">
      Пока нет активных проектов.
    </div>

  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.loader, .error, .empty-text {
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 18px;
}

.error {
  color: #e85a5a;
}

/* Stats Banner */
.stats-banner {
  background-color: white;
  border-radius: 20px;
  padding: 30px 40px;
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  margin-bottom: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  flex-wrap: wrap;
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 15px;
  text-align: center;
  flex: 1;
  min-width: 250px;
  justify-content: center;
}

.stat-icon {
  font-size: 24px;
}

.stat-info {
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 10px;
  font-weight: 700;
  color: #777;
  letter-spacing: 1px;
  text-transform: uppercase;
}

/* Section Header */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.section-title {
  font-size: 28px;
  font-weight: 500;
  color: #000;
}

.view-all-btn {
  background-color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: background-color 0.2s;
}

.view-all-btn:hover {
  background-color: #f9f9f9;
}

/* Grid */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
}

/* Адаптивность */
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
</style>
