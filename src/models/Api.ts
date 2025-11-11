export type ApiResponse<T> = {
  errorCode?: string;
  message?: string;
  data: T;
};


