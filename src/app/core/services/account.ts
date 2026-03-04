
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

      map((accounts: any[]) => {

        console.log('Raw backend response:', accounts);

        return accounts.map((acc: any) => {

          // Backend field is accountID (lowercase a, capital ID)

          const accountId = acc.accountID || acc.AccountID || acc.id || acc.accountId || acc.account_id || '';

          const balance = acc.balance || acc.Balance || acc.initialBalance || 0;

          // Log all available keys in account object for debugging

          console.log('Account object keys:', Object.keys(acc));

          console.log('Checking date fields - CreatedDate:', acc.CreatedDate, 'created_date:', acc.created_date, 'createdAt:', acc.createdAt, 'createdDate:', acc.createdDate, 'CreateDate:', acc.CreateDate);

          const mappedAccount = {

            id: String(accountId),

            accountNumber: String(accountId), // Display the AccountID as Account Number

            type: acc.AccountType || acc.type || 'Savings',

            balance: this.parseBalance(balance),

            status: acc.Status || acc.status || 'Active',

            userId: String(acc.CustomerID || acc.userId || acc.customer_id || acc.customerId || ''),

            customerName: acc.CustomerName || acc.customer_name || acc.customerName || 'Unknown User',

            createdAt: acc.CreatedDate || acc.created_date || acc.createdAt || acc.createdDate || acc.CreateDate || acc.create_date || acc.DateCreated || acc.dateCreated || '',

            branch: acc.Branch || acc.branch || ''

          };

          console.log('Mapped account:', mappedAccount);

          return mappedAccount;

        });

      })

    );

  }
 
  private parseBalance(balance: any): number {

    if (typeof balance === 'number') return balance;

    if (typeof balance === 'string') return parseFloat(balance) || 0;

    return 0;

  }
 
  // Accept any payload shape when creating accounts because backend expects

  // specific keys (e.g., CustomerName, Balance). Return type is kept generic

  // to avoid TypeScript errors when mapping client form fields to backend names.

  createAccount(accountData: any): Observable<any> {

    return this.http.post<any>(`${this.API_URL}/create`, accountData);

  }
 
  updateAccount(accountId: string, data: Partial<Account>): Observable<Account> {

    return this.http.put<Account>(`${this.API_URL}/update/${accountId}`, data);

  }
 
  deleteAccount(accountId: string): Observable<any> {

    // Backend uses 'close' endpoint instead of delete (closes account rather than deleting)

    return this.http.put(`${this.API_URL}/close/${accountId}`, {});

  }

}
 
 