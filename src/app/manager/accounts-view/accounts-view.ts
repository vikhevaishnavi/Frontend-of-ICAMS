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

  // Pagination State
  currentPage = 1;
  itemsPerPage = 10;

  get paginatedAccounts() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.accounts.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages() {
    return Math.ceil(this.accounts.length / this.itemsPerPage);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.accountService.getAllAccounts().subscribe({
      next: (data) => {
        this.accounts = data;
        this.currentPage = 1;
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

