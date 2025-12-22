<script setup lang="ts">
import {computed} from 'vue';
import type {CreatedProjectData} from '@/api/types.ts';

const props = defineProps<{
  project: CreatedProjectData;
}>();

const emit = defineEmits<{
  (e: 'click', id: number): void;
}>();

// --- Визуальные заглушки (пока бэкенд не дает эти данные) ---

// Генерируем картинку на основе ID, чтобы они были разными, но постоянными для одного проекта
const placeholderImage = computed(() => {
  const themes = ['tech', 'arch', 'nature', 'people'];
  const theme = themes[props.project.id % themes.length];
  // Используем сервис для картинок
  return `https://placehold.co/600x400/e0e0e0/555555?text=${theme}`;
});

// Имитация собранных средств (для визуала)
// В реале тут будет: (props.project.current_amount / props.project.goal_amount) * 100
const mockPercent = computed(() => {
  // Просто для примера генерируем число от 0 до 100 на основе ID
  return (props.project.id * 17) % 100;
});

const mockCurrentAmount = computed(() => {
  return Math.round((props.project.goal_amount * mockPercent.value) / 100);
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
      <!-- Категория (Project Type) -->
      <div class="category">
        {{ project.project_type || 'Общее' }}
      </div>

      <!-- Заголовок -->
      <h3 class="title" :title="project.title">
        {{ project.title }}
      </h3>

      <!-- Описание (с ограничением строк в CSS) -->
      <p class="description">
        {{ project.description }}
      </p>

      <!-- Подвал карточки (Прогресс и цифры) -->
      <div class="footer">
        <!-- Progress Bar -->
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" :style="{ width: `${mockPercent}%` }"></div>
        </div>

        <div class="stats-row">
          <div class="stat-left">
            <div class="percent-text">{{ mockPercent }} %</div>
            <div class="label-text">ИДЁТ СБОР</div>
          </div>
          <div class="stat-right">
            <div class="amount-text">{{ formatMoney(mockCurrentAmount) }}</div>
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
  /* Легкая тень, как на скринах */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  height: 100%; /* Растягиваем на всю высоту ячейки грида */
  min-height: 450px; /* Минимальная высота как на макете */
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
  text-transform: uppercase; /* Или capitalize */
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

  /* Ограничение в 3 строки (если заголовок длинный) */
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.description {
  font-size: 13px;
  color: #666; /* Серый цвет описания */
  line-height: 1.5;
  margin: 0 0 20px 0;
  flex-grow: 1; /* Описание занимает свободное место, толкая футер вниз */

  /* Ограничение в 5-6 строк */
  display: -webkit-box;
  -webkit-line-clamp: 6;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.footer {
  margin-top: auto; /* Прижимаем к низу */
}

/* Прогресс бар */
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
  background-color: #587bf2; /* Синий цвет из макета */
  border-radius: 2px;
}

/* Статистика */
.stats-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.stat-left {
  text-align: left;
}

.stat-right {
  text-align: right;
}

.percent-text {
  font-size: 18px;
  font-weight: 700;
  color: #587bf2; /* Синий */
  margin-bottom: 2px;
}

.amount-text {
  font-size: 18px;
  font-weight: 700;
  color: #000; /* Черный */
  margin-bottom: 2px;
}

.label-text {
  font-size: 10px;
  color: #999;
  text-transform: uppercase;
}
</style>
