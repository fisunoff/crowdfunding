// src/api/types.ts

// Ответ при логине (обычно это access_token)
// В swagger написано "Response Login Auth Login Post", предполагаем стандартную структуру JWT
export interface AuthResponse {
  access_token: string;
  token_type: string;
}

// Данные для входа
export interface UserLogin {
  login: string;
  password?: string;
}

// Данные профиля (чтение)
export interface ProfileReadData {
  name: string;
  surname: string;
  patronymic?: string;
  bank_number: string;
  id: number;
  login: string;
  is_admin?: boolean;
  is_author?: boolean;
  is_investor?: boolean;
}

// Данные для регистрации
export interface ProfileCreateData {
  name: string;
  surname: string;
  patronymic?: string;
  bank_number: string;
  login: string;
  password?: string;
  is_admin?: boolean; // Обычно такие поля не шлют с фронта при регистрации, но они есть в схеме
  is_author?: boolean;
  is_investor?: boolean;
}

// Ошибки валидации
export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface HTTPValidationError {
  detail: ValidationError[];
}

export interface BaseProjectData {
  title: string;
  description: string;
  goal_amount: number;
  project_type: string;
  start_date: string; // формат YYYY-MM-DD
  end_date: string;   // формат YYYY-MM-DD
}


export type ProjectStatus = 'draft' | 'onModeration' | 'accepted' | 'rejected';

export interface BaseProjectData {
  title: string;
  description: string;
  goal_amount: number;
  project_type: string;
  start_date: string;
  end_date: string;
}

export interface CreatedProjectData extends BaseProjectData {
  id: number;
  author_id: number;
  status: ProjectStatus;
  // Новое поле из спецификации
  moderator_comment?: string | null;
}

export interface BaseRewardData {
  title: string;
  description: string;
  price: number;
  quantity: number;
}

export interface RewardData extends BaseRewardData {
  id: number;
  active: boolean;
}

export interface ContribSchema {
  id: number;
  project_id: number;
  reward_id: number;
  profile_id: number;
  status: string;
  created_at: string;
}

// src/api/types.ts

// ... (предыдущие типы)

export interface ContribSchema {
  id: number;
  project_id: number;
  reward_id: number;
  profile_id: number;
  status: string;
  created_at: string;
}

// Расширенная схема для списка моих вкладов (с вложенными объектами)
export interface DetailedContribSchema {
  id: number;
  project_id: number;
  reward_id: number;
  profile_id: number;
  status: string;
  created_at: string;
  project: CreatedProjectData;
  reward: RewardData;
}

export interface GlobalStatsData {
  total_count: number;     // Кол-во взносов/наград
  total_amount: number;    // Сумма денег
  cool_projects: number;   // Успешные проекты
}
