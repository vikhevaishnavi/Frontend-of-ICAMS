import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApprovalService } from '../../core/services/approval.service';
import { LucideAngularModule, ClipboardCheck } from 'lucide-angular';
import { RouterLink, RouterModule } from '@angular/router';
 
@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterLink, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {
 
  private approvalService = inject(ApprovalService);
 
  readonly ClipboardCheck = ClipboardCheck;
 
  pendingApprovalsCount = 0;
  totalApprovedCount = 0;
  recentPending: any[] = [];
 
  ngOnInit() {
    this.loadDashboard();
  }
 
  loadDashboard() {
    this.approvalService.getApprovals().subscribe({
      next: (approvals: any[]) => {
 
        // Pending = Decision null OR 'Pending'
        const pending = approvals.filter(a =>
          !a.decision || a.decision === 'Pending'
        );
 
        this.pendingApprovalsCount = pending.length;
 
        // Approved this month
        const now = new Date();
 
this.totalApprovedCount = approvals.filter(a =>
  a.decision?.toLowerCase() === 'approved' &&
  a.approvalDate &&
  new Date(a.approvalDate).getMonth() === now.getMonth() &&
  new Date(a.approvalDate).getFullYear() === now.getFullYear()
).length;
 
 
        // Recent 3 pending
        this.recentPending = pending
          .sort((a, b) =>
            new Date(b.approvalDate).getTime() -
            new Date(a.approvalDate).getTime()
          )
          .slice(0, 3);
      },
      error: (err) => {
        console.error('Dashboard error:', err);
      }
    });
  }
}
 
 