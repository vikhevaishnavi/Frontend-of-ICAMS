 
 
 
import { Component, OnInit } from '@angular/core';

import { FormsModule } from '@angular/forms';

import { CommonModule } from '@angular/common';

import { AccountService } from '../../core/services/account';
 
@Component({

  selector: 'app-account-management',

  templateUrl: './account-management.html',

  styleUrls: ['./account-management.css'],

  standalone: true,

  imports: [FormsModule, CommonModule]

})

export class AccountManagementComponent implements OnInit {

  accounts: any[] = [];

  showCreateForm = false;

  isLoading = false;

  editingId: string | null = null;

  isEmbedded = false; // Set to true when embedded in dashboard

  newAccount: any = {

    customerName: '',

    customerId: '',

    accountType: 'Savings',

    branch: '',

    initialDeposit: 0,

    status: 'Active'

  };
 
  constructor(private accountService: AccountService) {}
 
  ngOnInit(): void {

    // Automatically fetches data from DB when you open this section

    this.loadAccounts();

  }
 
  loadAccounts(): void {

    this.isLoading = true;

    this.accountService.getAllAccounts().subscribe({

      next: (data: any[]) => {

        console.log('=== Accounts loaded in component ===');

        console.log('Number of accounts:', data?.length);

        if (data && data.length > 0) {

          console.log('First account accountNumber:', data[0].accountNumber);

          console.log('All accountNumbers:', data.map(a => a.accountNumber));

        }

        this.accounts = data && Array.isArray(data) ? data : [];

        this.isLoading = false;

      },

      error: (err: any) => {

        console.error('Error fetching accounts', err);

        this.accounts = [];

        this.isLoading = false;

      }

    });

  }
 
  onSubmitAccount(): void {

    if (!this.newAccount.customerName || !this.newAccount.customerId) {

      alert('Please fill in all required fields');

      return;

    }
 
    // If editing, call update

    if (this.editingId) {

      this.accountService.updateAccount(this.editingId, this.newAccount).subscribe({

        next: (res: any) => {

          console.log('Account updated:', res);

          alert('Account updated successfully');

          this.showCreateForm = false;

          this.editingId = null;

          setTimeout(() => this.loadAccounts(), 300);

          this.newAccount = { customerName: '', customerId: '', accountType: 'Savings', branch: '', initialDeposit: 0, status: 'Active' };

        },

        error: (err: any) => {

          console.error('Error updating account:', err);

          alert('Error updating account: ' + (err?.error?.message || 'Unknown error'));

        }

      });

      return;

    }
 
    // Map client form fields to backend expectation. Backend expects a 'Balance' or

    // similar field name, not 'initialDeposit'. Provide a payload that uses common

    // backend keys so the created account shows the correct initial balance.

    const payload = {

      CustomerName: this.newAccount.customerName,

      CustomerID: this.newAccount.customerId,

      AccountType: this.newAccount.accountType,

      Branch: this.newAccount.branch,

      Balance: Number(this.newAccount.initialDeposit) || 0,

      Status: this.newAccount.status

    };
 
    this.accountService.createAccount(payload).subscribe({

      next: (res: any) => {

        console.log('Account created:', res);

        alert('Account Created Successfully!');

        this.showCreateForm = false;

        // Immediately show a temporary account in the list with the provided initial balance

        // so the user sees the expected result while the server-verified list is reloaded.

        const nowIso = new Date().toISOString();

        const tempAcc = {

          id: res?.id || payload.CustomerID || String(Date.now()),

          accountNumber: res?.accountNumber || payload.CustomerID || String(Date.now()),

          customerName: payload.CustomerName,

          type: payload.AccountType || 'Savings',

          balance: payload.Balance || 0,

          status: payload.Status || 'Active',

          createdAt: res?.createdAt || nowIso,

          branch: payload.Branch || ''

        };

        this.accounts = [tempAcc, ...this.accounts];
 
        // Refresh the list shortly after creation so mapping logic runs and server data is authoritative

        setTimeout(() => this.loadAccounts(), 500);

        this.newAccount = { customerName: '', customerId: '', accountType: 'Savings', branch: '', initialDeposit: 0, status: 'Active' };

      },

      error: (err: any) => {

        console.error('Error creating account:', err);

        alert('Error creating account: ' + (err?.error?.message || 'Unknown error'));

      }

    });

  }
 
  deleteAccount(accountId: string) {

    if (!confirm('Are you sure you want to delete this account?')) return;

    this.accountService.deleteAccount(accountId).subscribe({

      next: () => {

        alert('Account deleted');

        setTimeout(() => this.loadAccounts(), 300);

      },

      error: (err: any) => {

        console.error('Delete failed', err);

        alert('Failed to delete account');

      }

    });

  }
 
  editAccount(acc: any) {

    this.editingId = acc.id || acc.accountNumber || null;

    this.showCreateForm = true;

    this.newAccount = {

      customerName: acc.customerName || '',

      customerId: acc.userId || acc.customerId || '',

      accountType: acc.type || 'Savings',

      branch: acc.branch || '',

      initialDeposit: acc.balance || 0,

      status: acc.status || 'Active'

    };

  }

}
 
 