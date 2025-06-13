import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule
  ],
  template: `
    <div class="reset-password-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Réinitialisation du mot de passe</mat-card-title>
          <mat-card-subtitle>
            Veuillez entrer votre nouveau mot de passe
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="resetPasswordForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline">
              <mat-label>Nouveau mot de passe</mat-label>
              <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password">
              <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
                <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
              <mat-error *ngIf="resetPasswordForm.get('password')?.hasError('required')">
                Le mot de passe est requis
              </mat-error>
              <mat-error *ngIf="resetPasswordForm.get('password')?.hasError('minlength')">
                Le mot de passe doit contenir au moins 8 caractères
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Confirmer le mot de passe</mat-label>
              <input matInput [type]="hideConfirmPassword ? 'password' : 'text'" formControlName="confirmPassword">
              <button mat-icon-button matSuffix (click)="hideConfirmPassword = !hideConfirmPassword" type="button">
                <mat-icon>{{hideConfirmPassword ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
              <mat-error *ngIf="resetPasswordForm.get('confirmPassword')?.hasError('required')">
                La confirmation du mot de passe est requise
              </mat-error>
              <mat-error *ngIf="resetPasswordForm.get('confirmPassword')?.hasError('passwordMismatch')">
                Les mots de passe ne correspondent pas
              </mat-error>
            </mat-form-field>

            <div class="form-actions">
              <button mat-raised-button color="primary" type="submit" [disabled]="resetPasswordForm.invalid || isLoading">
                <mat-icon>lock_reset</mat-icon>
                Réinitialiser le mot de passe
              </button>
            </div>
          </form>
        </mat-card-content>

        <mat-card-footer>
          <mat-progress-bar mode="indeterminate" *ngIf="isLoading"></mat-progress-bar>
          <div class="login-link">
            <a routerLink="/auth/login">Retour à la connexion</a>
          </div>
        </mat-card-footer>
      </mat-card>
    </div>
  `,
  styles: [`
    .reset-password-container {
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #f5f5f5;
      padding: 20px;
    }

    mat-card {
      width: 100%;
      max-width: 400px;
      margin: 20px;
    }

    mat-card-header {
      margin-bottom: 20px;
    }

    mat-card-subtitle {
      margin-top: 8px;
      color: #666;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 8px;
    }

    mat-card-footer {
      padding: 16px;
      text-align: center;
    }

    .login-link {
      margin-top: 16px;
    }

    .login-link a {
      color: #1976d2;
      text-decoration: none;
    }

    .login-link a:hover {
      text-decoration: underline;
    }
  `]
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  isLoading = false;
  hidePassword = true;
  hideConfirmPassword = true;
  token: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.resetPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParams['token'];
    if (!this.token) {
      this.snackBar.open('Token de réinitialisation invalide', 'Fermer', { duration: 5000 });
      this.router.navigate(['/auth/login']);
    }
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    }
  }

  onSubmit(): void {
    if (this.resetPasswordForm.valid) {
      this.isLoading = true;
      const { password } = this.resetPasswordForm.value;

      // TODO: Implémenter l'appel au service de réinitialisation de mot de passe
      setTimeout(() => {
        this.isLoading = false;
        this.snackBar.open('Mot de passe réinitialisé avec succès', 'Fermer', { duration: 5000 });
        this.router.navigate(['/auth/login']);
      }, 1500);
    }
  }
} 