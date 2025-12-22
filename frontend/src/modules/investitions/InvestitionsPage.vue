<script setup lang="ts">
import {onMounted} from 'vue';
import {useRouter} from 'vue-router';
import {useContribStore} from '@/stores/useContribStore';

const router = useRouter();
const contribStore = useContribStore();

onMounted(() => {
  contribStore.fetchMyContributions();
});

const goToProject = (projectId: number) => {
  router.push({name: 'projectCard', params: {id: projectId}});
};

// Хелперы форматирования
const formatMoney = (val: number) => new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0
}).format(val);
const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
});
</script>

<template>
  <div class="investitions-page">

    <!-- Header with Stats -->
    <div class="page-header">
      <div class="container header-content">
        <div>
          <h1 class="page-title">Мои вклады</h1>
          <p class="subtitle">История вашей поддержки проектов</p>
        </div>

        <div class="summary-card">
          <div class="summary-item">
            <div class="sum-val">{{ contribStore.contributions.length }}</div>
            <div class="sum-lbl">проектов поддержано</div>
          </div>
          <div class="summary-divider"></div>
          <div class="summary-item">
            <div class="sum-val highlight">{{ formatMoney(contribStore.totalSpent) }}</div>
            <div class="sum-lbl">всего вложено</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="container content-area">

      <div v-if="contribStore.isLoading" class="state-message">Загрузка истории...</div>

      <div v-else-if="contribStore.contributions.length === 0" class="empty-state">
        <div class="empty-icon">💸</div>
        <h3>Вы еще не делали вкладов</h3>
        <p>Найдите интересный проект и поддержите его!</p>
        <button class="find-btn" @click="router.push({name: 'projects'})">Найти проект</button>
      </div>

      <div v-else class="contrib-list">
        <div
          v-for="item in contribStore.contributions"
          :key="item.id"
          class="contrib-card"
        >
          <!-- Left: Project Info -->
          <div class="project-section" @click="goToProject(item.project.id)">
            <div
              class="project-thumb"
              :style="{ backgroundImage: `url(https://placehold.co/100x100/e0e0e0/555?text=${item.project.project_type.charAt(0)})` }"
            ></div>
            <div class="project-details">
              <div class="project-category">{{ item.project.project_type }}</div>
              <h3 class="project-title">{{ item.project.title }}</h3>
              <div class="project-link">Перейти к проекту →</div>
            </div>
          </div>

          <!-- Divider -->
          <div class="card-divider"></div>

          <!-- Right: Reward & Payment Info -->
          <div class="reward-section">
            <div class="reward-header">
              <span class="date">{{ formatDate(item.created_at) }}</span>
              <span class="status-badge">Оплачено</span>
            </div>

            <div class="reward-content">
              <div class="reward-title">Награда: {{ item.reward.title }}</div>
              <div class="reward-desc">{{ item.reward.description }}</div>
            </div>

            <div class="price-tag">
              {{ formatMoney(item.reward.price) }}
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.investitions-page {
  min-height: 80vh;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Header */
.page-header {
  background-color: #f9f9f9;
  padding: 40px 0;
  border-bottom: 1px solid #eee;
  margin-bottom: 40px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.page-title {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
}

.subtitle {
  margin: 5px 0 0 0;
  color: #666;
  font-size: 16px;
}

/* Summary Card in Header */
.summary-card {
  background: white;
  padding: 15px 30px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 20px;
}

.summary-item {
  text-align: center;
}

.sum-val {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  line-height: 1;
}

.sum-val.highlight {
  color: #587bf2;
}

.sum-lbl {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
  text-transform: uppercase;
}

.summary-divider {
  width: 1px;
  height: 40px;
  background: #eee;
}

/* List */
.contrib-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Card */
.contrib-card {
  background: white;
  border-radius: 20px;
  border: 1px solid #eee;
  display: flex;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.contrib-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.06);
}

/* Left: Project */
.project-section {
  flex: 4;
  padding: 20px;
  display: flex;
  gap: 15px;
  cursor: pointer;
  transition: background 0.2s;
}

.project-section:hover {
  background: #fdfdfd;
}

.project-section:hover .project-link {
  color: #587bf2;
}

.project-thumb {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
}

.project-details {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.project-category {
  font-size: 11px;
  text-transform: uppercase;
  color: #999;
  font-weight: 700;
  margin-bottom: 4px;
}

.project-title {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 700;
  color: #333;
}

.project-link {
  font-size: 13px;
  color: #666;
  font-weight: 500;
}

/* Divider */
.card-divider {
  width: 1px;
  background: #eee;
  margin: 15px 0;
}

/* Right: Reward */
.reward-section {
  flex: 5;
  padding: 20px;
  display: flex;
  flex-direction: column;
  position: relative;
}

.reward-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.date {
  font-size: 13px;
  color: #999;
}

.status-badge {
  background: #E8F5E9;
  color: #2E7D32;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.reward-content {
  flex-grow: 1;
}

.reward-title {
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 5px;
  color: #000;
}

.reward-desc {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
}

.price-tag {
  position: absolute;
  bottom: 20px;
  right: 20px;
  font-size: 20px;
  font-weight: 800;
  color: #333;
}

/* Empty State */
.state-message {
  text-align: center;
  margin-top: 50px;
  color: #666;
}

.empty-state {
  text-align: center;
  margin-top: 50px;
  background: white;
  padding: 40px;
  border-radius: 20px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.find-btn {
  margin-top: 20px;
  background: #587bf2;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 30px;
  font-weight: 600;
  cursor: pointer;
}

/* Mobile */
@media (max-width: 768px) {
  .contrib-card {
    flex-direction: column;
  }

  .card-divider {
    width: 100%;
    height: 1px;
    margin: 0;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .summary-card {
    width: 100%;
    justify-content: space-around;
    box-sizing: border-box;
  }
}
</style>
