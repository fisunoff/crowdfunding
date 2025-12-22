<script setup lang="ts">
import {ref} from 'vue';
import {useRouter} from 'vue-router';
import {useAuthStore} from '@/stores/useAuthStore';
import BaseInput from '@/components/BaseInput.vue';
import BaseCheckbox from '@/components/BaseCheckbox.vue';
import RoleSwitcher from '@/components/RoleSwitcher.vue';

const router = useRouter();
const authStore = useAuthStore();

// Form Data
const role = ref<'investor' | 'author'>('investor');
const loginForm = ref({
  login: '',
  password: ''
});
const rememberMe = ref(false);

const handleLogin = async () => {
  if (!loginForm.value.login || !loginForm.value.password) {
    alert('Пожалуйста, заполните все поля');
    return;
  }

  try {
    await authStore.login({
      login: loginForm.value.login,
      password: loginForm.value.password
    });
    // Редирект происходит внутри store (обычно на 'main')
  } catch (e) {
    // Ошибки обрабатываются в store (authStore.error)
  }
};
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <!-- Icon Header -->
      <div class="icon-container">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
             xmlns="http://www.w3.org/2000/svg">
          <!-- Кружок вокруг человечка -->
          <path d="M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16z" stroke="white" stroke-width="1.5"
                stroke-dasharray="2 4"/>
          <!-- Человечек -->
          <circle cx="12" cy="10" r="3" stroke="white" stroke-width="1.5"/>
          <path d="M7 20v-1a5 5 0 0 1 5-5h0a5 5 0 0 1 5 5v1" stroke="white" stroke-width="1.5"/>
        </svg>
      </div>

      <!-- Role Switcher -->
      <RoleSwitcher v-model="role"/>

      <!-- Inputs -->
      <form @submit.prevent="handleLogin">

        <!-- Изменили type на text и placeholder -->
        <BaseInput
          v-model="loginForm.login"
          placeholder="Логин / Email"
          type="text"
        />

        <BaseInput
          v-model="loginForm.password"
          placeholder="Пароль"
          type="password"
        />

        <!-- Checkbox -->
        <div class="checkbox-row">
          <BaseCheckbox v-model="rememberMe" label="Запомнить меня"/>
        </div>

        <!-- Submit Button -->
        <button type="submit" class="submit-btn" :disabled="authStore.isLoading">
          {{ authStore.isLoading ? 'Вход...' : 'Войти' }}
        </button>

        <!-- Error Message -->
        <div v-if="authStore.error" class="error-text">
          {{ authStore.error }}
        </div>
      </form>

      <!-- Footer Link -->
      <div class="footer-link">
        <span>Нет аккаунта? </span>
        <router-link :to="{ name: 'register' }" class="link">Создать</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f2f2f2;
}

.auth-card {
  width: 100%;
  max-width: 400px;
  background-color: #9ab4ff;
  border-radius: 20px;
  padding: 40px 30px;
  box-shadow: 0 10px 25px rgba(154, 180, 255, 0.4);
  text-align: center;
}

.icon-container {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}

.checkbox-row {
  display: flex;
  justify-content: flex-start;
  margin-top: 5px;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  background-color: white;
  border: none;
  border-radius: 30px;
  color: #555;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.1s;
  margin-top: 10px;
}

.submit-btn:hover {
  background-color: #fcfcfc;
}

.submit-btn:active {
  transform: scale(0.98);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.footer-link {
  margin-top: 25px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.link {
  color: #fff;
  text-decoration: underline;
  font-weight: 600;
  cursor: pointer;
}

.error-text {
  color: #740000;
  background: rgba(255, 255, 255, 0.3);
  margin-top: 10px;
  padding: 5px;
  border-radius: 8px;
  font-size: 13px;
}
</style>
