import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { ErrorService } from '../../services/error.service';

@Component({
  selector: 'app-parametres',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatDividerModule
  ],
  template: `
    <div class="parametres-container">
      <h1>Paramètres</h1>

      <mat-card>
        <mat-card-header>
          <mat-card-title>Préférences générales</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="settingsForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline">
              <mat-label>Langue</mat-label>
              <mat-select formControlName="language">
                <mat-option value="fr">Français</mat-option>
                <mat-option value="en">English</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Fuseau horaire</mat-label>
              <mat-select formControlName="timezone">
                <mat-option value="Europe/Paris">Europe/Paris</mat-option>
                <mat-option value="UTC">UTC</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-slide-toggle formControlName="notifications">
              Activer les notifications
            </mat-slide-toggle>

            <mat-slide-toggle formControlName="darkMode">
              Mode sombre
            </mat-slide-toggle>

            <mat-divider class="divider"></mat-divider>

            <div class="form-actions">
              <button mat-button type="button" (click)="resetForm()">
                Réinitialiser
              </button>
              <button mat-raised-button color="primary" type="submit" [disabled]="settingsForm.invalid">
                Enregistrer
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .parametres-container {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }

    h1 {
      margin-bottom: 2rem;
      color: #333;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    mat-form-field {
      width: 100%;
    }

    .divider {
      margin: 2rem 0;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
    }

    mat-slide-toggle {
      margin: 1rem 0;
    }
  `]
})
export class ParametresComponent implements OnInit {
  settingsForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private errorService: ErrorService
  ) {
    this.settingsForm = this.formBuilder.group({
      language: ['fr', Validators.required],
      timezone: ['Europe/Paris', Validators.required],
      notifications: [true],
      darkMode: [false]
    });
  }

  ngOnInit(): void {
    // Charger les paramètres existants
    this.loadSettings();
  }

  loadSettings(): void {
    // TODO: Charger les paramètres depuis le service
    const defaultSettings = {
      language: 'fr',
      timezone: 'Europe/Paris',
      notifications: true,
      darkMode: false
    };
    this.settingsForm.patchValue(defaultSettings);
  }

  onSubmit(): void {
    if (this.settingsForm.valid) {
      // TODO: Sauvegarder les paramètres
      this.errorService.handleError(new Error('Fonctionnalité non implémentée'));
    }
  }

  resetForm(): void {
    this.settingsForm.reset();
    this.loadSettings();
  }
} 