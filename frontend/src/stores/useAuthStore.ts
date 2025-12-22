// src/stores/useAuthStore.ts
import {defineStore} from 'pinia';
import {ref, computed} from 'vue';
import {useRouter} from 'vue-router';
import {authApi} from '@/api/auth';
import type {UserLogin, ProfileCreateData, ProfileReadData} from '@/api/types';

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter();

  // State
  const user = ref<ProfileReadData | null>(null);
  const token = ref<string | null>(localStorage.getItem('access_token'));
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const isAuthenticated = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.is_admin || false);

  // Actions

  // Установка токена
  function setToken(newToken: string) {
    token.value = newToken;
    localStorage.setItem('access_token', newToken);
  }

  // Очистка данных (Logout)
  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem('access_token');
    router.push({name: 'login'});
  }

  // Логин
  async function login(credentials: UserLogin) {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await authApi.login(credentials);
      if (response.access_token) {
        setToken(response.access_token);
        await fetchUser(); // Загружаем данные пользователя сразу после входа
        router.push({name: 'main'});
      }
    } catch (err: any) {
      console.error(err);
      // Обработка ошибок (например 422 или 401)
      if (err.response?.status === 422) {
        error.value = 'Неверный логин или пароль';
      } else {
        error.value = 'Ошибка авторизации';
      }
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  // Регистрация
  async function register(data: ProfileCreateData) {
    isLoading.value = true;
    error.value = null;
    try {
      await authApi.register(data);
      // После успешной регистрации можно сразу логинить пользователя
      await login({login: data.login, password: data.password});
    } catch (err: any) {
      console.error(err);
      error.value = 'Ошибка при регистрации';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  // Получение данных пользователя
  async function fetchUser() {
    if (!token.value) return;
    try {
      user.value = await authApi.getMe();
    } catch (err) {
      // Если токен протух или невалиден
      console.error('Failed to fetch user', err);
      logout();
    }
  }

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    fetchUser
  };
});
