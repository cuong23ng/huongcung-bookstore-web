import axios, { AxiosInstance } from 'axios';

export class ApiClient  {
  public static create(): AxiosInstance {
    return axios.create({
      baseURL: 'http://localhost:8082/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}