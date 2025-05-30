import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EvaluationService, Evaluation } from '../../core/services/evaluation.service';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { Apollo } from 'apollo-angular';

@Component({
  selector: 'app-evaluations',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    LoaderComponent, 
    FormsModule, 
    ModalComponent
  ],
  providers: [EvaluationService],
  template: `
    <div class="min-h-screen bg-gray-50/50">
      <div class="max-w-[1400px] mx-auto px-4 py-8">
        <app-loader *ngIf="loading"></app-loader>

        <div *ngIf="!loading" class="space-y-8">
          <div class="flex justify-between items-center">
            <h1 class="text-2xl font-semibold text-gray-900">Évaluations</h1>
            <button class="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
              + Nouvelle Évaluation
            </button>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div *ngFor="let evaluation of evaluations" 
                 class="group bg-white rounded-xl border border-gray-200 transition-all duration-300 hover:border-gray-400">
              <div class="p-6 flex flex-col h-full">
                <!-- Header -->
                <div class="mb-6">
                  <div class="flex justify-between items-start gap-4 mb-2">
                    <h3 class="text-lg font-medium text-gray-900 hover:text-gray-700 transition-colors truncate">
                      {{ evaluation.project.title }}
                    </h3>
                    <div class="flex items-center gap-2">
                      <button (click)="openEditModal(evaluation)" 
                              class="text-gray-500 hover:text-gray-700 transition-colors">
                        <span class="sr-only">Modifier</span>
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button (click)="deleteEvaluation(evaluation)" 
                              class="text-gray-500 hover:text-red-600 transition-colors">
                        <span class="sr-only">Supprimer</span>
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div class="text-sm text-gray-500">
                    Évalué par <span class="font-medium text-gray-900">{{ evaluation.evaluator.nom }} {{ evaluation.evaluator.prenom }}</span>
                  </div>
                </div>

                <!-- Score Section -->
                <div class="mb-6">
                  <div class="flex items-center justify-between mb-4">
                    <div class="space-y-1">
                      <span class="text-xs text-gray-500">Score global</span>
                      <p class="text-2xl font-semibold text-gray-900">{{ evaluation.score }}<span class="text-base font-normal text-gray-500">/20</span></p>
                    </div>
                    <span [class]="getScoreLabelClass(evaluation.score)"
                          class="text-xs font-medium px-2.5 py-1 rounded-full bg-opacity-10">
                      {{ getScoreLabel(evaluation.score) }}
                    </span>
                  </div>
                </div>

                <!-- Criteria List -->
                <div class="space-y-3 mb-6">
                  <div *ngFor="let criterion of evaluation.criteria" 
                       class="space-y-2">
                    <div class="flex justify-between items-center">
                      <div class="min-w-0 flex-1">
                        <span class="text-xs font-medium text-gray-700 truncate">{{ criterion.name }}</span>
                      </div>
                      <div class="flex items-center gap-3 shrink-0">
                        <span class="text-xs text-gray-500">
                          {{ criterion.weight | percent }}
                        </span>
                        <span class="text-xs font-medium" 
                              [class]="getCriterionScoreClass(criterion.score)">
                          {{ criterion.score }}/20
                        </span>
                      </div>
                    </div>
                    <div class="h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div class="h-full rounded-full transition-all duration-300"
                           [class]="getProgressBarClass(criterion.score)"
                           [style.width.%]="(criterion.score / 20) * 100"></div>
                    </div>
                  </div>
                </div>

                <!-- Comments -->
                <div class="mb-6">
                  <span class="text-xs font-medium text-gray-700 block mb-2">Commentaires</span>
                  <p class="text-sm text-gray-600 line-clamp-2">
                    {{ evaluation.comments || 'Aucun commentaire' }}
                  </p>
                </div>

                <!-- Footer -->
                <div class="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                  <span class="text-xs text-gray-500">
                    {{ evaluation.updatedAt | date:'dd/MM/yyyy' }}
                  </span>
                  <a [routerLink]="['/evaluations', evaluation.id]" 
                     class="text-sm font-medium text-gray-900 hover:underline">
                    Voir détails
                  </a>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div *ngIf="evaluations.length === 0" 
                 class="col-span-full flex flex-col items-center justify-center py-12 bg-white rounded-xl border border-gray-200">
              <p class="text-base text-gray-600 mb-1">Aucune évaluation trouvée</p>
              <p class="text-sm text-gray-500">Commencez par créer une nouvelle évaluation</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <app-modal *ngIf="editingEvaluation"
               [title]="modalTitle"
               [size]="'large'"
               (close)="closeEditModal()">
      <div class="space-y-6">
        <!-- Project Info -->
        <div class="bg-white px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">{{ editingEvaluation.project.title }}</h2>
          <p class="text-sm text-gray-500 mt-1">
            Évalué par {{ editingEvaluation.evaluator.nom }} {{ editingEvaluation.evaluator.prenom }}
          </p>
        </div>

        <div class="px-6 py-4">
          <!-- Score Section -->
          <div class="mb-8">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Score global
            </label>
            <div class="flex items-center gap-2">
              <input type="number" 
                     [(ngModel)]="editingEvaluation.score"
                     min="0" 
                     max="20" 
                     class="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                     [class.border-red-300]="editingEvaluation.score < 0 || editingEvaluation.score > 20">
              <span class="text-sm text-gray-500">/20</span>
            </div>
          </div>

          <!-- Criteria List -->
          <div class="mb-8">
            <h3 class="text-sm font-medium text-gray-700 mb-4">Critères d'évaluation</h3>
            <div class="space-y-4">
              <div *ngFor="let criterion of editingEvaluation.criteria; let i = index" 
                   class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
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
                      [(ngModel)]="editingEvaluation.comments"
                      rows="4"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      placeholder="Ajoutez vos commentaires ici..."></textarea>
          </div>

          <!-- Error Message -->
          <div *ngIf="error" class="mt-4 rounded-lg bg-red-50 p-4">
            <p class="text-sm text-red-600">{{ error }}</p>
          </div>
        </div>

        <!-- Actions -->
        <div class="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div class="flex justify-end gap-4">
            <button (click)="closeEditModal()" 
                    class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
              Annuler
            </button>
            <button (click)="saveEdit()" 
                    class="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                    [disabled]="loading">
              {{ loading ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </div>
      </div>
    </app-modal>
  `,
  styles: [`
    :host {
      display: block;
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
  loading = true;
  error: string | null = null;
  editingEvaluation: Evaluation | null = null;
  modalTitle = "Modifier l'évaluation";

  constructor(
    private evaluationService: EvaluationService, 
    private apollo: Apollo,
    private router: Router
  ) {
    console.log('[EvaluationsComponent] Initialized');
  }

  ngOnInit() {
    console.log('[EvaluationsComponent] ngOnInit');
    this.loadEvaluations();
  }

  loadEvaluations() {
    console.log('[EvaluationsComponent] Loading evaluations...');
    this.loading = true;
    this.evaluationService.getEvaluations('ALL').subscribe({
      next: (evaluations) => {
        console.log('[EvaluationsComponent] Loaded evaluations:', evaluations);
        this.evaluations = evaluations;
        this.loading = false;
      },
      error: (error) => {
        console.error('[EvaluationsComponent] Error loading evaluations:', error);
        this.loading = false;
      }
    });
  }

  openEditModal(evaluation: Evaluation) {
    console.log('[EvaluationsComponent] Opening edit modal for evaluation:', evaluation);
    try {
      this.editingEvaluation = JSON.parse(JSON.stringify(evaluation));
      console.log('[EvaluationsComponent] Created deep copy for editing:', this.editingEvaluation);
      setTimeout(() => {}, 0);
    } catch (error) {
      console.error('[EvaluationsComponent] Error creating deep copy:', error);
      this.error = 'Error preparing evaluation for edit';
    }
  }

  closeEditModal() {
    console.log('[EvaluationsComponent] Closing edit modal');
    this.editingEvaluation = null;
    this.error = null;
  }

  saveEdit() {
    console.log('[EvaluationsComponent] Attempting to save edit');
    if (!this.editingEvaluation) {
      console.error('[EvaluationsComponent] No evaluation being edited');
      return;
    }

    // Validate scores
    if (this.editingEvaluation.score < 0 || this.editingEvaluation.score > 20) {
      console.warn('[EvaluationsComponent] Invalid global score:', this.editingEvaluation.score);
      this.error = 'Le score global doit être entre 0 et 20';
      return;
    }

    for (const criterion of this.editingEvaluation.criteria) {
      if (criterion.score < 0 || criterion.score > 20) {
        console.warn('[EvaluationsComponent] Invalid criterion score:', criterion);
        this.error = 'Les scores des critères doivent être entre 0 et 20';
        return;
      }
    }

    console.log('[EvaluationsComponent] Validation passed, saving changes...');
    this.loading = true;
    this.error = null;

    // Remove __typename from criteria before sending
    const cleanedCriteria = this.editingEvaluation.criteria.map(criterion => ({
      name: criterion.name,
      score: criterion.score,
      weight: criterion.weight
    }));

    // Only send the fields that can be updated
    const updateInput = {
      score: this.editingEvaluation.score,
      comments: this.editingEvaluation.comments,
      criteria: cleanedCriteria
    };

    console.log('[EvaluationsComponent] Sending update with input:', updateInput);

    this.evaluationService.updateEvaluation(this.editingEvaluation.id, updateInput).subscribe({
      next: (updatedEvaluation) => {
        console.log('[EvaluationsComponent] Successfully updated evaluation:', updatedEvaluation);
        // Update the evaluation in the list while preserving references
        const index = this.evaluations.findIndex(e => e.id === updatedEvaluation.id);
        if (index !== -1) {
          this.evaluations[index] = {
            ...this.evaluations[index],
            ...updatedEvaluation
          };
          console.log('[EvaluationsComponent] Updated evaluation in list at index:', index);
        }
        this.loading = false;
        this.closeEditModal();
      },
      error: (error) => {
        console.error('[EvaluationsComponent] Error updating evaluation:', error);
        this.error = 'Impossible de mettre à jour l\'évaluation. Veuillez réessayer.';
        this.loading = false;
      }
    });
  }

  deleteEvaluation(evaluation: Evaluation) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette évaluation ?')) {
      this.evaluationService.deleteEvaluation(evaluation.id).subscribe({
        next: () => {
          this.evaluations = this.evaluations.filter(e => e.id !== evaluation.id);
        },
        error: (error) => {
          console.error('Error deleting evaluation:', error);
          alert('Impossible de supprimer l\'évaluation.');
        }
      });
    }
  }

  getScoreBadgeClass(score: number): string {
    if (score >= 16) return 'bg-green-50 text-green-700';
    if (score >= 12) return 'bg-blue-50 text-blue-700';
    if (score >= 8) return 'bg-yellow-50 text-yellow-700';
    return 'bg-red-50 text-red-700';
  }

  getScoreLabelClass(score: number): string {
    if (score >= 16) return 'text-green-600 bg-green-50';
    if (score >= 12) return 'text-blue-600 bg-blue-50';
    if (score >= 8) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  }

  getScoreLabel(score: number): string {
    if (score >= 16) return 'Excellent';
    if (score >= 12) return 'Bien';
    if (score >= 8) return 'Moyen';
    return 'Insuffisant';
  }

  getCriterionScoreClass(score: number): string {
    if (score >= 16) return 'text-green-600';
    if (score >= 12) return 'text-blue-600';
    if (score >= 8) return 'text-yellow-600';
    return 'text-red-600';
  }

  getProgressBarClass(score: number): string {
    if (score >= 16) return 'bg-green-500';
    if (score >= 12) return 'bg-blue-500';
    if (score >= 8) return 'bg-yellow-500';
    return 'bg-red-500';
  }
}
