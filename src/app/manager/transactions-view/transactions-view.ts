import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionService, Transaction } from '../../core/services/transaction';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-transactions-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transactions-view.html',
  styleUrls: ['./transactions-view.css'] // Share styles
})
export class TransactionsView implements OnInit {
  private transactionService = inject(TransactionService);

  transactions: Transaction[] = [];

  ngOnInit() {
    this.loadTransactions();
  }

  loadTransactions() {
    this.transactionService.getAllTransactions().pipe(
      catchError(() => {
        // Fallback Mock Data
        return of([
          { id: '1', accountId: 'ACC01', amount: 50000, type: 'DEPOSIT', status: 'COMPLETED', timestamp: '2026-02-15T10:00:00Z', description: 'Initial deposit' },
          { id: '2', accountId: 'ACC02', amount: 120000, type: 'WITHDRAWAL', status: 'PENDING', timestamp: '2026-03-01T14:30:00Z', description: 'Large cash withdrawal' },
          { id: '3', accountId: 'ACC01', amount: 3000, type: 'TRANSFER', status: 'COMPLETED', timestamp: '2026-03-02T09:15:00Z', description: 'Transfer to external account' },
        ] as Transaction[]);
      })
    ).subscribe(data => {
      this.transactions = data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    });
  }
}
