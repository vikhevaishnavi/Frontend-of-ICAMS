import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { MainLayout } from './layout/main-layout/main-layout';
import { AuthGuard } from './core/guards/auth-guard';

export const routes: Routes = [
    { path: '', component: LoginComponent },
    {
        path: 'app',
        component: MainLayout,
        canActivate: [AuthGuard],
        children: [
            { path: 'admin', loadComponent: () => import('./admin/dashboard/dashboard').then(m => m.Dashboard) },
            { path: 'admin/users', loadComponent: () => import('./admin/user-management/user-management').then(m => m.UserManagement) },
            { path: 'admin/analytics', loadComponent: () => import('./shared/analytics/analytics').then(m => m.Analytics) },

            { path: 'officer', loadComponent: () => import('./officer/dashboard/dashboard').then(m => m.Dashboard) },
            { path: 'officer/accounts', loadComponent: () => import('./officer/account-management/account-management').then(m => m.AccountManagement) },
            { path: 'officer/transactions', loadComponent: () => import('./officer/transaction-management/transaction-management').then(m => m.TransactionManagement) },

            { path: 'manager', loadComponent: () => import('./manager/dashboard/dashboard').then(m => m.Dashboard) },
            { path: 'manager/approvals', loadComponent: () => import('./manager/approvals/approvals').then(m => m.Approvals) },
            { path: 'manager/accounts', loadComponent: () => import('./manager/accounts-view/accounts-view').then(m => m.AccountsView) },
            { path: 'manager/transactions', loadComponent: () => import('./manager/transactions-view/transactions-view').then(m => m.TransactionsView) },
            { path: 'manager/analytics', loadComponent: () => import('./shared/analytics/analytics').then(m => m.Analytics) },
        ]
    },
    { path: '**', redirectTo: '' }
];

