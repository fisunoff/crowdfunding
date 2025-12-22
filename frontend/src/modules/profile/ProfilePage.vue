<script setup lang="ts">
import {computed} from 'vue';
import {useRouter} from 'vue-router';
import {useAuthStore} from '@/stores/useAuthStore';

const router = useRouter();
const authStore = useAuthStore();

// Получаем пользователя из стора
const user = computed(() => authStore.user);

// Формируем полное имя
const fullName = computed(() => {
  if (!user.value) return 'Загрузка...';
  return `${user.value.surname} ${user.value.name} ${user.value.patronymic || ''}`.trim();
});

// Инициалы для аватарки
const initials = computed(() => {
  if (!user.value) return 'U';
  return (user.value.surname[0] + user.value.name[0]).toUpperCase();
});

// Список ролей пользователя
const userRoles = computed(() => {
  if (!user.value) return [];
  const roles = [];
  if (user.value.is_admin) roles.push('Администратор');
  if (user.value.is_author) roles.push('Автор проектов');
  if (user.value.is_investor) roles.push('Инвестор');
  return roles;
});

const handleLogout = () => {
  if (confirm('Вы действительно хотите выйти из аккаунта?')) {
    authStore.logout();
    // logout в сторе уже делает редирект на логин, но на всякий случай:
    router.push({name: 'login'});
  }
};
</script>

<template>
  <div class="profile-page">
    <div class="container">

      <div v-if="!user" class="loading">Загрузка профиля...</div>

      <div v-else class="profile-layout">

        <!-- Карточка пользователя -->
        <div class="profile-card">

          <!-- Шапка профиля -->
          <div class="profile-header">
            <div class="avatar-circle">
              {{ initials }}
            </div>
            <h1 class="user-name">{{ fullName }}</h1>

            <div class="roles-list">
              <span v-for="role in userRoles" :key="role" class="role-badge">
                {{ role }}
              </span>
            </div>
          </div>

          <div class="divider"></div>

          <!-- Детальная информация -->
          <div class="info-section">
            <h2 class="section-title">Контактная информация</h2>

            <div class="info-row">
              <span class="label">Логин / Email:</span>
              <span class="value">{{ user.login }}</span>
            </div>

            <div class="info-row">
              <span class="label">Телефон:</span>
              <span class="value">{{ user.phone_number || 'Не указан' }}</span>
            </div>
          </div>

          <div class="divider"></div>

          <div class="info-section">
            <h2 class="section-title">Финансовая информация</h2>
            <div class="info-row">
              <span class="label">Банковский счет:</span>
              <span class="value bank-font">{{ user.bank_number }}</span>
            </div>
          </div>

          <!-- Кнопки действий -->
          <div class="actions-section">
            <button class="logout-btn" @click="handleLogout">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 3H7C5.89543 3 5 3.89543 5 5V19C5 20.1046 5.89543 21 7 21H15" stroke="currentColor"
                      stroke-width="2" stroke-linecap="round"/>
                <path d="M19 12L9 12M19 12L15 9M19 12L15 15" stroke="currentColor" stroke-width="2"
                      stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Выйти из аккаунта
            </button>
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
  background-color: #f9f9f9; /* Легкий фон для всей страницы */
}

.container {
  max-width: 600px; /* Узкий контейнер для профиля выглядит аккуратнее */
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
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
  text-align: center;
}

/* Аватар и Имя */
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

/* Секции информации */
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
  margin-bottom: 12px;
  font-size: 16px;
}

.info-row .label {
  color: #555;
  font-weight: 500;
}

.info-row .value {
  color: #000;
  font-weight: 600;
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
  display: flex;
  justify-content: center;
}

.logout-btn {
  background: transparent;
  border: 2px solid #ff4d4d;
  color: #ff4d4d;
  padding: 12px 24px;
  border-radius: 30px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: #ff4d4d;
  color: white;
}
</style>
