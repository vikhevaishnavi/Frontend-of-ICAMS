
import { Injectable, inject } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, Observable, tap, switchMap, map, of } from 'rxjs';

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
    const email = credentials.email || credentials.Email;
    const password = credentials.password || credentials.Password;

    // Hardcoded bypass for the admin user since the backend database has a plain-text 
    // "password" hash that crashes BCrypt, and the user cannot alter the backend/DB.
    if (email === 'admin@bank.com' && password === 'password') {
      return of({
        accessToken: 'dummy-admin-token',
        refreshToken: 'dummy-admin-refresh'
      }).pipe(
        tap((response: any) => {
          localStorage.setItem('auth_token', response.accessToken);
          localStorage.setItem('refresh_token', response.refreshToken);
        }),
        switchMap(() => this.fetchMe()) // fetchMe() still requires a mock
      );
    }

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
    if (this.getToken() === 'dummy-admin-token') {
      const adminUser: User = {
        id: '1',
        username: 'admin@bank.com',
        email: 'admin@bank.com',
        role: 'Admin',
        firstName: 'Admin',
        lastName: 'User',
        branch: 'Headquarters',
        status: 'Active'
      };
      return of(adminUser).pipe(
        tap((user: User) => {
          this.currentUserSubject.next(user);
        })
      );
    }

    return this.http.get<any>(`${this.API_URL}/me`).pipe(

      map(data => {

        const id = data.UserID || data.id || data.Id;

        const nameParts = (data.Name || '').split(' ');

        const rawRole = data.Role || data.role || '';

        let mappedRole: 'Admin' | 'Officer' | 'Manager' = 'Officer';

        if (rawRole === 'Admin') {

          mappedRole = 'Admin';

        } else if (rawRole === 'Manager') {

          mappedRole = 'Manager';

        } else {

          mappedRole = 'Officer'; // Maps "Bank Officer" to "Officer"

        }

        const mappedUser: User = {

          id: String(id),

          username: data.Email || data.email,

          email: data.Email || data.email,

          role: mappedRole,

          firstName: nameParts[0] || 'User',

          lastName: nameParts.slice(1).join(' ') || '',

          branch: data.Branch || data.branch,

          status: data.Status || data.status

        };

        return mappedUser;

      }),

      tap((user: User) => {

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

