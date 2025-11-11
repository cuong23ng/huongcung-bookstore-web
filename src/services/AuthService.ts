import { ApiClient } from "@/integrations/ApiClient";
import { AuthResponse, LoginRequest, RegisterRequest, User } from "../models";
import { AxiosInstance } from "axios";

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
    const response = await this.apiFetcher.post('/auth/login', data);
    const authData = response.data as AuthResponse;
    this.saveAuthData(authData);
    return authData;
  }

  public async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.apiFetcher.post('/auth/register', data);
    const authData = response.data as AuthResponse;
    this.saveAuthData(authData);
    return authData;
  }

  public async logout(): Promise<void> {
    // Get token and type from localStorage
    const token = this.getToken();
    const tokenType = this.getTokenType();
    
    if (token && tokenType) {
      // Set authorization header for logout request
      await this.apiFetcher.post('/auth/logout', {}, {
        headers: {
          'Authorization': `${tokenType} ${token}`
        }
      });
      this.clearAuthData();
    }
  }

  private getToken(): string {
    return localStorage.getItem('token') || null;
  }

  private getTokenType(): string {
    return localStorage.getItem('tokenType') || null;
  }

  private saveAuthData(authData: AuthResponse): void {
    localStorage.setItem('token', authData.token);
    localStorage.setItem('tokenType', authData.type);
    localStorage.setItem('userId', authData.id.toString());
    localStorage.setItem('userEmail', authData.email);
    localStorage.setItem('userFirstName', authData.firstName);
    localStorage.setItem('userLastName', authData.lastName);
    localStorage.setItem('userRoles', JSON.stringify(authData.roles));
    localStorage.setItem('userType', authData.userType);
  }

  private clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenType');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userFirstName');
    localStorage.removeItem('userLastName');
    localStorage.removeItem('userRoles');
    localStorage.removeItem('userType');
  }

  public getAuthData(): UserInfo | null {
    const token = this.getToken();
    const tokenType = this.getTokenType();
    
    if (!token || !tokenType) {
      return null;
    }

    const userId = localStorage.getItem('userId');
    const email = localStorage.getItem('userEmail');
    const firstName = localStorage.getItem('userFirstName');
    const lastName = localStorage.getItem('userLastName');
    const roles = localStorage.getItem('userRoles');
    const userType = localStorage.getItem('userType');

    if (!userId || !email) {
      return null;
    }

    return {
      id: Number.parseInt(userId, 10),
      email,
      firstName: firstName || '',
      lastName: lastName || '',
      roles: roles ? JSON.parse(roles) : [],
      userType: userType || '',
    };
  }
}

export type UserInfo = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  userType: string;
};

// Export convenience functions for easier usage
export const getAuthData = (): UserInfo | null => {
  return AuthService.getInstance().getAuthData();
};

export const logout = async (): Promise<void> => {
  return AuthService.getInstance().logout();
};