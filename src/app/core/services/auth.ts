import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, switchMap, map } from 'rxjs';
import { Router } from '@angular/router';

export interface User {
  id: string;
  username: string;
  email?: string;
  role: 'Admin' | 'Officer' | 'Manager';
  firstName: string;
  lastName: string;
  branch?: string;
  status?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly API_URL = '/api/Users';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.checkSession();
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/login`, credentials).pipe(
      tap((response) => {
        if (response && response.accessToken) {
          localStorage.setItem('auth_token', response.accessToken);
        }
        if (response && response.refreshToken) {
          localStorage.setItem('refresh_token', response.refreshToken);
        }
      }),
      switchMap(() => this.fetchMe())
    );
  }

  logout(): Observable<any> {
    const refreshToken = localStorage.getItem('refresh_token') || '';

    return this.http.post(`${this.API_URL}/logout`, { refreshToken }, { responseType: 'text' }).pipe(
      tap(() => {
        this.clearSession();
      })
    );
  }

  fetchMe(): Observable<User> {
    return this.http.get<any>(`${this.API_URL}/me`).pipe(
      map(data => {
        // Map backend dictionary fields to Angular User interface
        // Handling variations like 'UserID' vs 'ID' based on standard C# dictionary serialization
        const id = data.UserID || data.id || data.Id;
        const nameParts = (data.Name || '').split(' ');

        const mappedUser: User = {
          id: String(id),
          username: data.Email || data.email,
          email: data.Email || data.email,
          role: data.Role || data.role,
          firstName: nameParts[0] || 'User',
          lastName: nameParts.slice(1).join(' ') || '',
          branch: data.Branch || data.branch,
          status: data.Status || data.status
        };
        return mappedUser;
      }),
      tap((user) => {
        this.currentUserSubject.next(user);
      })
    );
  }

  private checkSession() {
    const token = localStorage.getItem('auth_token');
    if (token) {
      this.fetchMe().subscribe({
        error: (err) => {
          console.error('Session check failed', err);
          if (err.status === 401) {
            this.clearSession();
          }
        }
      });
    }
  }

  private clearSession() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
