<script setup lang="ts">
import {ref, computed, onMounted} from 'vue';
import {useRouter} from 'vue-router';
import {useProjectsStore} from '@/stores/useProjectsStore';
import ProjectCard from '@/components/ProjectCard.vue';

const router = useRouter();
const projectsStore = useProjectsStore();

const searchQuery = ref('');

onMounted(() => {
  // Загружаем проекты, если они еще не загружены или нужно обновить
  projectsStore.fetchProjects();
});

// Фильтрация проектов на клиенте
const filteredProjects = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  if (!query) {
    return projectsStore.projects;
  }
  return projectsStore.projects.filter(p =>
    p.title.toLowerCase().includes(query) ||
    p.description.toLowerCase().includes(query)
  );
});

const handleCardClick = (id: number) => {
  router.push({name: 'projectCard', params: {id}});
};
</script>

<template>
  <div class="projects-page">

    <!-- Search Header -->
    <div class="search-header">
      <div class="container search-container">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Поиск проектов..."
          class="search-input"
        />
        <!-- Можно добавить иконку лупы справа, если нужно -->
      </div>
    </div>

    <!-- Main Content -->
    <div class="container content-area">

      <!-- Loader -->
      <div v-if="projectsStore.isLoading" class="state-message">
        Загрузка...
      </div>

      <!-- Error -->
      <div v-else-if="projectsStore.error" class="state-message error">
        {{ projectsStore.error }}
      </div>

      <!-- Empty Filter Result -->
      <div v-else-if="filteredProjects.length === 0" class="state-message">
        Ничего не найдено
      </div>

      <!-- Grid -->
      <div v-else class="projects-grid">
        <ProjectCard
          v-for="project in filteredProjects"
          :key="project.id"
          :project="project"
          @click="handleCardClick"
        />
      </div>

    </div>
  </div>
</template>

<style scoped>
.projects-page {
  width: 100%;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Header Styles */
.search-header {
  background-color: #E0E0E0; /* Серый фон хедера */
  padding: 40px 0;
  /* Градиент или тень, чтобы выглядело как на макете (сверху вниз) */
  background: linear-gradient(180deg, #EBEBEB 0%, #D6D6D6 100%);
  border-bottom: 1px solid #ccc;
}

.search-input {
  width: 100%;
  background: transparent;
  border: none;
  font-size: 48px; /* Крупный шрифт как на макете */
  font-weight: 300; /* Тонкий шрифт */
  color: #999;
  outline: none;
}

.search-input::placeholder {
  color: #A0A0A0;
}

.search-input:focus {
  color: #333;
}

/* Content */
.content-area {
  padding-top: 40px;
  padding-bottom: 40px;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* Ровно 3 колонки как на макете */
  gap: 30px;
}

/* Адаптивность грида */
@media (max-width: 992px) {
  .projects-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .projects-grid {
    grid-template-columns: 1fr;
  }

  .search-input {
    font-size: 32px;
  }
}

.state-message {
  text-align: center;
  font-size: 18px;
  color: #666;
  margin-top: 50px;
}

.error {
  color: #e85a5a;
}
</style>
