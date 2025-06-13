import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

interface Etudiant {
  id: number;
  nom: string;
  prenom: string;
  email: string;
}

@Component({
  selector: 'app-projet-form',
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
    MatDatepickerModule,
    MatNativeDateModule,
    RouterModule
  ],
  template: `
    <div class="form-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>{{ isEditMode ? 'Modifier le projet' : 'Nouveau projet' }}</mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="projetForm" (ngSubmit)="onSubmit()">
            <!-- Étudiant -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Étudiant</mat-label>
              <mat-select formControlName="etudiantId" required>
                <mat-option *ngFor="let etudiant of etudiants" [value]="etudiant.id">
                  {{ etudiant.prenom }} {{ etudiant.nom }}
                </mat-option>
              </mat-select>
              <mat-error *ngIf="projetForm.get('etudiantId')?.hasError('required')">
                L'étudiant est requis
              </mat-error>
            </mat-form-field>

            <!-- Nom du projet -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nom du projet</mat-label>
              <input matInput formControlName="nom" required>
              <mat-error *ngIf="projetForm.get('nom')?.hasError('required')">
                Le nom du projet est requis
              </mat-error>
            </mat-form-field>

            <!-- Description -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="4" required></textarea>
              <mat-error *ngIf="projetForm.get('description')?.hasError('required')">
                La description est requise
              </mat-error>
            </mat-form-field>

            <!-- Statut -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Statut</mat-label>
              <mat-select formControlName="statut" required>
                <mat-option value="EN_ATTENTE">En attente</mat-option>
                <mat-option value="EN_COURS">En cours</mat-option>
                <mat-option value="TERMINE">Terminé</mat-option>
              </mat-select>
              <mat-error *ngIf="projetForm.get('statut')?.hasError('required')">
                Le statut est requis
              </mat-error>
            </mat-form-field>

            <!-- Progression -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Progression (%)</mat-label>
              <input matInput type="number" formControlName="progression" min="0" max="100" required>
              <mat-error *ngIf="projetForm.get('progression')?.hasError('required')">
                La progression est requise
              </mat-error>
              <mat-error *ngIf="projetForm.get('progression')?.hasError('min') || projetForm.get('progression')?.hasError('max')">
                La progression doit être comprise entre 0 et 100
              </mat-error>
            </mat-form-field>

            <!-- Date de début -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Date de début</mat-label>
              <input matInput [matDatepicker]="debutPicker" formControlName="dateDebut" required>
              <mat-datepicker-toggle matSuffix [for]="debutPicker"></mat-datepicker-toggle>
              <mat-datepicker #debutPicker></mat-datepicker>
              <mat-error *ngIf="projetForm.get('dateDebut')?.hasError('required')">
                La date de début est requise
              </mat-error>
            </mat-form-field>

            <!-- Date de fin prévue -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Date de fin prévue</mat-label>
              <input matInput [matDatepicker]="finPicker" formControlName="dateFinPrevue" required>
              <mat-datepicker-toggle matSuffix [for]="finPicker"></mat-datepicker-toggle>
              <mat-datepicker #finPicker></mat-datepicker>
              <mat-error *ngIf="projetForm.get('dateFinPrevue')?.hasError('required')">
                La date de fin prévue est requise
              </mat-error>
            </mat-form-field>

            <!-- Actions -->
            <div class="actions">
              <button mat-button type="button" (click)="annuler()">
                <mat-icon>close</mat-icon>
                Annuler
              </button>
              <button mat-raised-button color="primary" type="submit" [disabled]="projetForm.invalid">
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
export class ProjetFormComponent implements OnInit {
  projetForm: FormGroup;
  isEditMode = false;
  etudiants: Etudiant[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.projetForm = this.fb.group({
      etudiantId: ['', Validators.required],
      nom: ['', Validators.required],
      description: ['', Validators.required],
      statut: ['EN_ATTENTE', Validators.required],
      progression: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      dateDebut: [null, Validators.required],
      dateFinPrevue: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    const projetId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!projetId;

    if (this.isEditMode) {
      this.chargerProjet(Number(projetId));
    }

    this.chargerEtudiants();
  }

  private chargerProjet(id: number): void {
    // TODO: Charger les données du projet depuis le service
    const projet = {
      etudiantId: 1,
      nom: 'Projet de fin d\'études',
      description: 'Développement d\'une application web',
      statut: 'EN_COURS',
      progression: 65,
      dateDebut: new Date('2024-01-15'),
      dateFinPrevue: new Date('2024-06-30')
    };
    this.projetForm.patchValue(projet);
  }

  private chargerEtudiants(): void {
    // TODO: Charger la liste des étudiants depuis le service
    this.etudiants = [
      {
        id: 1,
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean.dupont@example.com'
      },
      {
        id: 2,
        nom: 'Martin',
        prenom: 'Sophie',
        email: 'sophie.martin@example.com'
      }
    ];
  }

  onSubmit(): void {
    if (this.projetForm.valid) {
      // TODO: Sauvegarder les données du projet
      console.log('Données du formulaire:', this.projetForm.value);
      this.router.navigate(['/tuteur/projets']);
    }
  }

  annuler(): void {
    this.router.navigate(['/tuteur/projets']);
  }
} 