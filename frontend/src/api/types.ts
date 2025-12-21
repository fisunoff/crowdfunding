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
