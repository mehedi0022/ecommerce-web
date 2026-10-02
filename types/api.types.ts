export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
  meta: PaginationMeta;
}

export interface ApiMessageResponse {
  success: boolean;
  message: string;
}

export interface ApiValidationDetail {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  code?: string;
  requestId?: string;
  details?: ApiValidationDetail[];
}

export type ApiError = ApiErrorResponse | { status?: number; data?: ApiErrorResponse | unknown; error?: string };
