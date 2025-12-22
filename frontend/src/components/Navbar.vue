<script setup lang="ts">
import {computed} from 'vue';
import {useRouter} from 'vue-router';
import {useAuthStore} from '@/stores/useAuthStore';

const router = useRouter();
const authStore = useAuthStore();

const navLinks = computed(() => {
  const links = [
    {label: 'Проекты', name: 'projects'},
  ];

  if (authStore.isAuthenticated && authStore.user) {
    // Если Автор
    if (authStore.user.is_author) {
      links.push({label: 'Мои проекты', name: 'my-projects'});
    }
    // Если Инвестор
    else if (authStore.user.is_investor) {
      links.push({label: 'Вклады', name: 'investitions'});
    }

    // [НОВОЕ] Если Админ
    if (authStore.isAdmin) {
      links.push({label: 'Модерация', name: 'moderation'});
    }
  }

  return links;
});

const handleAuthClick = () => {
  if (authStore.isAuthenticated) {
    router.push({name: 'profile'});
  } else {
    router.push({name: 'login'});
  }
};
</script>

<template>
  <header class="navbar">
    <div class="container">
      <div class="navbar-content">
        <!-- Logo -->
        <router-link :to="{ name: 'main' }" class="logo-area">
          <div class="logo-icon">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none"
                 xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="19.5" stroke="#333" stroke-width="1"/>
              <rect x="10" y="10" width="5" height="20" rx="2.5" fill="#587bf2"/>
              <rect x="17" y="10" width="5" height="20" rx="2.5" fill="#FFB039"/>
              <rect x="24" y="10" width="5" height="20" rx="2.5" fill="#E85A5A"/>
            </svg>
          </div>
          <span class="logo-text">Pavlov</span>
        </router-link>

        <!-- Navigation Links -->
        <nav class="nav-links">
          <router-link
            v-for="link in navLinks"
            :key="link.name"
            :to="{ name: link.name }"
            class="nav-item"
            active-class="active"
          >
            {{ link.label }}
          </router-link>
        </nav>

        <!-- Auth / Profile Button -->
        <div class="auth-section" @click="handleAuthClick">
          <!-- Отображаем имя пользователя или Админ, если авторизован -->
          <div v-if="authStore.user" class="user-greeting">
            {{ authStore.user.name }}
          </div>
          <span class="auth-text" v-else>
            Вход
          </span>

          <div class="user-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                 xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="8" r="4" stroke="#000" stroke-width="1.5"/>
              <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="#000" stroke-width="1.5"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.navbar {
  background-color: transparent;
  padding: 20px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Logo */
.logo-area {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #000;
  gap: 15px;
}

.logo-text {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.5px;
}

/* Nav Links */
.nav-links {
  display: flex;
  gap: 30px;
  margin-left: 40px;
  margin-right: auto;
}

.nav-item {
  text-decoration: none;
  color: #333;
  font-size: 18px;
  font-weight: 500;
  transition: color 0.2s;
  position: relative;
}

.nav-item:hover, .nav-item.active {
  color: #000;
  font-weight: 600;
}

/* Подчеркивание активной ссылки */
.nav-item.active::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #587bf2;
  border-radius: 2px;
}

/* Auth Section */
.auth-section {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
}

.user-greeting {
  font-weight: 600;
  color: #333;
}

.auth-section:hover {
  opacity: 0.7;
}

.user-icon {
  display: flex;
  align-items: center;
}
</style>
