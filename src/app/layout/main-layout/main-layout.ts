import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { AuthService, User } from '../../core/services/auth';
import { LucideAngularModule, LayoutDashboard, Settings, UserCircle, LogOut, ChevronRight, Menu, Wallet, ArrowRightLeft, ClipboardCheck, BarChartBig } from 'lucide-angular';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './main-layout.html',
  styleUrls: ['./main-layout.css'],
})
export class MainLayout implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);

  currentUser: User | null = null;

  // Expose icons directly to the template
  readonly LayoutDashboard = LayoutDashboard;
  readonly Settings = Settings;
  readonly UserCircle = UserCircle;
  readonly LogOut = LogOut;
  readonly ChevronRight = ChevronRight;
  readonly Menu = Menu;
  readonly Wallet = Wallet;
  readonly ArrowRightLeft = ArrowRightLeft;
  readonly ClipboardCheck = ClipboardCheck;
  readonly BarChartBig = BarChartBig;

  sidebarOpen = true;

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;

      // If we are on a page refresh, AuthGuard blindly sends logged in users to /app/admin
      // Catch that here and put them on their actual dashboard
      if (user && this.router.url === '/app/admin' && user.role !== 'Admin') {
        this.router.navigate([`/app/${user.role.toLowerCase()}`]);
      }
    });
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/'])
    });
  }
}
