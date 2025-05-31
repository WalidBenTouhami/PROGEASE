import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EvaluationService, Evaluation } from '../../../core/services/evaluation.service';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';

@Component({
  selector: 'app-evaluation-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, LoaderComponent],
  template: `
    <div class="min-h-screen bg-gray-50/50">
      <div class="max-w-[800px] mx-auto px-4 py-8">
        <app-loader *ngIf="loading"></app-loader>

        <div *ngIf="!loading && evaluation" class="space-y-8">
          <div class="flex justify-between items-center">
            <h1 class="text-2xl font-semibold text-gray-900">Modifier l'évaluation</h1>
            <div class="flex items-center gap-4">
              <button (click)="cancel()" 
                      class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                Annuler
              </button>
              <button (click)="save()" 
                      class="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                Enregistrer
              </button>
            </div>
          </div>

          <div class="bg-white rounded-xl border border-gray-200 p-6">
            <!-- Project Info -->
            <div class="mb-8">
              <h2 class="text-lg font-medium text-gray-900 mb-2">{{ evaluation.project.title }}</h2>
              <p class="text-sm text-gray-500">
                Évalué par {{ evaluation.evaluator.nom }} {{ evaluation.evaluator.prenom }}
              </p>
            </div>

            <!-- Score Section -->
            <div class="mb-8">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Score global
              </label>
              <div class="flex items-center gap-2">
                <input type="number" 
                       [(ngModel)]="evaluation.score"
                       min="0" 
                       max="20" 
                       class="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                       [class.border-red-300]="evaluation.score < 0 || evaluation.score > 20">
                <span class="text-sm text-gray-500">/20</span>
              </div>
            </div>

            <!-- Criteria List -->
            <div class="mb-8">
              <h3 class="text-sm font-medium text-gray-700 mb-4">Critères d'évaluation</h3>
              <div class="space-y-4">
                <div *ngFor="let criterion of evaluation.criteria; let i = index" 
                     class="flex items-center gap-4">
                  <div class="flex-1">
                    <label [for]="'criterion-' + i" class="block text-xs font-medium text-gray-600 mb-1">
                      {{ criterion.name }}
                    </label>
                    <div class="flex items-center gap-2">
                      <input type="number"
                             [id]="'criterion-' + i"
                             [(ngModel)]="criterion.score"
                             min="0"
                             max="20"
                             class="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                             [class.border-red-300]="criterion.score < 0 || criterion.score > 20">
                      <span class="text-sm text-gray-500">/20</span>
                      <span class="text-xs text-gray-500 ml-2">
                        Coefficient: {{ criterion.weight | percent }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Comments -->
            <div>
              <label for="comments" class="block text-sm font-medium text-gray-700 mb-2">
                Commentaires
              </label>
              <textarea id="comments"
                        [(ngModel)]="evaluation.comments"
                        rows="4"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        placeholder="Ajoutez vos commentaires ici..."></textarea>
            </div>
          </div>
        </div>

        <!-- Error State -->
        <div *ngIf="error" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-sm text-red-600">{{ error }}</p>
        </div>
      </div>
    </div>
  `
})
export class EvaluationEditComponent implements OnInit {
  evaluation: Evaluation | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private evaluationService: EvaluationService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'ID de l\'évaluation manquant';
      this.loading = false;
      return;
    }

    this.evaluationService.getEvaluation(id).subscribe({
      next: (evaluation) => {
        this.evaluation = evaluation;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading evaluation:', error);
        this.error = 'Impossible de charger l\'évaluation';
        this.loading = false;
      }
    });
  }

  save() {
    if (!this.evaluation) return;

    // Validate scores
    if (this.evaluation.score < 0 || this.evaluation.score > 20) {
      this.error = 'Le score global doit être entre 0 et 20';
      return;
    }

    for (const criterion of this.evaluation.criteria) {
      if (criterion.score < 0 || criterion.score > 20) {
        this.error = 'Les scores des critères doivent être entre 0 et 20';
        return;
      }
    }

    this.loading = true;
    this.error = null;

    this.evaluationService.updateEvaluation(this.evaluation.id, {
      score: this.evaluation.score,
      comments: this.evaluation.comments,
      criteria: this.evaluation.criteria
    }).subscribe({
      next: () => {
        this.router.navigate(['/evaluations']);
      },
      error: (error) => {
        console.error('Error updating evaluation:', error);
        this.error = 'Impossible de mettre à jour l\'évaluation';
        this.loading = false;
      }
    });
  }

  cancel() {
    this.router.navigate(['/evaluations']);
  }
} 