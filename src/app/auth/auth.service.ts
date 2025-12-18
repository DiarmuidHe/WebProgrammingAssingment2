import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, switchMap } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { JobSeeker } from '../jobseekers/jobseeker.interface';

type UserRole = "jobseeker" | "employer";

type JwtPayload = {
  sub?: string;
  id?: string;
  email: string;
  name?: string;
  role: UserRole;
  exp: number;
};

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
}

type LoginResponse = {
  accessToken: string;
};

type RegisterResponse = {
  message: string;
  id: string;
};

const STORAGE_KEY_USER = 'currentUser';
const STORAGE_KEY_TOKEN = 'accessToken';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = environment.apiUri;
  private http = inject(HttpClient);

  readonly currentUser$ = new BehaviorSubject<AuthUser | null>(null);
  readonly isAuthenticated$ = new BehaviorSubject<boolean>(false);

  private authTimeoutId?: any;

  constructor() {
    const token = this.getToken();
    if (!token) {
      this.isAuthenticated$.next(false);
      return;
    }

    const payload = this.safeDecodeToken(token);
    if (!payload) {
      this.clearAuth();
      return;
    }

    const expires = payload.exp * 1000;
    if (expires > Date.now()) {
      const user: AuthUser = {
        _id: (payload.sub || payload.id) as string,
        name: payload.name ?? '',
        email: payload.email,
        role: payload.role,
      };

      this.currentUser$.next(user);
      this.isAuthenticated$.next(true);
      this.startAuthTimer(expires);
    } else {
      this.clearAuth();
    }
  }

  // PUBLIC API

  login(email: string, password: string, role: UserRole): Observable<void> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/auth/login`, { email, password, role })
      .pipe(
        map((body) => {
          this.setSessionFromToken(body.accessToken);
        })
      );
  }

  registerJobseeker(name: string, email: string, password: string): Observable<void> {
    return this.http
      .post<RegisterResponse>(`${this.apiUrl}/auth/register/jobseeker`, {
        name,
        email,
        password,
      })
      .pipe(switchMap(() => this.login(email, password, 'jobseeker')));
  }

  registerEmployer(name: string, email: string, password: string): Observable<void> {
    return this.http
      .post<RegisterResponse>(`${this.apiUrl}/auth/register/employer`, {
        name,
        email,
        password,
      })
      .pipe(switchMap(() => this.login(email, password, 'employer')));
  }

  beginGoogleLogin(role: UserRole = 'jobseeker'): void {
    // sends role as state to backend
    window.location.href = `${this.apiUrl}/auth/google?state=${encodeURIComponent(role)}`;
  }

  completeOAuthLogin(token: string): void {
    this.setSessionFromToken(token);
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUser$.value;
  }

  getCurrentUserId(): string | null {
    return this.currentUser$.value?._id ?? null;
  }

  getToken(): string | null {
    const token = localStorage.getItem(STORAGE_KEY_TOKEN);
    if (!token || token === 'undefined' || token === 'null') return null;
    return token;
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated$.value;
  }

  logout(): void {
    this.clearAuth();
  }

  // INTERNAL HELPERS
  private setSessionFromToken(token: string): void {
    const payload = this.safeDecodeToken(token);
    if (!payload) {
      throw new Error('Invalid token');
    }

    const expires = payload.exp * 1000;

    const user: AuthUser = {
      _id: (payload.sub || payload.id) as string,
      name: payload.name ?? '',
      email: payload.email,
      role: payload.role,
    };

    localStorage.setItem(STORAGE_KEY_TOKEN, token);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));

    this.currentUser$.next(user);
    this.isAuthenticated$.next(true);
    this.startAuthTimer(expires);
  }

  private clearAuth() {
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_USER);
    this.currentUser$.next(null);
    this.isAuthenticated$.next(false);
    if (this.authTimeoutId) {
      clearTimeout(this.authTimeoutId);
      this.authTimeoutId = undefined;
    }
  }

  private startAuthTimer(expires: number) {
    const timeout = expires - Date.now() - 60_000;
    if (timeout <= 0) {
      this.logout();
      return;
    }

    if (this.authTimeoutId) {
      clearTimeout(this.authTimeoutId);
    }

    this.authTimeoutId = setTimeout(() => {
      this.logout();
    }, timeout);
  }

  private safeDecodeToken(token: string): JwtPayload | null {
    try {
      if (!token.includes('.')) return null;

      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

      const payloadJson = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      return JSON.parse(payloadJson) as JwtPayload;
    } catch (err) {
      console.error('Failed to decode JWT', err);
      return null;
    }
  }
}