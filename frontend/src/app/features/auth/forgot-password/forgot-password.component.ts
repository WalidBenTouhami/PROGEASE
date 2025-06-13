import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-forgot-password',
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
    <div class="forgot-password-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Mot de passe oublié</mat-card-title>
          <mat-card-subtitle>
            Entrez votre adresse email pour recevoir un lien de réinitialisation
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="forgotPasswordForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" type="email" placeholder="exemple@email.com">
              <mat-error *ngIf="forgotPasswordForm.get('email')?.hasError('required')">
                L'email est requis
              </mat-error>
              <mat-error *ngIf="forgotPasswordForm.get('email')?.hasError('email')">
                Format d'email invalide
              </mat-error>
            </mat-form-field>

            <div class="form-actions">
              <button mat-raised-button color="primary" type="submit" [disabled]="forgotPasswordForm.invalid || isLoading">
                <mat-icon>send</mat-icon>
                Envoyer le lien
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
    .forgot-password-container {
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
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      this.isLoading = true;
      const { email } = this.forgotPasswordForm.value;

      // TODO: Implémenter l'appel au service de réinitialisation de mot de passe
      setTimeout(() => {
        this.isLoading = false;
        this.snackBar.open(
          'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation',
          'Fermer',
          { duration: 5000 }
        );
        this.router.navigate(['/auth/login']);
      }, 1500);
    }
  }
} 