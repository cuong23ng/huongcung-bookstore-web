import { PaginationInfo } from './PaginationInfo';

export interface BookImage {
  url: string;
  altText?: string;
  position?: number;
  isCover?: boolean;
  isBackCover?: boolean;
}

export interface Author {
  name: string;
  biography?: string;
  photoUrl?: string;
  birthDate?: Date; // yyyy-MM-dd
  nationality?: string;
}

export interface Translator {
  name: string;
  biography?: string;
  photoUrl?: string;
  birthDate?: Date; // yyyy-MM-dd
}

export interface Publisher {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
}

export interface PhysicalBookInformation {
  isbn: string;
  publicationDate?: Date | null; 
  coverType: string;
  weightGrams: number;
  heightCm: number;
  widthCm: number;
  lengthCm: number;
  currentPrice: number;
}

export interface EbookInformation {
  isbn: string;
  publicationDate?: Date | null; 
  currentPrice: number;
}

export interface ReviewSource {
  title: string;
  url: string;
}

export interface BookReview {
  title?: string;
  content?: string;
  sources?: ReviewSource[];
}

export interface Book {
  code: string;
  title: string;
  authors: Author[];
  translators: Translator[];
  edition?: number;
  publisher?: Publisher | null;// yyyy-MM-dd
  language?: string | null;
  pageCount?: number;
  description?: string;
  images: BookImage[];
  physicalBookInfo?: PhysicalBookInformation;
  ebookInfo?: EbookInformation;
  review?: BookReview;
}

export interface AuthorFrontPageDTO {
  name: string;
}

export interface BookFrontPageDTO {
  code: string;
  title: string;
  coverUrl?: string;
  physicalPrice: number | null;
  ebookPrice: number | null;
  authors: AuthorFrontPageDTO[];
}

export interface BookPage {
  books: BookFrontPageDTO[];
  pagination: PaginationInfo;
  executionTimeMs?: number;
}




