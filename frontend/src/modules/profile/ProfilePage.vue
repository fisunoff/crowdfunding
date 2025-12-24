<script setup lang="ts">
import { computed, ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';
import BaseInput from '@/components/BaseInput.vue';
import type { BaseProfileData } from '@/api/types';

const router = useRouter();
const authStore = useAuthStore();

const user = computed(() => authStore.user);

// --- Режим просмотра ---
const fullName = computed(() => {
  if (!user.value) return 'Загрузка...';
  return `${user.value.surname} ${user.value.name} ${user.value.patronymic || ''}`.trim();
});

const initials = computed(() => {
  if (!user.value) return 'U';
  return (user.value.surname[0] + user.value.name[0]).toUpperCase();
});

const userRoles = computed(() => {
  if (!user.value) return [];
  const roles = [];
  if (user.value.is_admin) roles.push('Администратор');
  if (user.value.is_author) roles.push('Автор проектов');
  if (user.value.is_investor) roles.push('Инвестор');
  return roles;
});

// --- Режим редактирования ---
const isEditing = ref(false);
const editForm = reactive<BaseProfileData>({
  name: '',
  surname: '',
  patronymic: '',
  bank_number: '',
  phone_number: ''
});

const startEditing = () => {
  if (!user.value) return;
  // Копируем текущие данные в форму
  editForm.name = user.value.name;
  editForm.surname = user.value.surname;
  editForm.patronymic = user.value.patronymic || '';
  editForm.bank_number = user.value.bank_number;
  editForm.phone_number = user.value.phone_number || '';
  isEditing.value = true;
};

const cancelEditing = () => {
  isEditing.value = false;
};

const saveProfile = async () => {
  try {
    await authStore.updateUser({
      ...editForm,
      phone_number: editForm.phone_number || null // API принимает null, если пусто
    });
    isEditing.value = false;
  } catch (e) {
    alert('Не удалось сохранить изменения');
  }
};

const handleLogout = () => {
  if (confirm('Вы действительно хотите выйти из аккаунта?')) {
    authStore.logout();
    router.push({ name: 'login' });
  }
};
</script>

<template>
  <div class="profile-page">
    <div class="container">

      <div v-if="!user" class="loading">Загрузка профиля...</div>

      <div v-else class="profile-layout">

        <div class="profile-card">

          <!-- Аватар всегда виден -->
          <div class="profile-header">
            <div class="avatar-circle">{{ initials }}</div>

            <!-- VIEW MODE: Имя -->
            <h1 v-if="!isEditing" class="user-name">{{ fullName }}</h1>

            <!-- EDIT MODE: Поля ФИО -->
            <div v-else class="edit-name-group">
              <BaseInput v-model="editForm.surname" placeholder="Фамилия" />
              <BaseInput v-model="editForm.name" placeholder="Имя" />
              <BaseInput v-model="editForm.patronymic" placeholder="Отчество" />
            </div>

            <div class="roles-list">
              <span v-for="role in userRoles" :key="role" class="role-badge">{{ role }}</span>
            </div>
          </div>

          <div class="divider"></div>

          <!-- Детальная информация -->
          <div class="info-section">
            <h2 class="section-title">Контактная информация</h2>

            <div class="info-row">
              <span class="label">Логин:</span>
              <span class="value">{{ user.login }}</span> <!-- Логин менять нельзя -->
            </div>

            <div class="info-row">
              <span class="label">Телефон:</span>
              <span v-if="!isEditing" class="value">{{ user.phone_number || 'Не указан' }}</span>
              <div v-else class="edit-field">
                <BaseInput v-model="editForm.phone_number" placeholder="Номер телефона" type="tel" />
              </div>
            </div>
          </div>

          <div class="divider"></div>

          <div class="info-section">
            <h2 class="section-title">Финансовая информация</h2>
            <div class="info-row">
              <span class="label">Банковский счет:</span>
              <span v-if="!isEditing" class="value bank-font">{{ user.bank_number }}</span>
              <div v-else class="edit-field">
                <BaseInput v-model="editForm.bank_number" placeholder="Банковский счет" />
              </div>
            </div>
          </div>

          <!-- Кнопки действий -->
          <div class="actions-section">

            <!-- Кнопки для режима редактирования -->
            <div v-if="isEditing" class="edit-buttons">
              <button class="btn cancel-btn" @click="cancelEditing">Отмена</button>
              <button class="btn save-btn" @click="saveProfile" :disabled="authStore.isLoading">
                {{ authStore.isLoading ? 'Сохранение...' : 'Сохранить' }}
              </button>
            </div>

            <!-- Кнопки для режима просмотра -->
            <div v-else class="view-buttons">
              <button class="btn edit-profile-btn" @click="startEditing">
                Редактировать профиль
              </button>
              <button class="btn logout-btn" @click="handleLogout">
                Выйти
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  min-height: 80vh;
  padding: 40px 0;
  background-color: #f9f9f9;
}

.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 0 20px;
}

.loading {
  text-align: center;
  margin-top: 50px;
  color: #666;
}

/* Карточка */
.profile-card {
  background: white;
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.05);
  text-align: center;
}

/* Аватар */
.avatar-circle {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #9ab4ff 0%, #587bf2 100%);
  border-radius: 50%;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: 700;
  color: white;
  letter-spacing: 2px;
}

.user-name {
  margin: 0 0 10px 0;
  font-size: 24px;
  font-weight: 800;
  color: #333;
}

/* Поля редактирования имени */
.edit-name-group {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-bottom: 20px;
}
.edit-name-group :deep(.base-input) {
  margin-bottom: 10px;
  text-align: center;
}

.edit-field {
  flex: 1;
  margin-left: 10px;
}
.edit-field :deep(.base-input) {
  margin-bottom: 0;
  padding: 8px 15px;
}

/* Роли */
.roles-list {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}
.role-badge {
  background-color: #f0f4ff;
  color: #587bf2;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
}

.divider {
  height: 1px;
  background-color: #eee;
  margin: 30px 0;
}

/* Секции */
.info-section {
  text-align: left;
}
.section-title {
  font-size: 14px;
  text-transform: uppercase;
  color: #999;
  letter-spacing: 1px;
  margin-bottom: 15px;
  font-weight: 700;
}
.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center; /* Центрируем по вертикали для инпутов */
  margin-bottom: 15px;
  font-size: 16px;
  min-height: 40px; /* Чтобы строки не скакали */
}
.info-row .label {
  color: #555;
  font-weight: 500;
  flex-shrink: 0;
}
.info-row .value {
  color: #000;
  font-weight: 600;
  text-align: right;
}

.bank-font {
  font-family: monospace;
  letter-spacing: 1px;
  background: #f5f5f5;
  padding: 4px 8px;
  border-radius: 6px;
}

/* Кнопки */
.actions-section {
  margin-top: 40px;
}

.view-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.edit-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.btn {
  padding: 12px 24px;
  border-radius: 30px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.edit-profile-btn {
  background-color: #587bf2;
  color: white;
  width: 100%;
}
.edit-profile-btn:hover {
  background-color: #4768d6;
}

.logout-btn {
  background: transparent;
  border: 2px solid #ff4d4d;
  color: #ff4d4d;
  width: 100%;
}
.logout-btn:hover {
  background: #ff4d4d;
  color: white;
}

.save-btn {
  background-color: #4CAF50;
  color: white;
  flex: 1;
}
.save-btn:hover {
  background-color: #43A047;
}

.cancel-btn {
  background-color: #e0e0e0;
  color: #333;
  flex: 1;
}
.cancel-btn:hover {
  background-color: #d6d6d6;
}
</style>
