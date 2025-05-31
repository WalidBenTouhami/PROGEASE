import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { EvaluationService } from '../../../core/services/evaluation.service';
import { ApiResponse } from '../../../core/models/api.model';
import { Evaluation } from '../../../core/models/evaluation.model';

@Component({
  selector: 'app-evaluation-list',
  templateUrl: './evaluation-list.component.html',
  styleUrls: ['./evaluation-list.component.scss']
})
export class EvaluationListComponent implements OnInit {
  evaluations$: Observable<ApiResponse<Evaluation[]>>;
  loading = false;
  error: string | null = null;

  constructor(private evaluationService: EvaluationService) {
    this.evaluations$ = this.evaluationService.getEvaluations();
  }

  ngOnInit(): void {
    this.loadEvaluations();
  }

  loadEvaluations(filters?: { projetId?: string; evaluateurId?: string }): void {
    this.loading = true;
    this.error = null;
    this.evaluations$ = this.evaluationService.getEvaluations(filters);
  }

  deleteEvaluation(id: string): void {
    if (!id) return;
    
    this.loading = true;
    this.evaluationService.deleteEvaluation(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadEvaluations();
        } else {
          this.error = response.error || 'Une erreur est survenue lors de la suppression';
        }
      },
      error: (err) => {
        this.error = 'Une erreur est survenue lors de la suppression';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  filterByProjet(projetId: string): void {
    this.loadEvaluations({ projetId });
  }

  filterByEvaluateur(evaluateurId: string): void {
    this.loadEvaluations({ evaluateurId });
  }

  sortByNote(): void {
    // Implementation will be added
  }

  sortByDate(): void {
    // Implementation will be added
  }
} 