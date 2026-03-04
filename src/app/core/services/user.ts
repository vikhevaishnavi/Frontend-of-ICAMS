import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


export interface User {
  UserID?: number;
  Name: string;
  Email: string;
  Role: string;
  Branch: string;
  Status: string;
}


@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/Users';

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.API_URL);
  }

  createUser(userData: any): Observable<any> {
  // Mapping directly to backend DTO: Name, Email, Password, Role, Branch
  const payload = {
    name: userData.name, // Simplified to single name field
    email: userData.email,
    password: "User@123", // Default password for new users
    role: userData.role,
    branch: userData.branch
  };
  return this.http.post<any>(this.API_URL, payload);
}

  // This handles the status update specifically
  // src/app/core/services/user.service.ts

// Change status using PATCH
updateUserStatus(id: string | number, status: string): Observable<any> {
  // Path: api/Users/{id}/status?status=Active
  return this.http.patch(`${this.API_URL}/${id}/status`, null, {
    params: { status: status }
  });
}

// Edit user using PUT
updateUser(id: string | number, userData: any): Observable<any> {
  // Path: api/Users/{id}
  return this.http.put(`${this.API_URL}/${id}`, userData);
}
}