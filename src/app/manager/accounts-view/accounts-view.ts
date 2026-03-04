import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountService, Account } from '../../core/services/account';
 
@Component({
  selector: 'app-accounts-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './accounts-view.html',
  styleUrls: ['./accounts-view.css']
})
export class AccountsView implements OnInit {
 
  private accountService = inject(AccountService);
 
  accounts: Account[] = [];
  isLoading = true;
 
  ngOnInit(): void {
    this.loadAccounts();
  }
 
  loadAccounts(): void {
    this.accountService.getAllAccounts().subscribe({
      next: (data) => {
        this.accounts = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading accounts:', err);
        this.accounts = [];
        this.isLoading = false;
      }
    });
  }
}
 
 