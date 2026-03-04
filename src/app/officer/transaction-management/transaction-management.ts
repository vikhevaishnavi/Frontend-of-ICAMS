 
 
 
import { Component, OnInit, OnDestroy } from '@angular/core';

import { finalize } from 'rxjs/operators';

import { FormsModule } from '@angular/forms';

import { CommonModule } from '@angular/common';

import { TransactionService } from '../../core/services/transaction';

import { AccountService } from '../../core/services/account';

import { ActivatedRoute, Router } from '@angular/router';

import { ApprovalService } from '../../core/services/approval.service';
 
@Component({

  selector: 'app-transaction-management',

  templateUrl: './transaction-management.html',

  styleUrls: ['./transaction-management.css'],

  standalone: true,

  imports: [FormsModule, CommonModule]

})

export class TransactionManagementComponent implements OnInit, OnDestroy {

  transactions: any[] = [];

  accounts: any[] = [];

  accountMap: Map<string, any> = new Map(); 

  showInitiateForm = false;

  isLoading = false;          // used for form submission

  historyLoading = false;     // used when reloading history

  fromAccountError = '';

  toAccountError = '';

  transactionData = {

    type: 'Deposit',

    fromAccountId: '',

    toAccountId: '',

    amount: 0

  };
 
  statusFilter: string | null = null;

  private pollIntervalId: any = null;

  typeFilter: string | null = null;

  // Officers can approve transactions only up to this amount (in the smallest currency unit)

  readonly OFFICER_APPROVAL_LIMIT = 100000; // ₹100,000

  processingId: string | null = null;

  noticeMessage: string | null = null;

  isEmbedded = false; // Set to true when embedded in dashboard
 
  private showNotice(msg: string, timeout = 4000) {

    this.noticeMessage = msg;

    setTimeout(() => this.noticeMessage = null, timeout);

  }
 
  constructor(

    private transactionService: TransactionService,

    private accountService: AccountService,

    private route: ActivatedRoute,

    private approvalService: ApprovalService,

    private router: Router

  ) {}
 
  ngOnInit(): void {

    this.loadAccounts();
 
    // Only subscribe to route params if not embedded (embedded mode sets statusFilter directly)

    if (!this.isEmbedded) {

      // react to query param changes to support filtered views (e.g., ?status=PENDING)

      this.route.queryParams.subscribe(params => {

        this.statusFilter = params['status'] ? String(params['status']).toUpperCase() : null;

        this.setupPollingIfNeeded();

        this.loadHistory();

      });

    }

  }
 
  loadAccounts(): void {

    this.accountService.getAllAccounts().subscribe({

      next: (data: any[]) => {

        this.accounts = data || [];

        this.accounts.forEach(acc => {

          const accountId = acc.accountNumber || acc.id;

          this.accountMap.set(String(accountId), acc);

        });

      },

      error: (err: any) => console.error('Error loading accounts', err)

    });

  }
 
  loadHistory(): void {

    this.historyLoading = true;

    // decide which API endpoint to call based on the presence of a status filter

    const source$ = this.statusFilter

      ? this.transactionService.getTransactionsByStatus(this.statusFilter)

      : this.transactionService.getAllTransactions();
 
    source$.subscribe({

      next: (data: any) => {

        // apply additional client-side filters just in case

        let list = data || [];

        if (this.statusFilter) {

          list = list.filter((t: any) => String(t.status).toUpperCase() === this.statusFilter);

        }

        if (this.typeFilter) {

          list = list.filter((t: any) => String(t.type).toUpperCase() === this.typeFilter);

        }

        // ensure comment property exists (backend may supply it)

        list = list.map((x: any) => ({

          ...x,

          comment: x.comment || ''

        }));

        this.transactions = list.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        this.historyLoading = false;

      },

      error: (err: any) => {

        console.error('Error loading history', err);

        this.historyLoading = false;

      }

    });

  }
 
  // Approve a pending transaction (uses the same ApprovalService as manager view)

  approveTransaction(tx: any) {

    if (!tx || !tx.id) return;
 
    // Enforce officer approval limit

    const amount = Number(tx.amount || 0);

    if (amount > this.OFFICER_APPROVAL_LIMIT) {

      this.showNotice('This transaction exceeds your approval limit. Please escalate to a manager.');

      return;

    }
 
    if (!confirm('Approve this transaction?')) return;
 
    this.processingId = tx.id;
 
    this.approvalService.submitDecision(tx.id, { status: 'COMPLETED', reason: 'Approved by Officer' }).subscribe({

      next: () => {

        // optimistic update: remove item

        this.transactions = this.transactions.filter(t => t.id !== tx.id);

        this.processingId = null;

        this.showNotice('Transaction approved');

      },

      error: (err: any) => {

        console.error('Approval failed', err);

        this.showNotice('Failed to approve transaction');

        this.processingId = null;

      }

    });

  }
 
