import { Component } from '@angular/core';
import { User } from '../../../core/models/user.model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [RouterModule,CommonModule, ReactiveFormsModule],
  templateUrl: './user-edit.component.html',
  styleUrl: './user-edit.component.css'
})
export class UserEditComponent {
  userForm!: FormGroup;
  userId!: string;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id')!;
    this.userService.getUserById(this.userId).subscribe({
      next: user => {
        this.userForm = this.fb.group({
          nom: [user.name, Validators.required],
          email: [user.email, [Validators.required, Validators.email]],
          role: [user.role || 'student', Validators.required]
        });
      },
      error: err => {
        alert('Utilisateur introuvable.');
        this.router.navigate(['/backoffice/utilisateurs']);
      }
    });
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      const updatedUser: User = { ...this.userForm.value, _id: this.userId };
      this.userService.updateUser(updatedUser).subscribe({
        next: () => {
          this.router.navigate(['/back-office/utilisateurs']);
        },
        error: () => alert('Erreur lors de la mise à jour.')
      });
    }
  }
}
