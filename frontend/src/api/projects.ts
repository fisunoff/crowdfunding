// src/api/projects.ts
import api from './instance';
import type {
  CreatedProjectData,
  BaseProjectData,
  RewardData,
  BaseRewardData
} from './types';

export const projectsApi = {
  // --- ПРОЕКТЫ ---

  // Получить список всех проектов
  // GET /projects/
  async getProjects(): Promise<CreatedProjectData[]> {
    const response = await api.get<CreatedProjectData[]>('/projects/');
    return response.data;
  },

  // Получить один проект по ID
  // GET /projects/{pk}
  async getProjectById(id: number): Promise<CreatedProjectData> {
    const response = await api.get<CreatedProjectData>(`/projects/${id}`);
    return response.data;
  },

  // Создание проекта
  // POST /projects/
  async createProject(data: BaseProjectData): Promise<CreatedProjectData> {
    const response = await api.post<CreatedProjectData>('/projects/', data);
    return response.data;
  },

  // Обновление проекта (Редактирование)
  // PUT /projects/{pk}
  async updateProject(id: number, data: BaseProjectData): Promise<CreatedProjectData> {
    // В новой спецификации используется метод PUT
    const response = await api.put<CreatedProjectData>(`/projects/${id}`, data);
    return response.data;
  },

  // Удаление проекта
  // DELETE /projects/{pk} (В спецификации опечатка "/projects{pk}", но используем стандартный путь с слэшем)
  async deleteProject(id: number): Promise<void> {
    await api.delete(`/projects/${id}`);
  },

  // Отправка на модерацию
  // POST /projects/{pk}/submit
  async submitProject(id: number): Promise<CreatedProjectData> {
    const response = await api.post<CreatedProjectData>(`/projects/${id}/submit`);
    return response.data;
  },

  // --- ВОЗНАГРАЖДЕНИЯ (REWARDS) ---

  // Получить список наград
  // GET /projects/{project_pk}/rewards
  async getRewards(projectId: number): Promise<RewardData[]> {
    const response = await api.get<RewardData[]>(`/projects/${projectId}/rewards`);
    return response.data;
  },

  // Создать награду
  // POST /projects/{project_pk}/rewards
  async createReward(projectId: number, data: BaseRewardData): Promise<RewardData> {
    const response = await api.post<RewardData>(`/projects/${projectId}/rewards`, data);
    return response.data;
  },

  // Обновить награду
  // PATCH /projects/{project_pk}/rewards/{pk}
  async updateReward(projectId: number, rewardId: number, data: BaseRewardData): Promise<RewardData> {
    const response = await api.patch<RewardData>(`/projects/${projectId}/rewards/${rewardId}`, data);
    return response.data;
  },

  // Удалить награду
  // DELETE /projects/{project_pk}/rewards/{pk}
  async deleteReward(projectId: number, rewardId: number): Promise<void> {
    await api.delete(`/projects/${projectId}/rewards/${rewardId}`);
  }
};
