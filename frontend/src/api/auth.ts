// src/api/auth.ts
import api from './instance';
import type {
  UserLogin,
  ProfileCreateData,
  ProfileReadData,
  AuthResponse, BaseProfileData
} from './types';

export const authApi = {
  // Регистрация
  async register(data: ProfileCreateData): Promise<ProfileReadData> {
    const response = await api.post<ProfileReadData>('/auth/register/', data);
    return response.data;
  },

  // Логин
  async login(data: UserLogin): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login/', data);
    return response.data;
  },

  // Обновление токена
  async refresh(): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/refresh/');
    return response.data;
  },

  // Получение своего профиля
  async getMe(): Promise<ProfileReadData> {
    const response = await api.get<ProfileReadData>('/profile/me/');
    return response.data;
  },

  async updateMe(data: BaseProfileData): Promise<ProfileReadData> {
    const response = await api.put<ProfileReadData>('/profile/me', data);
    return response.data;
  }
};
