import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-utilisateur-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule
  ],
  template: `
    <div class="form-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>{{ isEditMode ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur' }}</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="utilisateurForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline">
              <mat-label>Nom</mat-label>
              <input matInput formControlName="nom" required>
              <mat-error *ngIf="utilisateurForm.get('nom')?.hasError('required')">
                Le nom est requis
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Prénom</mat-label>
              <input matInput formControlName="prenom" required>
              <mat-error *ngIf="utilisateurForm.get('prenom')?.hasError('required')">
                Le prénom est requis
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" type="email" required>
              <mat-error *ngIf="utilisateurForm.get('email')?.hasError('required')">
                L'email est requis
              </mat-error>
              <mat-error *ngIf="utilisateurForm.get('email')?.hasError('email')">
                Format d'email invalide
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" *ngIf="!isEditMode">
              <mat-label>Mot de passe</mat-label>
              <input matInput formControlName="motDePasse" type="password" required>
              <mat-error *ngIf="utilisateurForm.get('motDePasse')?.hasError('required')">
                Le mot de passe est requis
              </mat-error>
              <mat-error *ngIf="utilisateurForm.get('motDePasse')?.hasError('minlength')">
                Le mot de passe doit contenir au moins 8 caractères
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Rôles</mat-label>
              <mat-select formControlName="roles" multiple required>
                <mat-option value="ADMIN">Administrateur</mat-option>
                <mat-option value="USER">Utilisateur</mat-option>
              </mat-select>
              <mat-error *ngIf="utilisateurForm.get('roles')?.hasError('required')">
                Au moins un rôle est requis
              </mat-error>
            </mat-form-field>

            <div class="form-actions">
              <button mat-button type="button" (click)="annuler()">Annuler</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="utilisateurForm.invalid">
                {{ isEditMode ? 'Mettre à jour' : 'Créer' }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .form-container {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 1rem;
    }
  `]
})
export class UtilisateurFormComponent implements OnInit {
  utilisateurForm: FormGroup;
  isEditMode = false;
  utilisateurId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.utilisateurForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      motDePasse: ['', [Validators.required, Validators.minLength(8)]],
      roles: [[], Validators.required]
    });
  }

  ngOnInit(): void {
    this.utilisateurId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.utilisateurId;

    if (this.isEditMode) {
      // Ne pas exiger le mot de passe en mode édition
      this.utilisateurForm.get('motDePasse')?.clearValidators();
      this.utilisateurForm.get('motDePasse')?.updateValueAndValidity();
      
      // TODO: Charger les données de l'utilisateur
      this.chargerUtilisateur();
    }
  }

  private chargerUtilisateur(): void {
    // TODO: Implémenter le chargement des données de l'utilisateur
  }

  onSubmit(): void {
    if (this.utilisateurForm.valid) {
      const utilisateur = this.utilisateurForm.value;
      if (this.isEditMode) {
        // TODO: Mettre à jour l'utilisateur
        console.log('Mise à jour de l\'utilisateur:', utilisateur);
      } else {
        // TODO: Créer l'utilisateur
        console.log('Création de l\'utilisateur:', utilisateur);
      }
      this.router.navigate(['/utilisateurs']);
    }
  }

  annuler(): void {
    this.router.navigate(['/utilisateurs']);
  }
} 