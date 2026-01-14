import { Author, AuthorPage } from '../models/Author';
import { ApiClient } from '@/integrations/ApiClient';
import { AxiosInstance } from 'axios';
import { ApiResponse } from '@/models';
import { API_CONFIG } from '@/config/api.config';

export class AuthorService {
  private readonly apiFetcher: AxiosInstance;

  private constructor() {
    this.apiFetcher = ApiClient.create();
  }

  public static getInstance(): AuthorService {
    return new AuthorService();
  }

  async getAuthors(page: number = 0, size: number = 20): Promise<AuthorPage> {
    const response = await this.apiFetcher.get<ApiResponse<AuthorPage>>(API_CONFIG.endpoints.author.authors, {
      params: { page, size },
    });
    return response.data.data;
  }

  async getBooksByAuthor(authorId: number, page: number = 0, size: number = 20): Promise<AuthorPage> {
    const response = await this.apiFetcher.get<ApiResponse<AuthorPage>>(
      `${API_CONFIG.endpoints.author.authors}/${authorId}/books`,
      {
        params: { page, size },
      }
    );
    return response.data.data;
  }

}
