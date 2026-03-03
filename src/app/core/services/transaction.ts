import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Transaction {
  id: string;
  accountId: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT' | 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER';
  status: string;
  timestamp: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/transactions';

  getAllTransactions(): Observable<Transaction[]> {
    return this.http.get<any[]>(this.API_URL).pipe(
      map((transactions: any[]) => transactions.map((txn: any) => ({
        id: String(txn.TransactionID || txn.id || ''),
        accountId: String(txn.AccountID || txn.accountId || ''),
        amount: typeof txn.Amount === 'number' ? txn.Amount : parseFloat(txn.Amount) || 0,
        type: txn.Type || txn.type || 'DEPOSIT',
        status: txn.Status || txn.status || 'Completed',
        timestamp: txn.TransactionDate || txn.timestamp || new Date().toISOString(),
        description: txn.Description || txn.description || ''
      })))
    );
  }

  initiateTransaction(data: any): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.API_URL}/initiate`, data);
  }
}
