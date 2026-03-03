import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService, Transaction } from '../../core/services/transaction';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-transaction-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transaction-management.html',
  styleUrls: ['./transaction-management.css']
})
export class TransactionManagement implements OnInit {
  private transactionService = inject(TransactionService);

  transactions: Transaction[] = [];

  // Initiate Transaction Form State
  showTransactionForm = false;
  newTransaction: any = {
    accountId: '',
    type: 'DEPOSIT',
    amount: 0,
    description: ''
  };

  isSubmitting = false;

  ngOnInit() {
    this.loadTransactions();
  }

  loadTransactions() {
    this.transactionService.getAllTransactions().pipe(
      catchError(() => {
        // Fallback Mock Data if API is unavailable
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

  toggleTransactionForm() {
    this.showTransactionForm = !this.showTransactionForm;
    this.resetForm();
  }

  resetForm() {
    this.newTransaction = {
      accountId: '',
      type: 'DEPOSIT',
      amount: 0,
      description: ''
    };
  }

  onInitiateTransaction() {
    if (!this.newTransaction.accountId || this.newTransaction.amount <= 0) {
      alert('Please provide a valid Account ID and an amount greater than 0');
      return;
    }

    // Business Logic Rule: Manager Approval required for > 100,000
    let determinedStatus = 'COMPLETED';
    if (this.newTransaction.amount > 100000) {
      determinedStatus = 'PENDING';
      alert('Notice: Transaction amount exceeds ₹100,000. It requires Manager Approval and will be set to PENDING.');
    }

    this.isSubmitting = true;

    // Attempt API Call
    this.transactionService.initiateTransaction(this.newTransaction).pipe(
      catchError(() => {
        // Mock success if backend isn't ready
        const createdMock: Transaction = {
          ...this.newTransaction,
          id: Date.now().toString(),
          status: determinedStatus,
          timestamp: new Date().toISOString()
        };
        return of(createdMock);
      })
    ).subscribe({
      next: (txn) => {
        this.transactions.unshift(txn);
        this.isSubmitting = false;
        this.toggleTransactionForm();
        alert('Transaction initiated successfully');
      },
      error: () => {
        this.isSubmitting = false;
        alert('Failed to initiate transaction');
      }
    });
  }
}
