import { Injectable } from '@angular/core';
import { StoredTokenState } from './auth.models';

/**
 * Abstraction over token persistence.
 * Current MVP uses localStorage; replace this service later for HttpOnly cookies
 * without changing AuthService / interceptor consumers.
 *
 * Never log access tokens, refresh tokens, or passwords.
 */
@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  private static readonly ACCESS_TOKEN_KEY = 'saas.auth.accessToken';
  private static readonly REFRESH_TOKEN_KEY = 'saas.auth.refreshToken';
  private static readonly EXPIRES_AT_KEY = 'saas.auth.expiresAt';

  getAccessToken(): string | null {
    return this.read(TokenStorageService.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return this.read(TokenStorageService.REFRESH_TOKEN_KEY);
  }

  getExpiresAt(): string | null {
    return this.read(TokenStorageService.EXPIRES_AT_KEY);
  }

  getTokenState(): StoredTokenState | null {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    const expiresAt = this.getExpiresAt();

    if (!accessToken || !refreshToken || !expiresAt) {
      return null;
    }

    return { accessToken, refreshToken, expiresAt };
  }

  saveTokenState(state: StoredTokenState): void {
    this.write(TokenStorageService.ACCESS_TOKEN_KEY, state.accessToken);
    this.write(TokenStorageService.REFRESH_TOKEN_KEY, state.refreshToken);
    this.write(TokenStorageService.EXPIRES_AT_KEY, state.expiresAt);
  }

  clear(): void {
    this.remove(TokenStorageService.ACCESS_TOKEN_KEY);
    this.remove(TokenStorageService.REFRESH_TOKEN_KEY);
    this.remove(TokenStorageService.EXPIRES_AT_KEY);
  }

  private read(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private write(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Storage may be unavailable (private mode); auth will fail gracefully.
    }
  }

  private remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }
}
