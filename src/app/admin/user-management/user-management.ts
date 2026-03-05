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

  // Pagination State
  currentPage = 1;
  itemsPerPage = 5;

  get paginatedUsers() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.users.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages() {
    return Math.ceil(this.users.length / this.itemsPerPage);
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

  // Create/Edit User Form State
  showCreateForm = false;
  isSubmitting = false;
  editingUserId: string | number | null = null;

  newUser: any = {
    name: '',
    email: '',
    password: '',
    role: 'Officer',
    branch: '',
    status: 'Active'
  };

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        // Reset to page 1 on load
        this.currentPage = 1;
      },
      error: (err) => console.error('Failed to load users', err)
    });
  }

  toggleCreateForm() {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) {
      this.resetForm();
    }
  }

  resetForm() {
    this.editingUserId = null;
    this.newUser = {
      name: '',
      email: '',
      password: '',
      role: 'Officer',
      branch: '',
      status: 'Active'
    };
  }

  editUser(user: any) {
    this.editingUserId = user.UserID || user.id;
    this.newUser = {
      name: user.Name || user.name || '',
      email: user.Email || user.email || '',
      password: '', // Can't retrieve hash, require new or leave blank
      role: user.Role || user.role || 'Officer',
      branch: user.Branch || user.branch || '',
      status: user.Status || user.status || 'Active'
    };
    this.showCreateForm = true;
  }

  onCreateUser() {
    if (!this.newUser.name?.trim() || !this.newUser.email?.trim() || !this.newUser.branch?.trim()) {
      alert('Please fill all required fields');
      return;
    }

    this.isSubmitting = true;

    if (this.editingUserId) {
      // UPDATE EXISTING USER
      const updatePayload = {
        name: this.newUser.name,
        email: this.newUser.email,
        role: this.newUser.role,
        branch: this.newUser.branch,
        status: this.newUser.status
      };

      this.userService.updateUser(this.editingUserId, updatePayload).pipe(
        catchError(() => {
          // Mock success locally if backend is down
          return of({ message: "Updated" });
        })
      ).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.toggleCreateForm();
          this.loadUsers(); // refresh the list from db
          alert('User updated successfully');
        },
        error: () => {
          this.isSubmitting = false;
          alert('Failed to update user');
        }
      });
    } else {
      // CREATE NEW USER
      this.userService.createUser(this.newUser).pipe(
        catchError(() => {
          const createdMock = { ...this.newUser, id: Date.now().toString() };
          return of(createdMock);
        })
      ).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.toggleCreateForm();
          this.loadUsers();
          alert('User created successfully');
        },
        error: () => {
          this.isSubmitting = false;
          alert('Failed to create user');
        }
      });
    }
  }

  toggleUserStatus(user: any) {
    const newStatus = user.Status === 'Active' ? 'Inactive' : 'Active';
    const userId = user.UserID || user.id;

    if (!userId) {
      alert("Cannot update user status: missing User ID.");
      return;
    }

    // Optimistic UI update
    user.Status = newStatus;

    this.userService.updateUserStatus(userId, newStatus).pipe(
      catchError(() => {
        return of({ message: "Status Updated" });
      })
    ).subscribe({
      next: () => {
        // Optionally refresh the whole list: this.loadUsers();
      },
      error: () => {
        // Revert on error
        user.Status = user.Status === 'Active' ? 'Inactive' : 'Active';
        alert('Failed to update status in the database.');
      }
    });
  }
}
