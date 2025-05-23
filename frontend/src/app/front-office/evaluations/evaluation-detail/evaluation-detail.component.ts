import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EvaluationService, Evaluation } from '../../../core/services/evaluation.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-evaluation-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="evaluation-detail">
      @if (evaluation) {
        <h2>{{ evaluation.project.title }}</h2>
        <div class="evaluation-info">
          <p class="evaluator">
            Évaluateur: {{ evaluation.evaluator.nom }} {{ evaluation.evaluator.prenom }}
          </p>
          <p class="score">Score global: {{ evaluation.score }}/20</p>
          <p class="date">Date: {{ evaluation.createdAt | date:'dd/MM/yyyy' }}</p>
        </div>

        <div class="criteria-section">
          <h3>Critères d'évaluation</h3>
          <div class="criteria-list">
            @for (criterion of evaluation.criteria; track criterion.name) {
              <div class="criterion">
                <span class="criterion-name">{{ criterion.name }}</span>
                <span class="criterion-score">{{ criterion.score }}/20</span>
                <span class="criterion-weight">(Coefficient: {{ criterion.weight }})</span>
              </div>
            }
          </div>
        </div>

        @if (evaluation.comments) {
          <div class="comments-section">
            <h3>Commentaires</h3>
            <p>{{ evaluation.comments }}</p>
          </div>
        }

        @if (evaluation.aiRecommendations) {
          <div class="ai-recommendations">
            <h3>Recommandations IA</h3>
            <p>{{ evaluation.aiRecommendations }}</p>
          </div>
        }
      } @else {
        <p>Chargement de l'évaluation...</p>
      }
    </div>
  `,
  styles: [`
    .evaluation-detail {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }
    h2 {
      color: #333;
      margin-bottom: 20px;
    }
    .evaluation-info {
      background-color: #f5f5f5;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .evaluation-info p {
      margin: 5px 0;
    }
    .criteria-section {
      margin: 20px 0;
    }
    .criteria-list {
      display: grid;
      gap: 10px;
    }
    .criterion {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px;
      background-color: #fff;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .criterion-name {
      font-weight: 500;
    }
    .criterion-score {
      color: #2196f3;
      font-weight: bold;
    }
    .criterion-weight {
      color: #666;
      font-size: 0.9em;
    }
    .comments-section, .ai-recommendations {
      margin-top: 20px;
      padding: 15px;
      background-color: #fff;
      border: 1px solid #ddd;
      border-radius: 8px;
    }
    h3 {
      color: #444;
      margin-bottom: 10px;
    }
  `]
})
export class EvaluationDetailComponent implements OnInit {
  evaluation: Evaluation | null = null;

  constructor(
    private route: ActivatedRoute,
    private evaluationService: EvaluationService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadEvaluation(id);
      }
    });
  }

  private loadEvaluation(id: string): void {
    this.evaluationService.getEvaluation(id).subscribe({
      next: (data) => {
        this.evaluation = data;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de l\'évaluation:', error);
      }
    });
  }
} 