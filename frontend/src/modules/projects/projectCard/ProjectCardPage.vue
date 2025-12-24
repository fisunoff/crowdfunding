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
const isModerationModalOpen = ref(false);
const moderationMessage = ref('');
const moderationAction = ref<'draft' | 'reject'>('draft');

// [НОВОЕ] State для модалки оплаты
const isInvestModalOpen = ref(false);
const selectedReward = ref<RewardData | null>(null);

const currentAmount = computed(() => {
  if (!project.value) return 0;
  return projectsStore.projectStats[project.value.id] || 0;
});

const progressPercent = computed(() => {
  if (!project.value || project.value.goal_amount === 0) return 0;
  return (currentAmount.value / project.value.goal_amount) * 100;
});

// ...
// Также добавь вызов подсчета в onMounted
onMounted(async () => {
  if (projectId) {
    await projectsStore.fetchFullProject(projectId);
    // [НОВОЕ] Считаем деньги для этого проекта
    await projectsStore.calculateProjectStats(projectId);
  }
});

const project = computed(() => projectsStore.activeProject);
const rewards = computed(() => projectsStore.currentRewards);

// Permissions
const isAuthor = computed(() => authStore.user?.id === project.value?.author_id);
const isAdmin = computed(() => authStore.user?.is_admin);

// [ИСПРАВЛЕНО] Редактировать можно только Draft
const canEdit = computed(() => isAuthor.value && project.value?.status === 'draft');
const canInvest = computed(() => project.value?.status === 'accepted');

// Helpers UI
const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('ru-RU') : '';
const formatMoney = (v?: number) => v ? new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0
}).format(v) : '0 ₽';

const getStatusLabel = (status?: string) => {
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
      return status || 'Неизвестно';
  }
};

// --- Handlers ---

// [НОВОЕ] Открытие окна оплаты
const openInvestModal = (reward: RewardData) => {
  if (!authStore.isAuthenticated) {
    router.push({name: 'login'});
    return;
  }
  selectedReward.value = reward;
  isInvestModalOpen.value = true;
};

// [НОВОЕ] Подтверждение оплаты
const confirmInvest = async () => {
  if (!selectedReward.value) return;

  await projectsStore.contribute(projectId, selectedReward.value.id);

  isInvestModalOpen.value = false;
  selectedReward.value = null;
  // Обновляем данные (кол-во наград могло измениться)
  await projectsStore.fetchFullProject(projectId);
};

const handleSubmit = async () => {
  if (!project.value) return;
  const isResubmit = !!project.value.moderator_comment;
  const text = isResubmit
    ? 'Вы исправили замечания и хотите отправить проект на повторную проверку?'
    : 'Отправить проект на модерацию? Вы не сможете редактировать его во время проверки.';

  if (confirm(text)) {
    try {
      await projectsStore.submitProject(projectId);
      await projectsStore.fetchFullProject(projectId);
    } catch (e) {
      alert('Ошибка при отправке');
    }
  }
};

const openModerationModal = (action: 'draft' | 'reject') => {
  moderationAction.value = action;
  moderationMessage.value = '';
  isModerationModalOpen.value = true;
};

const confirmModerationAction = async () => {
  if (!moderationMessage.value) return;
  if (moderationAction.value === 'draft') {
    await projectsStore.returnToDraft(projectId, moderationMessage.value);
  } else {
    await projectsStore.rejectProject(projectId, moderationMessage.value);
  }
  isModerationModalOpen.value = false;
};

