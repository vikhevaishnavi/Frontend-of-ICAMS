import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { AccountService, Account } from '../../core/services/account';
import { TransactionService, Transaction } from '../../core/services/transaction';
import { 
  LucideAngularModule, 
  Users, 
  IndianRupee, 
  Activity, 
  CheckCircle, 
  Edit2,   // <--- Add this
  Power    // <--- Add this
} from 'lucide-angular';
// ADD forkJoin TO THIS IMPORT
import { forkJoin, of } from 'rxjs'; 
import { catchError } from 'rxjs/operators';
import { UserService } from '../../core/services/user';
import { FormsModule } from '@angular/forms'; // Required for newUser binding

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, LucideAngularModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {
  
  private accountService = inject(AccountService);
  private transactionService = inject(TransactionService);
  private userService = inject(UserService);

  // Icons
  readonly Users = Users;
  readonly IndianRupee = IndianRupee;
  readonly Activity = Activity;
  readonly CheckCircle = CheckCircle;
  readonly Edit2 = Edit2;
  readonly Power = Power;

  // Stats
  totalUsers = 0;
  totalAccounts = 0;
  totalBalance = 0;
  totalTransactions = 0;
  pendingApprovals = 0;


  users: any[] = [];
  isSubmitting = false;
  showCreateForm = false;

  newUser = {
    name: '',
    email: '',
    password :'' ,
    role: 'Officer',
    branch: '',
    status: 'Active'
  };

  // Pie Chart (Account Type Distribution)
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { position: 'right' }
    }
  };
  public pieChartData: ChartData<'pie', number[], string | string[]> = {
    labels: ['Savings', 'Current', 'Fixed Deposit', 'Loan'],
    datasets: [{ data: [0, 0, 0, 0] }]
  };
  public pieChartType: ChartType = 'pie';

  // Line Chart (Monthly Transaction Trends)
  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    elements: {
      line: { tension: 0.4 } // smooth curves
    }
  };

  public lineChartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [],
        label: 'Transaction Volume (₹)',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        fill: 'origin',
      }
    ],
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  };
  public lineChartType: ChartType = 'line';

  ngOnInit() {
    this.loadDashboardData();
  }

 loadDashboardData() {
    forkJoin({
        accounts: this.accountService.getAllAccounts().pipe(catchError(() => of([]))),
        transactions: this.transactionService.getAllTransactions().pipe(catchError(() => of([]))),
        users: this.userService.getUsers().pipe(catchError(() => of([])))
    }).subscribe({
        next: (res: any) => {
            const accounts: Account[] = res.accounts || [];
            const transactions: Transaction[] = res.transactions || [];
            const users: any[] = res.users || [];

            // 1. Update Stats Cards
            this.totalAccounts = accounts.length;
            this.totalUsers = users.length;
            this.totalTransactions = transactions.length;

            // Mapping balances
            this.totalBalance = accounts.reduce((sum: number, acc: any) => 
                sum + (acc.balance || acc.Balance || 0), 0);

            // FIX: Checking for both 'status' and 'Status' for Pending Approvals
            this.pendingApprovals = accounts.filter((a: any) => 
    (a.status === 'Pending' || a.Status === 'Pending')
).length;

            // 2. Update Pie Chart
            const types = ['Savings', 'Current', 'Fixed Deposit', 'Loan'];
            const counts = types.map((t: string) => 
                accounts.filter((a: any) => (a.type === t || a.AccountType === t)).length
            );

            this.pieChartData = {
                labels: types,
                datasets: [{ 
                    data: counts, 
                    backgroundColor: ['#3b82f6', '#a855f7', '#ec4899', '#f59e0b'] 
                }]
            };

            this.processMonthlyTrends(transactions);
        },
        error: (err: any) => console.error("Dashboard Load Failed", err)
    });
}

  processMonthlyTrends(transactions: Transaction[]) {
  const currentYear = new Date().getFullYear();
  const monthlyVolumes = new Array(12).fill(0);

  transactions.forEach(txn => {
    // FALLBACK: Check for both 'timestamp' and 'TransactionDate' if mapping failed
    const rawDate = txn.timestamp || (txn as any).TransactionDate || (txn as any).transactionDate;
    const amount = txn.amount || (txn as any).Amount || 0;
    
    if (rawDate) {
      const date = new Date(rawDate);
      if (date.getFullYear() === currentYear) {
        monthlyVolumes[date.getMonth()] += amount;
      }
    }
  });

  this.lineChartData = {
      ...this.lineChartData,
      datasets: [{ ...this.lineChartData.datasets[0], data: monthlyVolumes }]
    };
}

  // Inside your UserManagement class

toggleCreateForm() {
  this.showCreateForm = !this.showCreateForm;
}

loadUsers() {
  this.userService.getUsers().subscribe({
    next: (data) => {
      this.users = data;
      this.totalUsers = data.length;
    },
    error: (err) => console.error('Failed to refresh users', err)
  });
}


onCreateUser() {
  // DEBUG: Check what the component actually sees before validating
  console.log('Current newUser data:', this.newUser);

  // 2. STRICT VALIDATION: Only check for the fields present in your form
  // We remove any hidden checks for 'firstName' or 'lastName'
  const isValid = 
    this.newUser.name.trim() !== '' && 
    this.newUser.email.trim() !== '' && 
    this.newUser.password.trim() !== '' && 
    this.newUser.branch.trim() !== '' &&
    this.newUser.role !== '';

  if (!isValid) {
    alert("Please fill all required fields");
    return;
  }

  this.isSubmitting = true;
  this.userService.createUser(this.newUser).subscribe({
    next: (res) => {
      alert("User created successfully!");
      this.loadUsers(); 
      this.toggleCreateForm();
      this.isSubmitting = false;
      // Reset form
      this.newUser = { name: '', email: '', password: '', role: 'Officer', branch: '', status: 'Active' };
    },
    error: (err) => {
      console.error('Backend Error:', err);
      this.isSubmitting = false;
      alert(err.error?.message || "Backend rejected the request. Check console.");
    }
  });
}

toggleUserStatus(user: any) {
  // Use the ID from your database (usually UserID or id)
  const userId = user.UserID || user.id;
  const newStatus = user.Status === 'Active' ? 'Inactive' : 'Active';

  this.userService.updateUserStatus(userId, newStatus).subscribe({
    next: () => {
      alert(`User status updated to ${newStatus}`);
      this.loadUsers(); // Refresh the list
    },
    error: (err) => alert("Failed to update status")
  });
}

}