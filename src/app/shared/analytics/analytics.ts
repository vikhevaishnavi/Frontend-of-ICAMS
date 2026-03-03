import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountService } from '../../core/services/account';
import { TransactionService, Transaction } from '../../core/services/transaction';
import { forkJoin, catchError, of } from 'rxjs';
import { LucideAngularModule, Download, Users, Wallet, ArrowRightLeft, TrendingUp } from 'lucide-angular';
import { BaseChartDirective } from 'ng2-charts';

// Requires file-saver to actually download the generated Blob from xlsx
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, BaseChartDirective],
  templateUrl: './analytics.html',
  styleUrls: ['./analytics.css']
})
export class Analytics implements OnInit {
  private accountService = inject(AccountService);
  private transactionService = inject(TransactionService);

  readonly Download = Download;
  readonly Users = Users;
  readonly Wallet = Wallet;
  readonly ArrowRightLeft = ArrowRightLeft;
  readonly TrendingUp = TrendingUp;

  // Stats
  totalAccounts = 0;
  totalBalance = 0;
  totalTxnCount = 0;
  totalTxnValue = 0;

  // Raw Data for Export
  rawAccounts: any[] = [];
  rawTransactions: Transaction[] = [];

  // Chart Properties
  lineChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } }
  };
  lineChartData: any = { labels: [], datasets: [] };

  barChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } }
  };
  barChartData: any = { labels: [], datasets: [] };

  isExporting = false;

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    forkJoin({
      accounts: this.accountService.getAllAccounts().pipe(catchError(() => of(this.getMockAccounts()))),
      transactions: this.transactionService.getAllTransactions().pipe(catchError(() => of(this.getMockTransactions())))
    }).subscribe(({ accounts, transactions }) => {
      this.rawAccounts = accounts;
      this.rawTransactions = transactions;

      this.calculateStats(accounts, transactions);
      this.generateGrowthChart(accounts);
      this.generateBranchPerformanceChart(accounts);
    });
  }

  calculateStats(accounts: any[], transactions: Transaction[]) {
    this.totalAccounts = accounts.length;
    this.totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
    this.totalTxnCount = transactions.length;
    this.totalTxnValue = transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
  }

  generateGrowthChart(accounts: any[]) {
    // Mock mapping Account growth over last 6 months
    const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
    const data = [120, 165, 210, 240, 295, this.totalAccounts]; // Using actual count for current month

    this.lineChartData = {
      labels: months,
      datasets: [
        {
          label: 'Total Accounts',
          data: data,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    };
  }

  generateBranchPerformanceChart(accounts: any[]) {
    // Generate mock performance data
    this.barChartData = {
      labels: ['Main Branch', 'Northside', 'Downtown', 'West End'],
      datasets: [
        {
          label: 'Total Deposits (₹ Millions)',
          data: [45, 28, 62, 19],
          backgroundColor: '#3b82f6'
        },
        {
          label: 'Total Loans (₹ Millions)',
          data: [20, 35, 15, 40],
          backgroundColor: '#e2e8f0'
        }
      ]
    };
  }

  exportDataToExcel() {
    this.isExporting = true;
    try {
      // 1. Create a new workbook
      const wb: XLSX.WorkBook = XLSX.utils.book_new();

      // 2. Convert Data to Worksheets
      // Mapping to refine column names
      const accountExportData = this.rawAccounts.map(a => ({
        'Account Number': a.accountNumber,
        'Customer Name': a.customerName || a.userId,
        'Type': a.type,
        'Current Balance (INR)': a.balance,
        'Status': a.status,
        'Date Created': new Date(a.createdAt).toLocaleDateString()
      }));

      const txnExportData = this.rawTransactions.map(t => ({
        'Transaction ID': t.id,
        'Account Rel': t.accountId,
        'Type': t.type,
        'Amount (INR)': t.amount,
        'Status': t.status,
        'Timestamp': new Date(t.timestamp).toLocaleString(),
        'Description': t.description
      }));

      const wsAccounts: XLSX.WorkSheet = XLSX.utils.json_to_sheet(accountExportData);
      const wsTxns: XLSX.WorkSheet = XLSX.utils.json_to_sheet(txnExportData);

      // 3. Append Worksheets to Workbook
      XLSX.utils.book_append_sheet(wb, wsAccounts, 'Accounts');
      XLSX.utils.book_append_sheet(wb, wsTxns, 'Transactions');

      // 4. Write Excel file and trigger download
      const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, 'Bank_Ledger_Export');
    } catch (e) {
      console.error('Export failed', e);
      alert('Failed to generate export file.');
    } finally {
      this.isExporting = false;
    }
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const EXCEL_EXTENSION = '.xlsx';
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });

    // Generates a file like Bank_Ledger_Export_2026-03-02_14-30-00.xlsx
    const dateStr = new Date().toISOString().replace(/:/g, '-').replace('T', '_').split('.')[0];
    FileSaver.saveAs(data, `${fileName}_${dateStr}${EXCEL_EXTENSION}`);
  }

  private getMockAccounts() {
    return [
      { id: '1', accountNumber: 'ACC01', type: 'Savings', balance: 154000, status: 'Active', userId: 'CUST-001', createdAt: '2026-01-10T10:00:00Z', customerName: 'Alice Smith' },
      { id: '2', accountNumber: 'ACC02', type: 'Current', balance: 3450000, status: 'Active', userId: 'CUST-002', createdAt: '2026-02-15T11:30:00Z', customerName: 'Bob Jones' },
      { id: '3', accountNumber: 'ACC03', type: 'Fixed Deposit', balance: 5000000, status: 'Active', userId: 'CUST-003', createdAt: '2026-03-01T09:00:00Z', customerName: 'Charlie Brown' }
    ];
  }

  private getMockTransactions() {
    return [
      { id: '1', accountId: 'ACC01', amount: 50000, type: 'DEPOSIT', status: 'COMPLETED', timestamp: '2026-02-15T10:00:00Z', description: 'Initial deposit' },
      { id: '2', accountId: 'ACC02', amount: 120000, type: 'WITHDRAWAL', status: 'COMPLETED', timestamp: '2026-03-01T14:30:00Z', description: 'Large cash withdrawal' },
      { id: '3', accountId: 'ACC01', amount: 3000, type: 'TRANSFER', status: 'COMPLETED', timestamp: '2026-03-02T09:15:00Z', description: 'Transfer to external account' },
    ] as Transaction[];
  }
}
