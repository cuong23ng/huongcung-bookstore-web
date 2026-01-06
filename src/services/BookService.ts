import { ApiClient } from "@/integrations/ApiClient";
import { AxiosInstance } from "axios";
import { ApiResponse, Book, BookPage } from "@/models";
import { SearchRequest, SearchResponse } from "@/models/Search";
import { API_CONFIG } from "@/config/api.config";

export class BookService {
  private readonly apiFetcher: AxiosInstance;
  
  private constructor() {
    this.apiFetcher = ApiClient.create();
  }

  public static getInstance(): BookService {
    return new BookService();
  }

  /**
   * Get all books with pagination
   * @param page Page number (1-indexed, default: 1)
   * @param size Page size (default: 20)
   * @returns Paginated book page
   */
  async getAllBooks(page: number = 1, size: number = 20): Promise<BookPage> {
    const response = await this.apiFetcher.get<ApiResponse<BookPage>>(API_CONFIG.endpoints.catalog.books, {
      params: { page, size },
    });
  
    const books = response.data?.data ?? {
      books: [],
      pagination: {
        currentPage: 0,
        pageSize: size,
        totalResults: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
      },
    };
    return books;
  }

  async getBookDetails(code: string): Promise<Book | null> {
    const response = await this.apiFetcher.get<ApiResponse<Book>>(
      API_CONFIG.endpoints.catalog.bookDetails(code)
    );
    const payload = response.data?.data ?? null;
    return payload;
  }

  async searchBooks(request: SearchRequest): Promise<SearchResponse> {
    const params = new URLSearchParams();
    
    if (request.q) params.append("q", request.q);
    if (request.genre) {
      for (const g of request.genre) {
        params.append("genres", g);
      }
    }
    if (request.language) {
      for (const l of request.language) {
        params.append("languages", l);
      }
    }
    if (request.format) {
      for (const f of request.format) {
        params.append("bookTypes", f);
      }
    }
    if (request.minPrice !== undefined) params.append("minPrice", request.minPrice.toString());
    if (request.maxPrice !== undefined) params.append("maxPrice", request.maxPrice.toString());
    if (request.page !== undefined) params.append("page", request.page.toString());
    if (request.size !== undefined) params.append("size", request.size.toString());
    if (request.sort) params.append("sort", request.sort);

    const response = await this.apiFetcher.get<ApiResponse<SearchResponse>>(
      `${API_CONFIG.endpoints.catalog.books}?${params.toString()}`
    );
    return response.data?.data ?? {
      books: [],
      facets: {},
      pagination: {
        currentPage: 1,
        pageSize: 20,
        totalResults: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
      },
    };
  }

  async getSuggestions(query: string, limit: number = 10): Promise<string[]> {
    const params = new URLSearchParams();
    params.append("q", query);
    params.append("limit", limit.toString());

    const response = await this.apiFetcher.get<ApiResponse<{ suggestions: string[] }>>(
      `${API_CONFIG.endpoints.catalog.suggestions}?${params.toString()}`
    );
    return response.data?.data?.suggestions ?? [];
  }
}