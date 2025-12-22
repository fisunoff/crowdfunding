// src/api/projects.ts
import api from './instance';
import type {CreatedProjectData, BaseProjectData} from './types';

export const projectsApi = {
  // Получить список всех проектов
  async getProjects(): Promise<CreatedProjectData[]> {
    const response = await api.get<CreatedProjectData[]>('/projects/');
    return response.data;
  },

  // Получить один проект по ID
  async getProjectById(id: number): Promise<CreatedProjectData> {
    const response = await api.get<CreatedProjectData>(`/projects/${id}/`);
    return response.data;
  },

  // Создание проекта
  async createProject(data: BaseProjectData): Promise<CreatedProjectData> {
    const response = await api.post<CreatedProjectData>('/projects/', data);
    return response.data;
  },

  // Удаление проекта
  async deleteProject(id: number): Promise<void> {
    await api.delete(`/projects/${id}`);
  },

  // Отправка на модерацию
  async submitProject(id: number): Promise<CreatedProjectData> {
    const response = await api.post<CreatedProjectData>(`/projects/${id}/submit/`);
    return response.data;
  }
};
