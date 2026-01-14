import { au } from "vitest/dist/chunks/reporters.nr4dxCkA.js";

export const API_CONFIG = {
  baseURL: import.meta.env.MODE === 'development'
    ? '/api'
    : import.meta.env.VITE_API_BASE_URL || 'https://api-dev.huongcungbookstore.com/api',

  endpoints: {
    catalog: {
      books: '/catalog/books',
      bookDetails: (code: string) => `/catalog/books/${code}`,
      bookForOrder: (code: string) => `/catalog/books/order/physical?code=${code}`,
      suggestions: '/catalog/books/suggest',
    },

    author: {
      authors: '/catalog/books/authors',
    },

    order: {
      checkout: '/order/checkout',
      calculateFee: '/order/calculate-fee',
      history: '/order/history',
      orderDetails: (id: number) => `/order/history/${id}`,
    },

    payment: {
      createUrl: '/payment/create-url',
    },

    delivery: {
      provinces: '/delivery/provinces',
      districts: '/delivery/districts',
      wards: '/delivery/wards',
      services: '/delivery/services',
    },

    auth: {
      login: '/auth/login',
      register: '/auth/register',
      logout: '/auth/logout',
    },
  },
} as const;

