import { Image } from './image';
import { PaginationInfo } from './Search';

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