 
 
 
import { Injectable, inject } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { map, finalize } from 'rxjs/operators';
 
export interface Transaction {

  id: string;

  accountId: string;

  fromAccountId?: string;

  toAccountId?: string;

  amount: number;

  type: 'CREDIT' | 'DEBIT' | 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER';

  status: string;

  timestamp: string;

  description: string;

  comment?: string; // optional comment field coming from backend

}
 
@Injectable({

  providedIn: 'root'

})

export class TransactionService {

  private http = inject(HttpClient);

  private readonly API_URL = '/api/transactions';
 
  getAllTransactions(): Observable<Transaction[]> {

    return this.http.get<any[]>(this.API_URL).pipe(

      map((transactions: any[]) => {

        console.log('=== Raw backend response ===');

        console.log('Number of transactions:', transactions?.length);

        if (transactions && transactions.length > 0) {

          console.log('First transaction raw:', JSON.stringify(transactions[0], null, 2));

        }

        const mappedArray = transactions.map((txn: any) => {

          const id = txn.transactionID || txn.TransactionID || txn.id || '';

          const accountId = txn.accountID || txn.AccountID || txn.accountId || txn.AccountId || '';

          const fromAccountId = txn.fromAccountId || txn.FromAccountID || txn.FromAccountId || txn.fromAccountID || '';

          const toAccountId = txn.toAccountID || txn.ToAccountID || txn.toAccountId || txn.ToAccountId || '';

          const rawAmount = txn.amount ?? txn.Amount ?? 0;

          const rawType = txn.type || txn.Type || 'DEPOSIT';

          const rawStatus = txn.status || txn.Status || 'Completed';

          const rawTimestamp = txn.date || txn.Date || txn.transactionDate || txn.TransactionDate || txn.timestamp || '';
 
          const commentVal = txn.comment || txn.Comment || txn.comments || txn.CommentText || '';

          const mapped: Transaction = {

            id: String(id),

            accountId: String(accountId),

            fromAccountId: fromAccountId ? String(fromAccountId) : undefined,

            toAccountId: toAccountId ? String(toAccountId) : undefined,

            amount: typeof rawAmount === 'number' ? rawAmount : parseFloat(String(rawAmount)) || 0,

            type: (typeof rawType === 'string' ? rawType.toUpperCase() : 'DEPOSIT') as any,

            status: String(rawStatus).toUpperCase(),

            timestamp: rawTimestamp ? new Date(rawTimestamp).toISOString() : '',

            description: String(txn.description || txn.Description || ''),

            comment: String(commentVal)

          };

          return mapped;

        });
 
        if (mappedArray && mappedArray.length > 0) {

          console.log('Mapped first transaction:', JSON.stringify(mappedArray[0], null, 2));

        }
 
        return mappedArray;

      })

    );

  }
 
  /**

   * Retrieve transactions filtered by a status value directly from the API.

   */

  getTransactionsByStatus(status: string): Observable<Transaction[]> {

    return this.http.get<any[]>(`${this.API_URL}?status=${encodeURIComponent(status)}`).pipe(

      map((transactions: any[]) => {

        const mappedArray = transactions.map((txn: any) => {

          const id = txn.transactionID || txn.TransactionID || txn.id || '';

          const accountId = txn.accountID || txn.AccountID || txn.accountId || txn.AccountId || '';

          const fromAccountId = txn.fromAccountId || txn.FromAccountID || txn.FromAccountId || txn.fromAccountID || '';

          const toAccountId = txn.toAccountID || txn.ToAccountID || txn.toAccountId || txn.ToAccountId || '';

          const rawAmount = txn.amount ?? txn.Amount ?? 0;

          const rawType = txn.type || txn.Type || 'DEPOSIT';

          const rawStatus = txn.status || txn.Status || 'Completed';

          const rawTimestamp = txn.date || txn.Date || txn.transactionDate || txn.TransactionDate || txn.timestamp || '';
 
          const mapped: Transaction = {

            id: String(id),

            accountId: String(accountId),

            fromAccountId: fromAccountId ? String(fromAccountId) : undefined,

            toAccountId: toAccountId ? String(toAccountId) : undefined,

            amount: typeof rawAmount === 'number' ? rawAmount : parseFloat(String(rawAmount)) || 0,

            type: (typeof rawType === 'string' ? rawType.toUpperCase() : 'DEPOSIT') as any,

            status: String(rawStatus).toUpperCase(),

            timestamp: rawTimestamp ? new Date(rawTimestamp).toISOString() : '',

            description: String(txn.description || txn.Description || '')

          };

          return mapped;

        });

        return mappedArray;

      })

    );

  }
 
  initiateTransaction(data: any): Observable<any> {

    console.log('=== Transaction Request ===');

    console.log('Sending data to backend:', JSON.stringify(data, null, 2));

    console.log('API endpoint:', `${this.API_URL}/initiate`);

    return this.http.post<any>(`${this.API_URL}/initiate`, data).pipe(

      map(response => {

        console.log('Backend response:', response);

        return response;

      })

    );

  }

}
 
 