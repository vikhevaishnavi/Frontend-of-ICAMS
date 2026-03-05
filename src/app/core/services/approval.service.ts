import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ApprovalService {
    private http = inject(HttpClient);
    private readonly API_URL = '/api/v1/approvals';

    getApprovals(): Observable<any[]> {
        return this.http.get<any[]>(this.API_URL);
    }

    submitDecision(approvalId: number | string, decisionPayload: any): Observable<any> {
        return this.http.post(`${this.API_URL}/${approvalId}/decision`, decisionPayload);
    }
}
