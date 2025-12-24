<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useProjectsStore } from '@/stores/useProjectsStore';
import type { CreatedProjectData } from '@/api/types.ts';

const props = defineProps<{
  project: CreatedProjectData;
}>();

const emit = defineEmits<{
  (e: 'click', id: number): void;
}>();

const projectsStore = useProjectsStore();

onMounted(() => {
  // При монтировании карточки запускаем подсчет статистики для этого проекта
  projectsStore.calculateProjectStats(props.project.id);
});

// Картинка (заглушка)
const placeholderImage = computed(() => {
  const themes = ['tech', 'arch', 'nature', 'people'];
  const theme = themes[props.project.id % themes.length];
  return `https://placehold.co/600x400/e0e0e0/555555?text=${props.project.project_type || theme}`;
});

// [НОВОЕ] Берем собранную сумму из Store
const currentAmount = computed(() => {
  return projectsStore.projectStats[props.project.id] || 0;
});

// [НОВОЕ] Считаем процент
const progressPercent = computed(() => {
  if (!props.project.goal_amount || props.project.goal_amount === 0) return 0;
  const percent = (currentAmount.value / props.project.goal_amount) * 100;
  return Math.min(percent, 100); // Не больше 100% для бара (визуально)
});

// Форматирование денег
const formatMoney = (value: number) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0
  }).format(value);
};
</script>

<template>
  <div class="card" @click="emit('click', project.id)">
    <div class="card-image" :style="{ backgroundImage: `url(${placeholderImage})` }"></div>

    <div class="card-body">
      <div class="category">{{ project.project_type || 'Общее' }}</div>

      <h3 class="title" :title="project.title">{{ project.title }}</h3>

      <p class="description">{{ project.description }}</p>

      <div class="footer">
        <!-- Progress Bar -->
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" :style="{ width: `${progressPercent}%` }"></div>
        </div>

        <div class="stats-row">
          <div class="stat-left">
            <div class="percent-text">{{ Math.round(progressPercent) }} %</div>
            <div class="label-text">ИДЁТ СБОР</div>
          </div>
          <div class="stat-right">
            <!-- Реальная сумма -->
            <div class="amount-text">{{ formatMoney(currentAmount) }}</div>
            <div class="label-text">СОБРАНО</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  background: #ffffff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  height: 100%;
  min-height: 450px;
  border-radius: 12px; /* Добавил скругление */
  overflow: hidden;    /* Чтобы картинка не вылезала */
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.card-image {
  width: 100%;
  height: 200px;
  background-size: cover;
  background-position: center;
  background-color: #eee;
}

.card-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.category {
  font-size: 12px;
  text-transform: uppercase;
  color: #333;
  text-decoration: underline;
  margin-bottom: 8px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.title {
  font-size: 18px;
  font-weight: 700;
  color: #000;
  margin: 0 0 12px 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* Уменьшил до 2 строк для красоты */
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.description {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  margin: 0 0 20px 0;
  flex-grow: 1;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.footer {
  margin-top: auto;
}

.progress-bar-bg {
  width: 100%;
  height: 4px;
  background-color: #E0E0E0;
  border-radius: 2px;
  margin-bottom: 12px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background-color: #587bf2;
  border-radius: 2px;
  transition: width 0.5s ease-out; /* Плавная анимация */
}

.stats-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.stat-left { text-align: left; }
.stat-right { text-align: right; }

.percent-text {
  font-size: 18px;
  font-weight: 700;
  color: #587bf2;
  margin-bottom: 2px;
}

.amount-text {
  font-size: 18px;
  font-weight: 700;
  color: #000;
  margin-bottom: 2px;
}

.label-text {
  font-size: 10px;
  color: #999;
  text-transform: uppercase;
}
</style>
