/** Matches backend Auth DTOs (camelCase JSON). */

export interface LoginRequest {
  tenantCode: string;
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: AuthUserDto;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  tenantCode: string;
  username: string;
}

export interface ForgotPasswordResponse {
  developmentResetToken?: string | null;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface AuthUserDto {
  userId: number;
  tenantId: number;
  defaultBranchId?: number | null;
  username: string;
  email?: string | null;
  firstName: string;
  lastName?: string | null;
  isPlatformAdmin: boolean;
  roles: string[];
  permissions: string[];
}

export interface CurrentUserDto {
  userId: number;
  tenantId: number;
  branchId?: number | null;
  username: string;
  email?: string | null;
  firstName: string;
  lastName?: string | null;
  isPlatformAdmin: boolean;
  roles: string[];
  permissions: string[];
}

export interface StoredTokenState {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}
