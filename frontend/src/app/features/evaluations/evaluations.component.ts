import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { EvaluationService } from '../../core/services/evaluation.service';
import { Evaluation } from '../../core/models/evaluation.model';

@Component({
  selector: 'app-evaluations',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatProgressBarModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-4">Évaluations</h1>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (evaluation of evaluations; track evaluation.id) {
          <mat-card class="mb-4">
            <mat-card-header>
              <mat-card-title>{{ evaluation.project?.title }}</mat-card-title>
              <mat-card-subtitle>
                Évaluateur: {{ evaluation.evaluator?.nom }} {{ evaluation.evaluator?.prenom }}
              </mat-card-subtitle>
            </mat-card-header>
            
            <mat-card-content class="mt-4">
              <div class="flex items-center space-x-2 mb-4">
                <mat-progress-bar
                  mode="determinate"
                  [value]="(evaluation.score / 20) * 100"
                  class="flex-grow"
                ></mat-progress-bar>
                <span class="text-xl font-bold">{{ evaluation.score }}/20</span>
              </div>

              <p class="text-gray-600 mb-2">
                {{ evaluation.comments | slice:0:100 }}...
              </p>

              <p class="text-sm text-gray-500">
                Évalué le {{ evaluation.createdAt | date:'shortDate':'':'fr' }}
              </p>
            </mat-card-content>

            <mat-card-actions align="end">
              <a [routerLink]="['/evaluations', evaluation.id]" mat-button color="primary">
                <mat-icon class="mr-1">visibility</mat-icon>
                Voir les détails
              </a>
            </mat-card-actions>
          </mat-card>
        } @empty {
          <div class="col-span-full text-center py-8">
            <mat-icon class="text-6xl text-gray-400">assessment</mat-icon>
            <p class="text-xl text-gray-500 mt-4">Aucune évaluation disponible</p>
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
  `]
})
export class EvaluationsComponent implements OnInit {
  evaluations: Evaluation[] = [];

  constructor(private evaluationService: EvaluationService) {}

  ngOnInit() {
    this.evaluationService.getEvaluations("ALL").subscribe({
      next: (evaluations) => {
        this.evaluations = evaluations;
      },
      error: (error) => {
        console.error('Error fetching evaluations:', error);
      }
    });
  }
} 