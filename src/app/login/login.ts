import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  authService = inject(AuthService);
  router = inject(Router);

  credentials = {
    email: '',
    password: ''
  };

  error = '';
  isLoading = false;

  onSubmit() {
    if (!this.credentials.email || !this.credentials.password) {
      this.error = 'Please enter both Email and Password.';
      return;
    }

    this.isLoading = true;
    this.error = '';

    this.authService.login(this.credentials).subscribe({
      next: () => {
        // Redirection is handled by the guard checking role, but we can also manually navigate
        const user = this.authService.currentUserValue;
        if (user) {
          this.router.navigate([`/app/${user.role.toLowerCase()}`]);
        } else {
          this.router.navigate(['/app']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.error = 'Invalid Email or Password. Please try again.';
      }
    });
  }
}
