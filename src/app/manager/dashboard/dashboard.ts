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

  // Pagination State
  currentPage = 1;
  itemsPerPage = 5;

  get paginatedPending() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.recentPending.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages() {
    return Math.ceil(this.recentPending.length / this.itemsPerPage);
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


        // Recent pending
        this.recentPending = pending
          .sort((a, b) =>
            new Date(b.approvalDate).getTime() -
            new Date(a.approvalDate).getTime()
          );
      },
      error: (err: any) => {
        console.error('Dashboard error:', err);
      }
    });
  }
}

