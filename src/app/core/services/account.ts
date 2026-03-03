import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Account {
  id: string;
  accountNumber: string;
  type: string;
  balance: number;
  status: string;
  userId: string;
  createdAt: string;
  customerName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/v1/Accounts';

  getAllAccounts(): Observable<Account[]> {
    return this.http.get<any[]>(`${this.API_URL}/all`).pipe(
      map((accounts: any[]) => accounts.map((acc: any) => ({
        id: String(acc.AccountID || acc.id || ''),
        accountNumber: String(acc.AccountID || acc.accountNumber || ''),
        type: acc.AccountType || acc.type || 'Savings',
        balance: typeof acc.Balance === 'number' ? acc.Balance : parseFloat(acc.Balance) || 0,
        status: acc.Status || acc.status || 'Active',
        userId: String(acc.CustomerID || acc.userId || ''),
        customerName: acc.CustomerName || acc.customerName || 'Unknown User',
        createdAt: acc.CreatedDate || acc.createdAt || new Date().toISOString(),
        branch: acc.Branch || acc.branch || ''
      })))
    );
  }

  createAccount(accountData: Partial<Account>): Observable<Account> {
    return this.http.post<Account>(`${this.API_URL}/create`, accountData);
  }
}
