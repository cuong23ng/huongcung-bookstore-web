import { ApiClient } from "@/integrations/ApiClient";
import { AuthResponse, LoginRequest, RegisterRequest, LogoutResponse } from "../models";
import { AxiosInstance } from "axios";
import { API_CONFIG } from "@/config/api.config";

export class AuthService {
  private readonly apiFetcher: AxiosInstance;

  private constructor() {
    this.apiFetcher = ApiClient.create();
  }

  public static getInstance(): AuthService {
    return new AuthService();
  }

  public isAuthenticated(): boolean {
    return this.getToken() !== null && this.getTokenType() !== null;
  }

  public async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.apiFetcher.post<AuthResponse>(API_CONFIG.endpoints.auth.login, data);

    const authData = response.data as AuthResponse;
    this.saveAuthData(authData);
    return authData;
  }

  public async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.apiFetcher.post<AuthResponse>(API_CONFIG.endpoints.auth.register, data);

    const authData = response.data as AuthResponse;
    this.saveAuthData(authData);
    return authData;
  }

  public async logout(): Promise<LogoutResponse> {
    // Get token and type from localStorage
    const token = this.getToken();
    const tokenType = this.getTokenType();
    
    if (token && tokenType) {
      // Set authorization header for logout request
      const response = await this.apiFetcher.post<LogoutResponse>(
        API_CONFIG.endpoints.auth.logout, 
        {}, 
        {
          headers: {
            'Authorization': `${tokenType} ${token}`
          }
        }
      );

      const logoutData = response.data as LogoutResponse;
      this.clearAuthData();
      return logoutData;
    }

    this.clearAuthData();
    return { message: 'No active session', success: false, timestamp: Date.now() };
  }

  private getToken(): string {
    return localStorage.getItem('token') || null;
  }

  private getTokenType(): string {
    return localStorage.getItem('tokenType') || null;
  }

  private saveAuthData(authData: AuthResponse): void {
    localStorage.setItem('token', authData.token);
    localStorage.setItem('tokenType', authData.type || 'Bearer');
    localStorage.setItem('userId', authData.id.toString());
    localStorage.setItem('userEmail', authData.email);
    localStorage.setItem('userUsername', authData.username);
    localStorage.setItem('userFirstName', authData.firstName);
    localStorage.setItem('userLastName', authData.lastName);
    localStorage.setItem('userRoles', JSON.stringify(authData.roles || []));
  }

  private clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenType');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userUsername');
    localStorage.removeItem('userFirstName');
    localStorage.removeItem('userLastName');
    localStorage.removeItem('userRoles');
  }

  public getAuthData(): UserInfo | null {
    const token = this.getToken();
    const tokenType = this.getTokenType();
    
    if (!token || !tokenType) {
      return null;
    }

    const userId = localStorage.getItem('userId');
    const email = localStorage.getItem('userEmail');
    const username = localStorage.getItem('userUsername');
    const firstName = localStorage.getItem('userFirstName');
    const lastName = localStorage.getItem('userLastName');
    const roles = localStorage.getItem('userRoles');

    if (!userId || !email) {
      return null;
    }

    return {
      id: Number.parseInt(userId, 10),
      email,
      username: username || email,
      firstName: firstName || '',
      lastName: lastName || '',
      roles: roles ? JSON.parse(roles) : [],
    };
  }
}

export type UserInfo = {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  roles: string[];
};

// Export convenience functions for easier usage
export const getAuthData = (): UserInfo | null => {
  return AuthService.getInstance().getAuthData();
};

export const logout = async (): Promise<LogoutResponse> => {
  return AuthService.getInstance().logout();
};