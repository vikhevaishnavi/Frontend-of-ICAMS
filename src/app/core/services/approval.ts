import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
 
@Injectable({
  providedIn: 'root'
})
export class ApprovalService {
 
  private http = inject(HttpClient);
  private baseUrl = 'https://localhost:7154/api/v1/approvals';
 
  getApprovals() {
    return this.http.get<any[]>(this.baseUrl);
  }
 
  submitDecision(id: number, data: any) {
    return this.http.post<any>(`${this.baseUrl}/${id}/decision`, data);
  }
}
 
 