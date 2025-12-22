<script setup lang="ts">
import {ref, onMounted, reactive} from 'vue';
import {useProjectsStore} from '@/stores/useProjectsStore';
import BaseInput from '@/components/BaseInput.vue';
import type {CreatedProjectData, BaseProjectData, BaseRewardData} from '@/api/types';

const props = defineProps<{
  project: CreatedProjectData;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const store = useProjectsStore();
const activeTab = ref<'main' | 'rewards'>('main');
const isSubmitting = ref(false);

// --- Form: Main Project Data ---
const form = reactive<BaseProjectData>({
  title: props.project.title,
  description: props.project.description,
  goal_amount: props.project.goal_amount,
  project_type: props.project.project_type,
  start_date: props.project.start_date,
  end_date: props.project.end_date
});

// --- Form: New Reward ---
const newReward = reactive<BaseRewardData>({
  title: '',
  description: '',
  price: 0,
  quantity: 10
});

onMounted(() => {
  // При открытии загружаем награды этого проекта
  store.fetchRewards(props.project.id);
});

// --- Handlers ---

const handleUpdateProject = async () => {
  isSubmitting.value = true;
  try {
    await store.updateProject(props.project.id, form);
    emit('close');
  } catch (e) {
    alert('Ошибка обновления');
  } finally {
    isSubmitting.value = false;
  }
};

const handleAddReward = async () => {
  if (!newReward.title || newReward.price <= 0) return;
  try {
    await store.addReward(props.project.id, {...newReward});
    // Сброс формы
    newReward.title = '';
    newReward.description = '';
    newReward.price = 0;
    newReward.quantity = 10;
  } catch (e) {
    alert('Ошибка добавления награды');
  }
};

const handleDeleteReward = async (rewardId: number) => {
  if (!confirm('Удалить награду?')) return;
  await store.removeReward(props.project.id, rewardId);
};
</script>

<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-content">

      <div class="modal-header">
        <h2 class="modal-title">Редактирование</h2>
        <button class="close-icon" @click="$emit('close')">✕</button>
      </div>

      <!-- TABS -->
      <div class="tabs">
        <div
          class="tab"
          :class="{ active: activeTab === 'main' }"
          @click="activeTab = 'main'"
        >
          Основное
        </div>
        <div
          class="tab"
          :class="{ active: activeTab === 'rewards' }"
          @click="activeTab = 'rewards'"
        >
          Вознаграждения
        </div>
      </div>

      <!-- TAB CONTENT: MAIN -->
      <div v-if="activeTab === 'main'" class="tab-content">
        <div class="scrollable-area">
          <div class="form-group">
            <label>Название</label>
            <BaseInput v-model="form.title"/>
          </div>

          <div class="form-group">
            <label>Описание</label>
            <textarea v-model="form.description" class="base-textarea" rows="4"></textarea>
          </div>

          <div class="form-group">
            <label>Сумма сбора (₽)</label>
            <BaseInput v-model="form.goal_amount" type="number"/>
          </div>

          <div class="form-group">
            <label>Категория</label>
            <BaseInput v-model="form.project_type"/>
          </div>

          <div class="dates-row">
            <div class="form-group">
              <label>Начало</label>
              <BaseInput v-model="form.start_date" type="date"/>
            </div>
            <div class="form-group">
              <label>Конец</label>
              <BaseInput v-model="form.end_date" type="date"/>
            </div>
          </div>
        </div>

        <div class="actions">
          <button class="btn save-btn" @click="handleUpdateProject" :disabled="isSubmitting">
            {{ isSubmitting ? 'Сохранение...' : 'Сохранить изменения' }}
          </button>
        </div>
      </div>

      <!-- TAB CONTENT: REWARDS -->
      <div v-else class="tab-content">

        <!-- List of existing rewards -->
        <div class="rewards-list">
          <div v-if="store.currentRewards.length === 0" class="no-rewards">
            Наград пока нет
          </div>
          <div
            v-for="reward in store.currentRewards"
            :key="reward.id"
            class="reward-item"
          >
            <div class="reward-info">
              <div class="reward-title">{{ reward.title }}</div>
              <div class="reward-price">{{ reward.price }} ₽ • {{ reward.quantity }} шт.</div>
            </div>
            <button class="delete-reward-btn" @click="handleDeleteReward(reward.id)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="2">
                <path
                  d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Add new reward form -->
        <div class="add-reward-section">
          <h3>Добавить награду</h3>
          <div class="reward-form-grid">
            <BaseInput v-model="newReward.title" placeholder="Название награды"/>
            <BaseInput v-model="newReward.price" type="number" placeholder="Цена"/>
            <BaseInput v-model="newReward.quantity" type="number" placeholder="Кол-во"/>
          </div>
          <textarea
            v-model="newReward.description"
            class="base-textarea small"
            placeholder="Описание награды"
          ></textarea>
          <button class="btn add-btn" @click="handleAddReward">Добавить</button>
        </div>

      </div>

    </div>
  </div>
</template>

<style scoped>
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
  z-index: 1000;
}

.modal-content {
  background: white;
  width: 100%;
  max-width: 600px;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  max-height: 90vh; /* Чтобы не вылезало за экран */
}

.modal-header {
  padding: 20px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
}

.modal-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
}

.close-icon {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}

/* Tabs */
.tabs {
  display: flex;
  border-bottom: 1px solid #eee;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 15px;
  cursor: pointer;
  font-weight: 600;
  color: #999;
  transition: all 0.2s;
}

.tab.active {
  color: #587bf2;
  border-bottom: 2px solid #587bf2;
  background: #f9fbfc;
}

/* Content */
.tab-content {
  padding: 30px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow: hidden;
}

.scrollable-area {
  overflow-y: auto;
  padding-right: 5px;
  margin-bottom: 20px;
}

/* Inputs */
.form-group label {
  display: block;
  margin-bottom: 5px;
  font-size: 13px;
  font-weight: 600;
  color: #555;
  margin-left: 10px;
}

.base-textarea {
  width: 100%;
  padding: 14px 20px;
  border-radius: 20px;
  border: none;
  background-color: #f5f5f5;
  font-family: inherit;
  font-size: 14px;
  outline: none;
  margin-bottom: 15px;
  resize: none;
  box-sizing: border-box;
}

.dates-row {
  display: flex;
  gap: 20px;
}

.dates-row .form-group {
  flex: 1;
}

/* Buttons */
.actions {
  margin-top: auto;
}

.btn {
  width: 100%;
  padding: 14px;
  border-radius: 30px;
  border: none;
  font-weight: 600;
  cursor: pointer;
}

.save-btn {
  background-color: #587bf2;
  color: white;
}

.add-btn {
  background-color: #333;
  color: white;
  margin-top: 10px;
}

/* Rewards Specific */
.rewards-list {
  flex-grow: 1;
  overflow-y: auto;
  margin-bottom: 20px;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 10px;
}

.no-rewards {
  text-align: center;
  color: #999;
  padding: 20px;
}

.reward-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.reward-item:last-child {
  border-bottom: none;
}

.reward-title {
  font-weight: 600;
  font-size: 14px;
}

.reward-price {
  font-size: 12px;
  color: #666;
}

.delete-reward-btn {
  background: #fff0f0;
  border: none;
  color: #E85A5A;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-reward-section {
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.add-reward-section h3 {
  margin: 0 0 15px 0;
  font-size: 16px;
}

.reward-form-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 10px;
}

.base-textarea.small {
  padding: 10px 15px;
  min-height: 60px;
  margin-bottom: 0;
}
</style>
