import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

export class ApiClient  {
  public static create(): AxiosInstance {
    // Use relative URL in development (via Vite proxy) or full URL in production
    const baseURL = import.meta.env.MODE === 'development'
      ? '/api' 
      : import.meta.env.VITE_API_BASE_URL || 'http://api-dev.huongcungbookstore.com';
    
    const instance = axios.create({
      baseURL,
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