const handleAccept = async () => {
  if (confirm('Одобрить этот проект?')) {
    await projectsStore.acceptProject(projectId);
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

      <!-- Moderator Bar -->
      <div v-if="isAdmin && project.status === 'onModeration'" class="moderator-bar">
        <span class="mod-label">🔧 Панель модератора</span>
        <div class="mod-actions">
          <button class="mod-btn draft" @click="openModerationModal('draft')">На доработку</button>
          <button class="mod-btn reject" @click="openModerationModal('reject')">Отказать</button>
          <button class="mod-btn accept" @click="handleAccept">Одобрить</button>
        </div>
      </div>

      <!-- Author Bar -->
      <div v-if="canEdit" class="author-bar">
        <span class="author-label">✏️ Ваша панель управления</span>
        <div class="author-actions">
          <button class="action-btn edit" @click="isEditModalOpen = true">Редактировать</button>
          <button class="action-btn submit" @click="handleSubmit">
            {{ project.moderator_comment ? 'Отправить повторно' : 'На модерацию' }}
          </button>
        </div>
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

          <img :src="`https://placehold.co/800x400/e0e0e0/555555?text=${project.project_type}`"
               class="project-image"/>

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
              <div class="progress-bar-fill" :style="{ width: `${Math.round(progressPercent)}%` }"></div>
            </div>
            <div class="stat-main-value">{{ formatMoney(currentAmount) }}</div>
            <div class="stat-sub">цель {{ formatMoney(project.goal_amount) }}</div>
            <div class="project-status-info" :class="project.status">
              {{ getStatusLabel(project.status) }}
            </div>
          </div>

          <div class="rewards-section">
            <h3>Вознаграждения</h3>
            <div v-if="rewards.length === 0" class="no-rewards">Нет доступных наград</div>
            <div v-for="reward in rewards" :key="reward.id" class="reward-card"
                 :class="{ disabled: !canInvest }">
              <div class="reward-price">{{ formatMoney(reward.price) }}</div>
              <div class="reward-title">{{ reward.title }}</div>
              <div class="reward-desc">{{ reward.description }}</div>
              <!-- Используем openInvestModal вместо handleInvest -->
              <button class="invest-btn" :disabled="!canInvest" @click="openInvestModal(reward)">
                {{ canInvest ? 'Выбрать' : 'Недоступно' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <EditProjectModal v-if="isEditModalOpen && project" :project="project"
                      @close="handleEditModalClose"/>

    <!-- Модалка модерации -->
    <div v-if="isModerationModalOpen" class="modal-backdrop">
      <div class="modal-content reject-modal">
        <h3>{{ moderationAction === 'draft' ? 'Отправить на доработку' : 'Отклонить проект' }}</h3>
        <p class="modal-subtitle">
          {{
            moderationAction === 'draft' ? 'Опишите, что нужно исправить.' : 'Укажите причину отказа.'
          }}
        </p>
        <textarea v-model="moderationMessage" rows="4"></textarea>
        <div class="modal-actions">
          <button @click="isModerationModalOpen = false">Отмена</button>
          <button :class="moderationAction === 'draft' ? 'warn-btn' : 'danger-btn'"
                  @click="confirmModerationAction">
            {{ moderationAction === 'draft' ? 'Вернуть автору' : 'Отклонить навсегда' }}
          </button>
        </div>
      </div>
    </div>

    <!-- [НОВОЕ] Модальное окно подтверждения оплаты -->
    <div v-if="isInvestModalOpen && selectedReward" class="modal-backdrop">
      <div class="modal-content invest-modal">
        <div class="modal-header-simple">Подтверждение взноса</div>

        <div class="bill-row">
          <span class="label">Награда:</span>
          <span class="value">{{ selectedReward.title }}</span>
        </div>

        <div class="bill-row">
          <span class="label">Счет списания:</span>
          <span class="value account-number">{{ authStore.user?.bank_number }}</span>
        </div>

        <div class="bill-divider"></div>

        <div class="bill-total">
          <span>К оплате:</span>
          <span class="total-price">{{ formatMoney(selectedReward.price) }}</span>
        </div>

        <div class="modal-actions full-width">
          <button class="cancel-btn" @click="isInvestModalOpen = false">Отмена</button>
          <button class="pay-btn" @click="confirmInvest">Оплатить</button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* Стили страницы (остались прежними, скрыл для краткости, они те же что и были) */
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

/* Moderator & Author Bars */
.moderator-bar, .author-bar {
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

.mod-actions, .author-actions {
  display: flex;
  gap: 10px;
}

.mod-btn, .action-btn {
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

.mod-btn.reject {
  background: #E85A5A;
  color: white;
}

.mod-btn.accept {
  background: #4CAF50;
  color: white;
}

.action-btn.edit {
  background: white;
  color: #333;
}

.action-btn.submit {
  background: #587bf2;
  color: white;
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

/* Feedback */
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
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  font-weight: 700;
  font-size: 14px;
  text-transform: uppercase;
}

.project-status-info.draft {
  background: #f0f0f0;
  color: #666;
}

.project-status-info.onModeration {
  background: #FFF3E0;
  color: #EF6C00;
}

.project-status-info.accepted {
  background: #E8F5E9;
  color: #2E7D32;
}

.project-status-info.rejected {
  background: #FFEBEE;
  color: #C62828;
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

/* Modals General */
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

/* [НОВЫЕ СТИЛИ] Invest Modal */
.invest-modal {
  background: white;
  padding: 30px;
  border-radius: 20px;
  width: 400px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal-header-simple {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 25px;
  text-align: center;
  color: #333;
}

.bill-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 15px;
}

.bill-row .label {
  color: #666;
}

.bill-row .value {
  font-weight: 600;
  color: #000;
  text-align: right;
}

.account-number {
  font-family: monospace;
  letter-spacing: 1px;
  color: #555;
}

.bill-divider {
  height: 1px;
  background: #eee;
  margin: 20px 0;
  border-bottom: 1px dashed #ccc;
}

.bill-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.bill-total span:first-child {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.total-price {
  font-size: 28px;
  font-weight: 800;
  color: #587bf2;
}

.full-width {
  width: 100%;
  justify-content: space-between;
}

.full-width button {
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
}

.cancel-btn {
  background: #f0f0f0;
  color: #333;
  margin-right: 10px;
}

.pay-btn {
  background: #4CAF50;
  color: white;
}

.pay-btn:hover {
  background: #43A047;
}
</style>
