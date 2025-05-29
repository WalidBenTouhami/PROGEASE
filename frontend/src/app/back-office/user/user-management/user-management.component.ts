import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  standalone: true,
  imports: [CommonModule,RouterModule],
  styleUrls: ['./user-management.component.css'],
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  paginatedUsers: User[] = [];

  pageSize = 5;
  currentPage = 1;
  totalPages = 1;

  constructor(private userService: UserService, private _router: Router) {}

  ngOnInit(): void {
this.userService.getUsers().subscribe({
  next: (users: User[]) => {
    this.users = users;
    console.log('Utilisateurs chargés:', this.users);
    this.totalPages = Math.ceil(this.users.length / this.pageSize);
    this.updatePagination();
  },
  error: (err) => {
    console.error('Erreur lors du chargement des utilisateurs:', err);
  }
});
  }

  updatePagination(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedUsers = this.users.slice(start, end);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagination();
  }

  viewUser(user: User): void {
    this._router.navigate(['/back-office/utilisateurs', user._id]);
  }

  editUser(user: User): void {
    this._router.navigate(['/back-office/utilisateurs', user._id, 'edit']);
  }

deleteUser(user: User): void {
  if (user._id) {
    this.userService.deleteUser(user._id).subscribe({
      next: () => {
        this.users = this.users.filter(u => u._id !== user._id);
        this.totalPages = Math.ceil(this.users.length / this.pageSize);
        this.updatePagination();
      },
      error: (err) => {
        console.error('Erreur lors de la suppression de l’utilisateur:', err);
      }
    });
  }
}

}
