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

export interface Book {
  code: string;
  title: string;
  authors: Author[];
  translators: Translator[];
  edition?: number;
  publisher?: Publisher | null;
  publicationDate?: Date | null; // yyyy-MM-dd
  language?: string | null;
  pageCount?: number;
  description?: string;
  images: BookImage[];
  hasPhysicalEdition: boolean;
  hasElectricEdition: boolean;
}


