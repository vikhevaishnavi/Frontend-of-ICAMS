import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountService, Account } from '../../core/services/account';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-accounts-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './accounts-view.html',
  styleUrls: ['./accounts-view.css'] // We will share/duplicate styles from officer/account-management
})
export class AccountsView implements OnInit {
  private accountService = inject(AccountService);

  accounts: Account[] = [];

  ngOnInit() {
    this.loadAccounts();
  }

  loadAccounts() {
    this.accountService.getAllAccounts().pipe(
      catchError(() => {
        // Fallback Mock Data if API is unavailable
        return of([
          { id: '1', accountNumber: 'ACC01', type: 'Savings', balance: 154000, status: 'Active', userId: 'CUST-001', createdAt: '2026-01-10T10:00:00Z', customerName: 'Alice Smith' },
          { id: '2', accountNumber: 'ACC02', type: 'Current', balance: 3450000, status: 'Active', userId: 'CUST-002', createdAt: '2026-02-15T11:30:00Z', customerName: 'Bob Jones' },
          { id: '3', accountNumber: 'ACC03', type: 'Fixed Deposit', balance: 5000000, status: 'Pending', userId: 'CUST-003', createdAt: '2026-03-01T09:00:00Z', customerName: 'Charlie Brown' }
        ] as any[]);
      })
    ).subscribe(data => {
      this.accounts = data;
    });
  }
}
