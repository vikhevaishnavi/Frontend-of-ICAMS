import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const isAuthenticated = this.authService.isAuthenticated();

    if (isAuthenticated) {
      if (state.url === '/') {
        // Temporarily redirect to admin. MainLayout checks user role on init.
        this.router.navigate(['/app/admin']);
        return false;
      }
      return true;
    }

    if (state.url !== '/' && !state.url.startsWith('/login')) {
      this.router.navigate(['/']);
      return false;
    }

    return true;
  }
}