  escalateToManager(tx: any) {

    if (!tx || !tx.id) return;

    // Navigate manager approvals and include the escalated transaction id as a hint

    this.router.navigate(['/app/manager/approvals'], { queryParams: { escalatedId: tx.id, from: 'officer' } });

    this.showNotice('Escalation sent to manager. Redirecting...');

  }
 
  setupPollingIfNeeded() {

    // Poll every 10 seconds when any filter is applied so changes (including comments)

    // from the backend are reflected in near-real-time. Previously we only polled

    // for PENDING/COMPLETED; now APPROVED and others are included.

    if (this.pollIntervalId) {

      clearInterval(this.pollIntervalId);

      this.pollIntervalId = null;

    }

    if (this.statusFilter) {

      this.pollIntervalId = setInterval(() => this.loadHistory(), 10000);

    }

  }
 
  ngOnDestroy(): void {

    if (this.pollIntervalId) {

      clearInterval(this.pollIntervalId);

      this.pollIntervalId = null;

    }

  }
 
  validateAccount(accountId: string, fieldType: 'from' | 'to'): void {

    if (!accountId) {

      if (fieldType === 'from') this.fromAccountError = '';

      else this.toAccountError = '';

      return;

    }
 
    const account = this.accountMap.get(String(accountId));

    if (account) {

      const msg = `✓ Found: ${account.customerName} - Balance: ₹${account.balance}`;

      if (fieldType === 'from') this.fromAccountError = msg;

      else this.toAccountError = msg;

    } else {

      const msg = '✗ Account not found';

      if (fieldType === 'from') this.fromAccountError = msg;

      else this.toAccountError = msg;

    }

  }
 
  onInitiate(): void {

    // Parse amount as a number to avoid string comparison issues

    const amount = Number(this.transactionData.amount);

    // 1. Validate essential fields are not empty

    if (!this.transactionData.fromAccountId) {

      this.showNotice('Please select a source account');

      return;

    }
 
    if (!amount || amount <= 0) {

      this.showNotice('Please enter a valid amount greater than 0');

      return;

    }
 
    if (!this.accountMap.has(String(this.transactionData.fromAccountId))) {

      this.showNotice('Invalid source account ID');

      return;

    }
 
    // 2. For Transfer only: require destination account

    if (this.transactionData.type === 'Transfer' && !this.transactionData.toAccountId) {

      this.showNotice('Please specify destination account for transfer');

      return;

    }
 
    // 3. Build the Payload - match backend field names exactly

    const finalToAccountId = this.transactionData.type === 'Transfer' 

      ? this.transactionData.toAccountId 

      : this.transactionData.fromAccountId;
 
    const payload = {

      Type: this.transactionData.type,

      Amount: amount,

      AccountID: this.transactionData.fromAccountId,

      ToAccountID: finalToAccountId

    };
 
    console.log('Sending Payload:', payload);
 
    this.isLoading = true;

    // disable polling while we're submitting to avoid confusion when results

    // arrive via poll before our request completes

    const previousPoll = this.pollIntervalId;

    if (previousPoll) {

      clearInterval(previousPoll);

      this.pollIntervalId = null;

    }
 
    this.transactionService.initiateTransaction(payload).pipe(

      finalize(() => {

        console.log('⏹️ finalize called, turning off isLoading');

        this.isLoading = false;

        // restore polling if it was active before

        if (previousPoll) {

          this.setupPollingIfNeeded();

        }

      })

    ).subscribe({

      next: (res: any) => {

        console.log('✅ Transaction SUCCESS - Response:', res);

        this.showNotice('Transaction Successful!');

        this.showInitiateForm = false;

        this.resetForm();

        // Wait a small amount for backend to persist, then refresh the history immediately

        // This ensures the newly created transaction shows up on first load

        setTimeout(() => {

          console.log('Refreshing history after successful transaction...');

          this.loadHistory();

        }, 200);

        // make sure loading flag is cleared even if finalize somehow didn't run

        this.isLoading = false;

      },

      error: (err: any) => {

        console.error('❌ Transaction ERROR:', err);

        const errorMsg = err?.error?.error || err?.error?.message || err?.message || 'Database error occurred';

        this.showNotice(`Transaction Failed: ${errorMsg}`);

        this.isLoading = false;

      }

    });

  }
 
  resetForm(): void {

    this.transactionData = { 

      type: 'Deposit', 

      fromAccountId: '', 

      toAccountId: '', 

      amount: 0 

    };

    this.fromAccountError = '';

    this.toAccountError = '';

  }

}

 