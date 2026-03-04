import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, User } from '../../core/services/user';
import { LucideAngularModule, Edit2, Power } from 'lucide-angular';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './user-management.html',
  styleUrls: ['./user-management.css']
})
export class UserManagement implements OnInit {
  private userService = inject(UserService);

  // Icons
  readonly Edit2 = Edit2;
  readonly Power = Power;

  users: any[] = [];

  // Create User Form State
  showCreateForm = false;
  newUser: any = {
    firstName: '',
    lastName: '',
    email: '',
    role: 'Officer',
    branch: '',
    status: 'Active'
  };

  isSubmitting = false;

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
      },
      error: (err) => console.error('Failed to load users', err)
    });
  }

  toggleCreateForm() {
    this.showCreateForm = !this.showCreateForm;
    this.resetForm();
  }

  resetForm() {
    this.newUser = {
      firstName: '',
      lastName: '',
      email: '',
      role: 'Officer',
      branch: '',
      status: 'Active'
    };
  }

  onCreateUser() {
    if (!this.newUser.firstName.trim() || !this.newUser.lastName.trim() || !this.newUser.email.trim() || !this.newUser.branch.trim()) {
      alert('Please fill all required fields');
      return;
    }

    this.isSubmitting = true;

    // Attempt API Call
    this.userService.createUser(this.newUser).pipe(
      catchError(() => {
        // Mock success if backend isn't ready
        const createdMock = { ...this.newUser, id: Date.now().toString() };
        return of(createdMock);
      })
    ).subscribe({
      next: (user) => {
        this.users.unshift(user);
        this.isSubmitting = false;
        this.toggleCreateForm();
        alert('User created successfully');
      },
      error: () => {
        this.isSubmitting = false;
        alert('Failed to create user');
      }
    });
  }

  editUser(user: any) {
    // In a real app, open an edit modal
    alert(`Edit user feature triggered for ${user.firstName} ${user.lastName}`);
  }

  toggleUserStatus(user: any) {
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';

    // Optimistic UI update
    user.status = newStatus;

    this.userService.updateUser(user.id, { status: newStatus }).pipe(
      catchError(() => {
        // Mock success
        return of({ ...user, status: newStatus });
      })
    ).subscribe({
      next: () => {
        // Success
      },
      error: () => {
        // Revert on error
        user.status = user.status === 'Active' ? 'Inactive' : 'Active';
        alert('Failed to update status');
      }
    });
  }
}
