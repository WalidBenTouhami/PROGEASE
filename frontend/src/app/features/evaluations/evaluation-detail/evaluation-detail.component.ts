import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { EvaluationService, Evaluation } from '../../../core/services/evaluation.service';

@Component({
  selector: 'app-evaluation-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mx-auto p-4">
      <div *ngIf="loading" class="flex justify-center items-center min-h-[400px]">
        <div class="loader"></div>
      </div>

      <div class="bg-white rounded-lg shadow-lg p-6" *ngIf="!loading && evaluation">
        <h1 class="text-2xl font-bold mb-4">Détails de l'évaluation</h1>
        
        <div class="mb-6">
          <h2 class="text-xl font-semibold mb-2">Projet: {{ evaluation.project.title }}</h2>
          <p class="text-gray-600">
            Évaluateur: {{ evaluation.evaluator.nom }} {{ evaluation.evaluator.prenom }}
          </p>
        </div>

        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-2">Score Global</h3>
          <div class="text-3xl font-bold text-blue-600">
            {{ evaluation.score }}/20
          </div>
        </div>

        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-2">Critères d'évaluation</h3>
          <div class="space-y-4">
            <div *ngFor="let criterion of evaluation.criteria" class="border-b pb-4">
              <div class="flex justify-between items-center">
                <span class="font-medium">{{ criterion.name }}</span>
                <span class="text-lg font-semibold">{{ criterion.score }}/20</span>
              </div>
              <div class="text-sm text-gray-600">
                Pondération: {{ criterion.weight * 100 }}%
              </div>
            </div>
          </div>
        </div>

        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-2">Commentaires</h3>
          <p class="text-gray-700 whitespace-pre-line">{{ evaluation.comments }}</p>
        </div>

        <div *ngIf="evaluation.aiRecommendations" class="mb-6">
          <h3 class="text-lg font-semibold mb-2">Recommandations IA</h3>
          <p class="text-gray-700 whitespace-pre-line">{{ evaluation.aiRecommendations }}</p>
        </div>

        <div class="text-sm text-gray-500">
          Date d'évaluation: {{ evaluation.createdAt | date:'longDate':'':'fr' }}
        </div>
      </div>

      <div *ngIf="!loading && !evaluation && !error" class="text-center py-8">
        <p class="text-gray-600">Aucune évaluation trouvée.</p>
      </div>

      <div *ngIf="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <p class="font-bold">Erreur</p>
        <p class="text-sm">{{ error }}</p>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .container {
      max-width: 800px;
    }
    .loader {
      width: 48px;
      height: 48px;
      border: 5px solid #f3f3f3;
      border-radius: 50%;
      border-top: 5px solid #2196f3;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class EvaluationDetailComponent implements OnInit {
  evaluation: Evaluation | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private evaluationService: EvaluationService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id && id !== 'new') {  // Only fetch if we have an ID and it's not 'new'
        this.loading = true;
        this.error = null;
        this.evaluationService.getEvaluation(id).subscribe({
          next: (evaluation) => {
            this.evaluation = evaluation;
            this.loading = false;
          },
          error: (error) => {
            console.error('Erreur lors du chargement de l\'évaluation:', error);
            this.error = 'Une erreur est survenue lors du chargement de l\'évaluation.';
            this.loading = false;
          }
        });
      }
    });
  }
} 