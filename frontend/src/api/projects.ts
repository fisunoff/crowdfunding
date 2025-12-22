// src/api/projects.ts
import api from './instance';
import type {
  CreatedProjectData,
  BaseProjectData,
  RewardData,
  BaseRewardData, ContribSchema
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
  },

  // --- МОДЕРАЦИЯ ---

  // POST /projects/{pk}/to_draft?message=...
  async returnToDraft(id: number, message: string): Promise<CreatedProjectData> {
    const response = await api.post<CreatedProjectData>(`/projects/${id}/to_draft`, null, {
      params: {message}
    });
    return response.data;
  },

  // Отклонить проект окончательно (Admin)
  async rejectProject(id: number, message: string): Promise<CreatedProjectData> {
    const response = await api.post<CreatedProjectData>(`/projects/${id}/reject`, null, {
      params: {message}
    });
    return response.data;
  },

  // Принять проект (Admin)
  async acceptProject(id: number, message: string): Promise<CreatedProjectData> {
    const response = await api.post<CreatedProjectData>(`/projects/${id}/accept`, null, {
      params: {message}
    });
    return response.data;
  },

  // --- ВЗНОСЫ (CONTRIB) ---

  // Сделать взнос (купить награду)
  // В swagger путь странный: /contrib{project_pk}/..., добавим слэш вручную
  async makeContribution(projectId: number, rewardId: number): Promise<ContribSchema> {
    // Исправляем возможную опечатку в пути из Swagger
    const response = await api.post<ContribSchema>(`/contrib/${projectId}/rewards/${rewardId}/contrib`);
    return response.data;
  },

};
