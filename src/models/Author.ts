import { BookFrontPageDTO } from './Book';
import { PaginationInfo } from './Search';
import { Image } from './Image';

export interface Author {
  id: number;
  name: string;
  biography?: string;
  image: Image
}

export interface AuthorPage {
  authors: Author[];
  pagination: PaginationInfo;
}

export interface AuthorWithBooks {
  name: string;
  biography?: string;
  avatar: string;
  books: BookFrontPageDTO[];
  pagination?: PaginationInfo;
}