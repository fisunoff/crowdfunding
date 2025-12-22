<script setup lang="ts">
import {onMounted, computed, ref} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {useProjectsStore} from '@/stores/useProjectsStore';
import {useAuthStore} from '@/stores/useAuthStore';
import EditProjectModal from '@/modules/projects/components/EditProjectModal.vue';
import type {RewardData} from '@/api/types';

const route = useRoute();
const router = useRouter();
const projectsStore = useProjectsStore();
const authStore = useAuthStore();
const projectId = Number(route.params.id);

// --- State ---
const isEditModalOpen = ref(false);

// State для модалки модератора
const isModerationModalOpen = ref(false);
const moderationMessage = ref('');
// Тип действия: 'draft' (на доработку) или 'reject' (отказ)
const moderationAction = ref<'draft' | 'reject'>('draft');

onMounted(() => {
  if (projectId) projectsStore.fetchFullProject(projectId);
});

const project = computed(() => projectsStore.activeProject);
const rewards = computed(() => projectsStore.currentRewards);
const isAuthor = computed(() => authStore.user?.id === project.value?.author_id);
const isAdmin = computed(() => authStore.user?.is_admin);
const canEdit = computed(() => isAuthor.value && (project.value?.status === 'draft' || !!project.value?.moderator_comment));
const canInvest = computed(() => project.value?.status === 'accepted');

// Helpers UI
const mockPercent = computed(() => project.value ? (project.value.id * 17) % 95 : 0);
const mockCollected = computed(() => project.value ? Math.round(project.value.goal_amount * mockPercent.value / 100) : 0);
const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('ru-RU') : '';
const formatMoney = (v?: number) => v ? new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0
}).format(v) : '0 ₽';

// --- Handlers ---

// 1. Открытие модалки модерации
const openModerationModal = (action: 'draft' | 'reject') => {
  moderationAction.value = action;
  moderationMessage.value = ''; // сброс текста
  isModerationModalOpen.value = true;
};

// 2. Подтверждение действия модератора
const confirmModerationAction = async () => {
  if (!moderationMessage.value) return;

  if (moderationAction.value === 'draft') {
    await projectsStore.returnToDraft(projectId, moderationMessage.value);
  } else {
    await projectsStore.rejectProject(projectId, moderationMessage.value);
  }
  isModerationModalOpen.value = false;
};

// 3. Одобрение (без модалки, просто confirm)
const handleAccept = async () => {
  if (confirm('Одобрить этот проект? Он станет доступен для сбора средств.')) {
    await projectsStore.acceptProject(projectId);
  }
};

const handleInvest = async (reward: RewardData) => {
  if (!authStore.isAuthenticated) return router.push({name: 'login'});
  if (confirm(`Купить "${reward.title}"?`)) {
    await projectsStore.contribute(projectId, reward.id);
  }
};

const handleEditModalClose = async () => {
  isEditModalOpen.value = false;
  if (projectId) await projectsStore.fetchFullProject(projectId);
};
</script>

