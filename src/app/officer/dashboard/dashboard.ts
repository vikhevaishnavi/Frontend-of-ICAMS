 
 
 
import { Component, inject, OnInit, ViewChild, ViewContainerRef, ComponentRef, OnDestroy } from '@angular/core';

import { CommonModule } from '@angular/common';

import { AccountService } from '../../core/services/account';

import { TransactionService } from '../../core/services/transaction';

import { Router } from '@angular/router';

import { LucideAngularModule, Users, CheckCircle } from 'lucide-angular';

import { catchError, of, retry } from 'rxjs';
 
@Component({

  selector: 'app-officer-dashboard',

  standalone: true,

  imports: [CommonModule, LucideAngularModule],

  templateUrl: './dashboard.html',

  styleUrls: ['./dashboard.css']

})

export class Dashboard implements OnInit, OnDestroy {

  private accountService = inject(AccountService);

  private transactionService = inject(TransactionService);

  private router = inject(Router);
 
  @ViewChild('embed', { read: ViewContainerRef, static: true }) embedRef!: ViewContainerRef;

  private currentRef: ComponentRef<any> | null = null;
 
  // Icons

  readonly Users = Users;

  readonly CheckCircle = CheckCircle;
 
  totalAccounts = 0;

  pendingTransactions = 0;

  approvedTransactions = 0;
 
  ngOnInit() {

    this.loadData();

  }
 
  ngOnDestroy() {

    this.clearEmbed();

  }
 
  private clearEmbed() {

    if (this.currentRef) {

      try { this.currentRef.destroy(); } catch { }

      this.currentRef = null;

    }

    if (this.embedRef) this.embedRef.clear();

  }
 
  async goToAccounts() {

    this.clearEmbed();

    const mod = await import('../account-management/account-management');

    const compRef = this.embedRef.createComponent(mod.AccountManagementComponent);

    compRef.instance.isEmbedded = true;

    if (typeof compRef.instance.loadAccounts === 'function') compRef.instance.loadAccounts();

    this.currentRef = compRef;

  }
 
  async goToTransactions(filter: 'approved' | 'pending') {

    this.clearEmbed();

    const mod = await import('../transaction-management/transaction-management');

    const compRef = this.embedRef.createComponent(mod.TransactionManagementComponent);

    // Mark as embedded and set filter before operations

    compRef.instance.isEmbedded = true;

    compRef.instance.statusFilter = filter === 'approved' ? 'APPROVED' : 'PENDING';

    // Show only TRANSFER type in approved section (no deposits/withdrawals)

    if (filter === 'approved') {

      compRef.instance.typeFilter = 'TRANSFER';

    }

    if (typeof compRef.instance.setupPollingIfNeeded === 'function') compRef.instance.setupPollingIfNeeded();

    if (typeof compRef.instance.loadHistory === 'function') compRef.instance.loadHistory();

    this.currentRef = compRef;

  }
 
  loadData() {

    // Retry failed requests once and log to help debug network issues

    this.accountService.getAllAccounts().pipe(

      retry(1),

      catchError((err) => {

        console.error('Failed to load accounts after retry:', err);

        return of([

          { id: '1', accountNumber: 'ACC01', type: 'Savings', balance: 154000, status: 'Active' },

          { id: '2', accountNumber: 'ACC02', type: 'Current', balance: 3450000, status: 'Active' },

        ]);

      })

    ).subscribe(accounts => {

      console.log('Dashboard: Accounts loaded, count:', accounts?.length);

      this.totalAccounts = accounts?.length || 0;

    });
 
    this.transactionService.getAllTransactions().pipe(

      retry(1),

      catchError((err) => {

        console.error('Failed to load transactions after retry:', err);

        return of([

          { id: '1', status: 'COMPLETED' },

          { id: '2', status: 'PENDING' },

          { id: '3', status: 'COMPLETED' }

        ] as any[]);

      })

    ).subscribe(transactions => {

      console.log('Dashboard: Transactions loaded, count:', transactions?.length);

      // count only APPROVED TRANSFER transactions (no deposits/withdrawals)

      this.approvedTransactions = transactions?.filter(t => t.status === 'APPROVED' && String(t.type).toUpperCase() === 'TRANSFER')?.length || 0;

      this.pendingTransactions = transactions?.filter(t => t.status === 'PENDING')?.length || 0;

      console.log('Dashboard: Approved transfers:', this.approvedTransactions, 'Pending:', this.pendingTransactions);

    });

  }

}

 