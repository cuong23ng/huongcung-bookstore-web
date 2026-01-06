export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  phone: string;
  gender: string;
}

export interface LogoutResponse {
  message: string;
  success: boolean;
  timestamp: number;
}

export interface AuthTokens {
  token: string;
  type: string;
  expiresIn?: number;
}
