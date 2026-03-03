import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApprovalService } from '../../core/services/approval.service';
import { TransactionService, Transaction } from '../../core/services/transaction';
import { LucideAngularModule, ClipboardCheck, ArrowRightLeft } from 'lucide-angular';
import { catchError, of } from 'rxjs';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {
  private approvalService = inject(ApprovalService);
  private transactionService = inject(TransactionService);

  readonly ClipboardCheck = ClipboardCheck;
  readonly ArrowRightLeft = ArrowRightLeft;

  pendingApprovalsCount = 0;
  totalApprovedCount = 0;
  recentPending: Transaction[] = [];

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    // 1. Load Pending Approvals Count & Recent List
    this.approvalService.getPendingApprovals().pipe(
      catchError(() => {
        // Fallback Mock Data
        return of([
          { id: '101', accountId: 'ACC-8912', amount: 150000, type: 'WITHDRAWAL', status: 'PENDING', timestamp: new Date().toISOString(), description: 'Large cash payout' },
          { id: '102', accountId: 'ACC-3341', amount: 200000, type: 'TRANSFER', status: 'PENDING', timestamp: new Date(Date.now() - 3600000).toISOString(), description: 'Business transfer' }
        ] as Transaction[]);
      })
    ).subscribe(pending => {
      this.pendingApprovalsCount = pending.length;
      this.recentPending = pending.slice(0, 3); // Take top 3 for dashboard
    });

    // 2. Load historic 'COMPLETED' count assuming all GET transactions captures historic approvals
    this.transactionService.getAllTransactions().pipe(
      catchError(() => {
        return of([
          { id: '1', status: 'COMPLETED' },
          { id: '2', status: 'COMPLETED' },
          { id: '3', status: 'COMPLETED' }
        ] as any[]);
      })
    ).subscribe(txns => {
      this.totalApprovedCount = txns.filter(t => t.status === 'COMPLETED').length;
    });
  }
}
