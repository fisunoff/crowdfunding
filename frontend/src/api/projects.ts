import api from './instance';
import type {CreatedProjectData} from './types';

export const projectsApi = {
  // Получить список всех проектов
  async getProjects(): Promise<CreatedProjectData[]> {
    const response = await api.get<CreatedProjectData[]>('/projects/');
    return response.data;
  },

  // Получить один проект по ID
  async getProjectById(id: number): Promise<CreatedProjectData> {
    const response = await api.get<CreatedProjectData>(`/projects/${id}`);
    return response.data;
  }
};
