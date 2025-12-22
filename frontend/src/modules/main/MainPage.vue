<script setup lang="ts">
import {onMounted} from 'vue';
import {useRouter} from 'vue-router';
import {useProjectsStore} from '@/stores/useProjectsStore';
import {useStatsStore} from '@/stores/useStatsStore';

const router = useRouter();
const projectsStore = useProjectsStore();
const statsStore = useStatsStore();

onMounted(() => {
  projectsStore.fetchProjects();
  statsStore.fetchGlobalStats();
});

// Переход к списку всех проектов
const goToProjects = () => {
  router.push({name: 'projects'});
};

// Переход к карточке проекта
const goToProjectCard = (id: number) => {
  router.push({name: 'projectCard', params: {id}});
};

// --- Хелперы для отображения ---

// Форматирование валюты (например: 2 354 999 ₽)
const formatMoney = (value: number) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0
  }).format(value);
};

// Подсчет дней до конца
const getDaysLeft = (endDateStr: string): number => {
  const end = new Date(endDateStr);
  const now = new Date();
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

// Генерация картинки-заглушки (так как в API нет поля image)
const getPlaceholderImage = (id: number) => {
  // Используем сервис генерации картинок или локальные ассеты
  // Можно чередовать цвета для разнообразия
  const colors = ['587bf2', 'e85a5a', 'FFB039', '333333'];
  const color = colors[id % colors.length];
  return `https://placehold.co/600x400/${color}/ffffff?text=Project+${id}`;
};

</script>

<template>
  <div class="main-page container">

    <!-- Stats Banner -->
    <div class="stats-banner">
      <div class="stat-item">
        <div class="stat-icon">💰</div>
        <div class="stat-info">
          <div class="stat-value">
            {{ formatMoney(statsStore.stats.total_money) }}
          </div>
          <div class="stat-label">ОБЩАЯ СУММА СОБРАННЫХ СРЕДСТВ</div>
        </div>
      </div>

      <div class="stat-item">
        <div class="stat-icon">🎁</div>
        <div class="stat-info">
          <div class="stat-value">
            {{ statsStore.stats.rewards_count.toLocaleString('ru-RU') }}
          </div>
          <div class="stat-label">ВОЗНАГРАЖДЕНИЙ КУПЛЕНО</div>
        </div>
      </div>

      <div class="stat-item">
        <div class="stat-icon">🚀</div>
        <div class="stat-info">
          <div class="stat-value">
            {{ statsStore.stats.successful_projects.toLocaleString('ru-RU') }}
          </div>
          <div class="stat-label">УСПЕШНЫХ ПРОЕКТА</div>
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
    <div v-else class="projects-grid">
      <!-- Берем только первые 3 проекта для главной (slice(0, 3)) -->
      <div
        v-for="project in projectsStore.projects.slice(0, 3)"
        :key="project.id"
        class="project-card"
        @click="goToProjectCard(project.id)"
      >
        <div class="card-image">
          <div
            class="placeholder-img"
            :style="{ backgroundImage: `url(${getPlaceholderImage(project.id)})` }"
          ></div>
        </div>
        <div class="card-content">
          <h3 class="card-title">{{ project.title }}</h3>
          <p class="card-desc">
            {{
              project.description.length > 100 ? project.description.slice(0, 100) + '...' : project.description
            }}
          </p>

          <div class="card-footer">
            <div class="status-item">
              <span class="rocket-icon">🚀</span>
              <!-- Пока выводим статус как есть, так как нет данных о прогрессе сбора -->
              {{ project.status === 'active' ? 'Идет сбор' : project.status }}
            </div>
            <div class="status-item">
              <span class="clock-icon">🕐</span>
              Осталось {{ getDaysLeft(project.end_date) }} дн.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!projectsStore.isLoading && projectsStore.projects.length === 0" class="empty-text">
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
  flex-wrap: wrap; /* Чтобы на мобильных не ломалось */
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 15px;
  text-align: center;
  flex: 1;
  min-width: 250px; /* Минимальная ширина для переноса */
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
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

/* Card */
.project-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  height: 100%; /* Чтобы карточки были одинаковой высоты */
}

.project-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
}

.card-image {
  height: 200px;
  background-color: #ddd;
}

.placeholder-img {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
}

.card-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 10px;
  color: #333;
  line-height: 1.3;
}

.card-desc {
  font-size: 12px;
  color: #666;
  margin-bottom: 20px;
  line-height: 1.5;
  flex-grow: 1;
}

.card-footer {
  display: flex;
  justify-content: space-between; /* Разносим статус и время */
  font-size: 11px;
  color: #555;
  font-weight: 600;
  border-top: 1px solid #f0f0f0;
  padding-top: 15px;
  margin-top: auto; /* Прижимаем к низу */
}

.status-item {
  display: flex;
  align-items: center;
  gap: 5px;
}
</style>
