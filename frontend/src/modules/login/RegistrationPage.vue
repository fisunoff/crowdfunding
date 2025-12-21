<script setup lang="ts">
import {ref} from 'vue';
import {useRouter} from 'vue-router';
import {useAuthStore} from '@/stores/useAuthStore';
import BaseInput from '@/components/BaseInput.vue';
import BaseCheckbox from '@/components/BaseCheckbox.vue';
import RoleSwitcher from '@/components/RoleSwitcher.vue'; // Добавил, т.к. бэку нужна роль

const router = useRouter();
const authStore = useAuthStore();

const role = ref<'investor' | 'author'>('investor'); // По умолчанию инвестор
const form = ref({
  email: '',
  password: '',
  confirmPassword: '',
  phone: '', // API требует bank_number, замапим сюда
  fio: '' // API требует name, surname, patronymic
});
const isAgreed = ref(false);

const handleRegister = async () => {
  // Валидация
  if (!isAgreed.value) {
    alert('Необходимо согласиться с условиями');
    return;
  }
  if (form.value.password !== form.value.confirmPassword) {
    alert('Пароли не совпадают');
    return;
  }

  // Парсинг ФИО: "Иванов Иван Иванович"
  const fioParts = form.value.fio.trim().split(/\s+/);
  if (fioParts.length < 2) {
    alert('Введите Фамилию и Имя');
    return;
  }

  const surname = fioParts[0];
  const name = fioParts[1];
  const patronymic = fioParts.slice(2).join(' '); // Все остальное в отчество

  try {
    await authStore.register({
      login: form.value.email,
      password: form.value.password,
      name: name,
      surname: surname,
      patronymic: patronymic || undefined,
      bank_number: form.value.phone, // Мапим телефон в bank_number
      is_author: role.value === 'author',
      is_investor: role.value === 'investor',
      is_admin: false
    });
    // После успешной регистрации (и авто-логина внутри стора)
    router.push({name: 'main'});
  } catch (e) {
    // Ошибки в store
  }
};
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <!-- Внутри template .auth-card -->
      <div class="icon-container">
        <!-- Исправленная иконка регистрации -->
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Голова -->
          <circle cx="10" cy="8" r="4" stroke="white" stroke-width="1.5"/>
          <!-- Тело -->
          <path d="M4 20C4 16.6863 6.68629 14 10 14H11" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
          <!-- Плюсик (сдвинут чтобы не налезать) -->
          <path d="M19 8V14M16 11H22" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </div>

      <!-- Role Switcher (Добавлено, чтобы соблюсти API) -->
      <RoleSwitcher v-model="role"/>

      <form @submit.prevent="handleRegister">
        <BaseInput v-model="form.email" placeholder="Адрес электронной почты" type="email"/>

        <BaseInput v-model="form.password" placeholder="Придумайте пароль" type="password"/>

        <BaseInput v-model="form.confirmPassword" placeholder="Подтвердите пароль" type="password"/>

        <BaseInput v-model="form.phone" placeholder="Номер телефона" type="tel"/>

        <BaseInput v-model="form.fio" placeholder="ФИО"/>

        <div class="checkbox-row text-left">
          <BaseCheckbox v-model="isAgreed">
            Я соглашаюсь с условиями<br>
            пользовательского соглашения и<br>
            политикой персональных данных
          </BaseCheckbox>
        </div>

        <button type="submit" class="submit-btn" :disabled="authStore.isLoading">
          {{ authStore.isLoading ? 'Создание...' : 'Создать' }}
        </button>

        <div v-if="authStore.error" class="error-text">
          {{ authStore.error }}
        </div>
      </form>

      <!-- Ссылка назад на вход, если пользователь передумал -->
      <div class="footer-link">
        <router-link :to="{ name: 'login' }" class="link">У меня уже есть аккаунт</router-link>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* Дублирование стилей для простоты.
   В идеале .auth-page и .auth-card выносятся в layout или общий css */

.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f2f2f2;
  padding: 20px; /* Отступ для мобильных */
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
  margin-top: 5px;
  text-align: left;
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
  margin-top: 10px;
}

.submit-btn:hover {
  background-color: #fcfcfc;
}

.footer-link {
  margin-top: 25px;
  font-size: 14px;
}

.link {
  color: #fff;
  text-decoration: underline;
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
