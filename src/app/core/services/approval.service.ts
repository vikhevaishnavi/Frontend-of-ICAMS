import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Transaction } from './transaction';

export interface ApprovalDecision {
    status: 'COMPLETED' | 'REJECTED';
    reason?: string;
}

@Injectable({
    providedIn: 'root'
})
export class ApprovalService {
    private http = inject(HttpClient);
    private readonly API_URL = '/api/approvals';

    // Fetches transactions that are flagged for manager review
    getPendingApprovals(): Observable<Transaction[]> {
        return this.http.get<Transaction[]>(this.API_URL);
    }

    // Submit decision for a specific transaction
    submitDecision(transactionId: string, decision: ApprovalDecision): Observable<any> {
        return this.http.post(`${this.API_URL}/${transactionId}/decision`, decision);
    }
}
