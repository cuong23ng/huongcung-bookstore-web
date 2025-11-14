import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

export class ApiClient  {
  public static create(): AxiosInstance {
    const instance = axios.create({
      baseURL: 'http://localhost:8082/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add JWT token to requests if available
    instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token');
        const tokenType = localStorage.getItem('tokenType') || 'Bearer';
        
        if (token && config.headers) {
          config.headers.Authorization = `${tokenType} ${token}`;
        }
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    return instance;
  }
}