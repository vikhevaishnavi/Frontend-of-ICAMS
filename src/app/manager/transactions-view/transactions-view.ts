import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionService, Transaction } from '../../core/services/transaction';
 
@Component({
  selector: 'app-transactions-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transactions-view.html',
  styleUrls: ['./transactions-view.css']
})
export class TransactionsView implements OnInit {
 
  private transactionService = inject(TransactionService);
 
  transactions: Transaction[] = [];
  isLoading = true;
 
  ngOnInit() {
    this.loadTransactions();
  }
 
  loadTransactions() {
    this.transactionService.getAllTransactions()
      .subscribe({
        next: (data) => {
          this.transactions = data.sort((a, b) =>
            new Date(b.timestamp).getTime() -
            new Date(a.timestamp).getTime()
          );
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading transactions:', err);
          this.transactions = [];
          this.isLoading = false;
        }
      });
  }
}
 
 