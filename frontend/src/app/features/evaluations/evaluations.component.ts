import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EvaluationService } from '../../core/services/evaluation.service';
import { Evaluation } from '../../core/models/evaluation.model';

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

@Component({
  selector: 'app-evaluations',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatProgressBarModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  template: `
    <div class="container mx-auto p-4">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Évaluations</h1>
        <button mat-raised-button color="primary" [routerLink]="['/evaluations/new']">
          <mat-icon>add</mat-icon>
          Nouvelle Évaluation
        </button>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (evaluation of evaluations; track evaluation.id) {
          <mat-card class="evaluation-card">
            <mat-card-header>
              <mat-card-title class="mb-2">{{ evaluation.projet?.titre }}</mat-card-title>
              <mat-card-subtitle>
                Évaluateur: {{ evaluation.evaluateur?.nom }} {{ evaluation.evaluateur?.prenom }}
              </mat-card-subtitle>
            </mat-card-header>
            
            <mat-card-content class="mt-4">
              <div class="score-container mb-4">
                <div class="flex justify-between items-center mb-2">
                  <span class="text-lg font-semibold">Note</span>
                  <span class="text-2xl font-bold" [ngClass]="{
                    'text-green-600': evaluation.note >= 14,
                    'text-yellow-600': evaluation.note >= 10 && evaluation.note < 14,
                    'text-red-600': evaluation.note < 10
                  }">
                    {{ evaluation.note }}/20
                  </span>
                </div>
                <mat-progress-bar
                  mode="determinate"
                  [value]="(evaluation.note / 20) * 100"
                  [color]="evaluation.note >= 14 ? 'primary' : evaluation.note >= 10 ? 'accent' : 'warn'"
                ></mat-progress-bar>
              </div>

              <p class="text-gray-600 mb-4 line-clamp-2">
                {{ evaluation.commentaire || 'Aucun commentaire' }}
              </p>

              <div class="text-sm text-gray-500">
                Évalué le {{ evaluation.dateEvaluation | date:'longDate':'':'fr' }}
              </div>
            </mat-card-content>

            <mat-card-actions class="flex justify-end gap-2 p-4">
              <button mat-icon-button color="primary" [routerLink]="['/evaluations', evaluation.id]" matTooltip="Voir les détails">
                <mat-icon>visibility</mat-icon>
              </button>
              <button mat-icon-button color="accent" [routerLink]="['/evaluations', evaluation.id, 'edit']" matTooltip="Modifier">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="deleteEvaluation(evaluation)" matTooltip="Supprimer">
                <mat-icon>delete</mat-icon>
              </button>
            </mat-card-actions>
          </mat-card>
        } @empty {
          <div class="col-span-full text-center py-12">
            <mat-icon class="text-6xl text-gray-400 mb-4">assessment</mat-icon>
            <p class="text-xl text-gray-500">Aucune évaluation disponible</p>
            <button mat-raised-button color="primary" class="mt-4" [routerLink]="['/evaluations/new']">
              Créer une évaluation
            </button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .container {
      max-width: 1200px;
    }
    .evaluation-card {
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    mat-card-content {
      flex-grow: 1;
    }
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class EvaluationsComponent implements OnInit {
  evaluations: Evaluation[] = [];

  constructor(
    private evaluationService: EvaluationService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadEvaluations();
  }

  loadEvaluations() {
    this.evaluationService.getEvaluations().subscribe({
      next: (response: ApiResponse<Evaluation[]>) => {
        this.evaluations = response.data;
      },
      error: (error) => {
        console.error('Error fetching evaluations:', error);
        this.snackBar.open('Erreur lors du chargement des évaluations', 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  deleteEvaluation(evaluation: Evaluation) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'évaluation du projet "${evaluation.projet?.titre}" ?`)) {
      this.evaluationService.deleteEvaluation(evaluation.id!).subscribe({
        next: (response: ApiResponse<string>) => {
          if (response.success) {
            this.evaluations = this.evaluations.filter(e => e.id !== response.data);
            this.snackBar.open('Évaluation supprimée avec succès', 'Fermer', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
          } else {
            this.snackBar.open('Erreur lors de la suppression de l\'évaluation', 'Fermer', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        },
        error: (error) => {
          console.error('Error deleting evaluation:', error);
          this.snackBar.open('Erreur lors de la suppression de l\'évaluation', 'Fermer', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }
} 