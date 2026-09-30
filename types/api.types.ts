export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
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
