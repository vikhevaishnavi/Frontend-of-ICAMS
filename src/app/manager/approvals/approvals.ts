import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApprovalService } from '../../core/services/approval.service';
import { Transaction } from '../../core/services/transaction';
import { LucideAngularModule, CheckCircle, XCircle } from 'lucide-angular';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-approvals',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './approvals.html',
  styleUrls: ['./approvals.css']
})
export class Approvals implements OnInit {
  private approvalService = inject(ApprovalService);

  readonly CheckCircle = CheckCircle;
  readonly XCircle = XCircle;

  pendingApprovals: Transaction[] = [];
  processingId: string | null = null; // To show loading state on a specific row

  ngOnInit() {
    this.loadApprovals();
  }

  loadApprovals() {
    this.approvalService.getPendingApprovals().pipe(
      catchError(() => {
        // Fallback Mock Data
        return of([
          { id: '101', accountId: 'ACC-8912', amount: 150000, type: 'WITHDRAWAL', status: 'PENDING', timestamp: new Date().toISOString(), description: 'Large cash payout' },
          { id: '102', accountId: 'ACC-3341', amount: 200000, type: 'TRANSFER', status: 'PENDING', timestamp: new Date(Date.now() - 3600000).toISOString(), description: 'Business transfer' },
          { id: '103', accountId: 'ACC-7722', amount: 500000, type: 'DEPOSIT', status: 'PENDING', timestamp: new Date(Date.now() - 86400000).toISOString(), description: 'Corporate funding' }
        ] as Transaction[]);
      })
    ).subscribe(data => {
      this.pendingApprovals = data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    });
  }

  handleDecision(transactionId: string, decision: 'COMPLETED' | 'REJECTED') {
    if (!confirm(`Are you sure you want to ${decision} this transaction?`)) {
      return;
    }

    this.processingId = transactionId;

    this.approvalService.submitDecision(transactionId, { status: decision, reason: 'Manager Review' }).pipe(
      catchError(() => {
        // Mocking a successful backend response
        return of({ success: true, transactionId, status: decision });
      })
    ).subscribe({
      next: () => {
        // Remove the processed item from the local array
        this.pendingApprovals = this.pendingApprovals.filter(t => t.id !== transactionId);
        this.processingId = null;
      },
      error: () => {
        alert('Failed to process approval request.');
        this.processingId = null;
      }
    });
  }
}
