import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

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
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <div class="form-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>{{ isEditMode ? 'Modifier le projet' : 'Nouveau projet' }}</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="projetForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline">
              <mat-label>Nom du projet</mat-label>
              <input matInput formControlName="nom" required>
              <mat-error *ngIf="projetForm.get('nom')?.hasError('required')">
                Le nom du projet est requis
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="4"></textarea>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Statut</mat-label>
              <mat-select formControlName="statut" required>
                <mat-option value="EN_COURS">En cours</mat-option>
                <mat-option value="TERMINE">Terminé</mat-option>
                <mat-option value="EN_ATTENTE">En attente</mat-option>
              </mat-select>
              <mat-error *ngIf="projetForm.get('statut')?.hasError('required')">
                Le statut est requis
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Date de début</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="dateDebut">
              <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Date de fin prévue</mat-label>
              <input matInput [matDatepicker]="pickerFin" formControlName="dateFinPrevue">
              <mat-datepicker-toggle matSuffix [for]="pickerFin"></mat-datepicker-toggle>
              <mat-datepicker #pickerFin></mat-datepicker>
            </mat-form-field>

            <div class="form-actions">
              <button mat-button type="button" (click)="annuler()">Annuler</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="projetForm.invalid">
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
export class ProjetFormComponent implements OnInit {
  projetForm: FormGroup;
  isEditMode = false;
  projetId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.projetForm = this.fb.group({
      nom: ['', Validators.required],
      description: [''],
      statut: ['EN_COURS', Validators.required],
      dateDebut: [new Date()],
      dateFinPrevue: [null]
    });
  }

  ngOnInit(): void {
    this.projetId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.projetId;

    if (this.isEditMode) {
      // TODO: Charger les données du projet
      this.chargerProjet();
    }
  }

  private chargerProjet(): void {
    // TODO: Implémenter le chargement des données du projet
  }

  onSubmit(): void {
    if (this.projetForm.valid) {
      const projet = this.projetForm.value;
      if (this.isEditMode) {
        // TODO: Mettre à jour le projet
        console.log('Mise à jour du projet:', projet);
      } else {
        // TODO: Créer le projet
        console.log('Création du projet:', projet);
      }
      this.router.navigate(['/projets']);
    }
  }

  annuler(): void {
    this.router.navigate(['/projets']);
  }
} 