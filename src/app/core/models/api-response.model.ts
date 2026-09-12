/**
 * Matches SaaSPlatform.Shared.Models.ApiError
 */
export interface ApiError {
  code: string;
  message: string;
  field?: string | null;
}

/**
 * Matches SaaSPlatform.Shared.Models.ApiResponse&lt;T&gt;
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  errors: ApiError[];
}
