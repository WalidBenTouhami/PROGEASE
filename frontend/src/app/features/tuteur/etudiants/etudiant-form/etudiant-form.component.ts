import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-etudiant-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    RouterModule
  ],
  template: `
    <div class="form-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>{{ isEditMode ? 'Modifier l\'étudiant' : 'Nouvel étudiant' }}</mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="etudiantForm" (ngSubmit)="onSubmit()">
            <!-- Nom -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nom</mat-label>
              <input matInput formControlName="nom" required>
              <mat-error *ngIf="etudiantForm.get('nom')?.hasError('required')">
                Le nom est requis
              </mat-error>
            </mat-form-field>

            <!-- Prénom -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Prénom</mat-label>
              <input matInput formControlName="prenom" required>
              <mat-error *ngIf="etudiantForm.get('prenom')?.hasError('required')">
                Le prénom est requis
              </mat-error>
            </mat-form-field>

            <!-- Email -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" type="email" required>
              <mat-error *ngIf="etudiantForm.get('email')?.hasError('required')">
                L'email est requis
              </mat-error>
              <mat-error *ngIf="etudiantForm.get('email')?.hasError('email')">
                Format d'email invalide
              </mat-error>
            </mat-form-field>

            <!-- Statut -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Statut</mat-label>
              <mat-select formControlName="statut" required>
                <mat-option value="ACTIF">Actif</mat-option>
                <mat-option value="INACTIF">Inactif</mat-option>
              </mat-select>
              <mat-error *ngIf="etudiantForm.get('statut')?.hasError('required')">
                Le statut est requis
              </mat-error>
            </mat-form-field>

            <!-- Actions -->
            <div class="actions">
              <button mat-button type="button" (click)="annuler()">
                <mat-icon>close</mat-icon>
                Annuler
              </button>
              <button mat-raised-button color="primary" type="submit" [disabled]="etudiantForm.invalid">
                <mat-icon>save</mat-icon>
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
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      margin-top: 24px;
    }
  `]
})
export class EtudiantFormComponent implements OnInit {
  etudiantForm: FormGroup;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.etudiantForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      statut: ['ACTIF', Validators.required]
    });
  }

  ngOnInit(): void {
    const etudiantId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!etudiantId;

    if (this.isEditMode) {
      this.chargerEtudiant(Number(etudiantId));
    }
  }

  private chargerEtudiant(id: number): void {
    // TODO: Charger les données de l'étudiant depuis le service
    const etudiant = {
      nom: 'Dupont',
      prenom: 'Jean',
      email: 'jean.dupont@example.com',
      statut: 'ACTIF'
    };
    this.etudiantForm.patchValue(etudiant);
  }

  onSubmit(): void {
    if (this.etudiantForm.valid) {
      // TODO: Sauvegarder les données de l'étudiant
      console.log('Données du formulaire:', this.etudiantForm.value);
      this.router.navigate(['/tuteur/etudiants']);
    }
  }

  annuler(): void {
    this.router.navigate(['/tuteur/etudiants']);
  }
} 