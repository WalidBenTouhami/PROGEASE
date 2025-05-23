import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { EvaluationService, Evaluation } from '../../core/services/evaluation.service';
import { ApolloError } from '@apollo/client/core';

@Component({
  selector: 'app-evaluations',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="evaluations-container">
      <h2>Évaluations</h2>
      <div class="evaluations-list">
        @for (evaluation of evaluations; track evaluation.id) {
          <div class="evaluation-card" (click)="viewEvaluation(evaluation.id)">
            <h3>{{ evaluation.project.title }}</h3>
            <p>Évaluateur: {{ evaluation.evaluator.nom }} {{ evaluation.evaluator.prenom }}</p>
            <p>Score: {{ evaluation.score }}/20</p>
            <p>Date: {{ evaluation.createdAt | date:'dd/MM/yyyy' }}</p>
          </div>
        } @empty {
          <p>Aucune évaluation trouvée.</p>
        }
      </div>
    </div>
  `,
  styles: [`
    .evaluations-container {
      padding: 20px;
    }
    .evaluations-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    .evaluation-card {
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
      cursor: pointer;
      transition: transform 0.2s;
    }
    .evaluation-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    h3 {
      margin: 0 0 10px 0;
      color: #333;
    }
    p {
      margin: 5px 0;
      color: #666;
    }
  `]
})
export class EvaluationsComponent implements OnInit {
  evaluations: Evaluation[] = [];

  constructor(
    private evaluationService: EvaluationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEvaluations();
  }

  loadEvaluations(): void {
    this.evaluationService.getEvaluations("ALL").subscribe({
      next: (data) => {
        this.evaluations = data;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des évaluations:', error);
      }
    });
  }

  viewEvaluation(id: string): void {
    this.router.navigate(['/evaluations', id]);
  }
} 