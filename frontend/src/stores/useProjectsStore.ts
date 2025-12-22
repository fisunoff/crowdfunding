import {defineStore} from 'pinia';
import {ref} from 'vue';
import {projectsApi} from '@/api/projects';
import type {CreatedProjectData} from '@/api/types';

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref<CreatedProjectData[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function fetchProjects() {
    isLoading.value = true;
    error.value = null;
    try {
      projects.value = await projectsApi.getProjects();
    } catch (err) {
      console.error(err);
      error.value = 'Не удалось загрузить проекты';
    } finally {
      isLoading.value = false;
    }
  }

  return {
    projects,
    isLoading,
    error,
    fetchProjects
  };
});
