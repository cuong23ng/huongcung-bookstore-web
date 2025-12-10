import { BookFrontPageDTO } from "./Book";

export interface SearchFacet {
  value: string;
  count: number;
}

export interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalResults: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface SearchResponse {
  books: BookFrontPageDTO[];
  facets: {
    [key: string]: SearchFacet[];
  };
  pagination: PaginationInfo;
  highlightedFields?: {
    [bookCode: string]: string;
  };
  executionTimeMs?: number;
  fallbackUsed?: boolean;
}

export interface SearchRequest {
  q?: string;
  genre?: string[];
  language?: string[];
  format?: string[];
  minPrice?: number;
  maxPrice?: number;
  city?: string[];
  page?: number;
  size?: number;
  sort?: string;
}