<template>
  <div class="project-details-page">

    <div v-if="!project" class="container loading">Загрузка...</div>

    <div v-else class="container">

      <!-- --- MODERATOR BAR --- -->
      <div v-if="isAdmin && project.status === 'onModeration'" class="moderator-bar">
        <span class="mod-label">🔧 Панель модератора</span>
        <div class="mod-actions">
          <!-- Кнопка: На доработку -->
          <button class="mod-btn draft" @click="openModerationModal('draft')">
            На доработку
          </button>

          <!-- Кнопка: Отклонить (опасно) -->
          <button class="mod-btn reject" @click="openModerationModal('reject')">
            Отказать
          </button>

          <!-- Кнопка: Принять -->
          <button class="mod-btn accept" @click="handleAccept">
            Одобрить
          </button>
        </div>
      </div>

      <!-- --- AUTHOR BAR --- -->
      <div v-if="canEdit" class="author-bar">
        <span>✏️ Вы можете редактировать этот проект</span>
        <button class="edit-btn-small" @click="isEditModalOpen = true">Редактировать</button>
      </div>

      <div class="layout">
        <!-- Main Column -->
        <div class="main-column">
          <div class="project-header">
            <div class="category-badge">{{ project.project_type }}</div>
            <h1 class="project-title">{{ project.title }}</h1>
            <div class="project-meta">
              {{ formatDate(project.start_date) }} — {{ formatDate(project.end_date) }}
            </div>
          </div>

          <img
            :src="`https://placehold.co/800x400/e0e0e0/555555?text=${project.project_type}`"
            class="project-image"
          />

          <!-- Если есть комментарий модератора (для автора или если проект закрыт) -->
          <div v-if="project.moderator_comment" class="moderator-feedback" :class="project.status">
            <strong>{{
                project.status === 'rejected' ? 'Причина отказа' : 'Замечания модератора'
              }}:</strong>
            <p>{{ project.moderator_comment }}</p>
          </div>

          <div class="description-section">
            <h3>О проекте</h3>
            <p class="description-text">{{ project.description }}</p>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="sidebar">
          <div class="stats-card">
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" :style="{ width: `${mockPercent}%` }"></div>
            </div>
            <div class="stat-main-value">{{ formatMoney(mockCollected) }}</div>
            <div class="stat-sub">цель {{ formatMoney(project.goal_amount) }}</div>

            <div class="project-status-info" :class="project.status">
              {{ project.status === 'accepted' ? 'Активен' : project.status }}
            </div>
          </div>

          <div class="rewards-section">
            <h3>Вознаграждения</h3>
            <div v-for="reward in rewards" :key="reward.id" class="reward-card"
                 :class="{ disabled: !canInvest }">
              <div class="reward-price">{{ formatMoney(reward.price) }}</div>
              <div class="reward-title">{{ reward.title }}</div>
              <div class="reward-desc">{{ reward.description }}</div>
              <button class="invest-btn" :disabled="!canInvest" @click="handleInvest(reward)">
                {{ canInvest ? 'Выбрать' : 'Недоступно' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <EditProjectModal
      v-if="isEditModalOpen && project"
      :project="project"
      @close="handleEditModalClose"
    />

    <!-- Универсальная модалка модерации -->
    <div v-if="isModerationModalOpen" class="modal-backdrop">
      <div class="modal-content reject-modal">
        <h3>
          {{ moderationAction === 'draft' ? 'Отправить на доработку' : 'Отклонить проект' }}
        </h3>
        <p class="modal-subtitle">
          {{
            moderationAction === 'draft'
              ? 'Опишите, что нужно исправить. Проект вернется в статус "Черновик".'
              : 'Укажите причину отказа. Проект будет закрыт окончательно.'
          }}
        </p>

        <textarea
          v-model="moderationMessage"
          rows="4"
          :placeholder="moderationAction === 'draft' ? 'Например: Загрузите более качественное фото...' : 'Причина...'"
        ></textarea>

        <div class="modal-actions">
          <button @click="isModerationModalOpen = false">Отмена</button>

          <!-- Кнопка меняет цвет в зависимости от действия -->
          <button
            :class="moderationAction === 'draft' ? 'warn-btn' : 'danger-btn'"
            @click="confirmModerationAction"
          >
            {{ moderationAction === 'draft' ? 'Вернуть автору' : 'Отклонить навсегда' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.project-details-page {
  padding-bottom: 60px;
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 20px;
}

.loading {
  padding: 50px;
  text-align: center;
}

/* Moderator Bar */
.moderator-bar {
  background: #333;
  color: white;
  padding: 15px 20px;
  border-radius: 12px;
  margin: 20px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.mod-label {
  font-weight: 600;
}

.mod-actions {
  display: flex;
  gap: 10px;
}

.mod-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

.mod-btn.draft {
  background: #FFB039;
  color: white;
}

/* Желтый */
.mod-btn.reject {
  background: #E85A5A;
  color: white;
}

/* Красный */
.mod-btn.accept {
  background: #4CAF50;
  color: white;
}

/* Зеленый */

.author-bar {
  background: #333;
  color: white;
  padding: 15px 20px;
  border-radius: 12px;
  margin: 20px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.edit-btn-small {
  background: white;
  color: #333;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

/* Layout */
.layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 40px;
  margin-top: 30px;
}

@media (max-width: 800px) {
  .layout {
    grid-template-columns: 1fr;
  }
}

.project-image {
  width: 100%;
  border-radius: 12px;
  object-fit: cover;
  height: 400px;
  margin-bottom: 20px;
}

.project-title {
  font-size: 36px;
  margin: 10px 0;
  line-height: 1.2;
}

.category-badge {
  color: #587bf2;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 1px;
}

/* Feedback Box */
.moderator-feedback {
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.moderator-feedback.draft {
  background: #FFF8E1;
  border: 1px solid #FFECB3;
  color: #8D6E63;
}

.moderator-feedback.rejected {
  background: #FFEBEE;
  border: 1px solid #FFCDD2;
  color: #B71C1C;
}

/* Sidebar */
.stats-card {
  background: white;
  padding: 25px;
  border-radius: 20px;
  border: 1px solid #eee;
  margin-bottom: 30px;
}

.progress-bar-bg {
  height: 6px;
  background: #eee;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 15px;
}

.progress-bar-fill {
  height: 100%;
  background: #4CAF50;
  border-radius: 3px;
}

.stat-main-value {
  font-size: 32px;
  font-weight: 700;
  color: #4CAF50;
}

.stat-sub {
  color: #999;
  font-size: 13px;
  margin-bottom: 20px;
}

.project-status-info {
  background: #f5f5f5;
  padding: 10px;
  border-radius: 8px;
  text-align: center;
  font-weight: 600;
  font-size: 14px;
}

.project-status-info.accepted {
  color: #4CAF50;
  background: #E8F5E9;
}

/* Rewards */
.reward-card {
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 15px;
}

.reward-price {
  font-size: 20px;
  font-weight: 700;
  color: #333;
}

.invest-btn {
  width: 100%;
  padding: 12px;
  background: #587bf2;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 10px;
}

.invest-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* Modal */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.reject-modal {
  background: white;
  padding: 25px;
  border-radius: 12px;
  width: 400px;
}

.modal-subtitle {
  color: #666;
  font-size: 14px;
  margin-bottom: 15px;
}

.reject-modal textarea {
  width: 100%;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px;
  box-sizing: border-box;
  resize: vertical;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.modal-actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.warn-btn {
  background: #FFB039;
  color: white;
}

.danger-btn {
  background: #E85A5A;
  color: white;
}
</style>
