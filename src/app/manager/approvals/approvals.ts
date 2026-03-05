import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApprovalService } from '../../core/services/approval.service';
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

  pendingApprovals: any[] = [];
  processingId: number | null = null;

  // Pagination State
  currentPage = 1;
  itemsPerPage = 10;

  get paginatedApprovals() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.pendingApprovals.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages() {
    return Math.ceil(this.pendingApprovals.length / this.itemsPerPage);
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
    this.loadApprovals();
  }

  loadApprovals() {
    this.approvalService.getApprovals()
      .subscribe((data: any[]) => {

        // Only show Pending approvals
        this.pendingApprovals = data
          .filter(a => a.decision === 'Pending')
          .sort((a, b) =>
            new Date(b.approvalDate).getTime() -
            new Date(a.approvalDate).getTime()
          );
      });
  }


  handleDecision(approvalId: number, decision: 'Approved' | 'Rejected') {

    if (!confirm(`Are you sure you want to ${decision}?`)) {
      return;
    }

    this.processingId = approvalId;

    this.approvalService.submitDecision(approvalId, {
      reviewerID: 1,   // temporarily hardcoded manager id
      decision: decision,
      comments: 'Manager review'
    })
      .subscribe(() => {
        this.loadApprovals(); // reload after action
        this.processingId = null;
      });
  }

}

