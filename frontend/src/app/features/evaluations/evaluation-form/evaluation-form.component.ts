import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { gql } from 'apollo-angular';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';

interface CreateEvaluationResponse {
  createEvaluation: {
    id: string;
    score: number;
    comments: string;
    criteria: {
      name: string;
      score: number;
      weight: number;
    }[];
  }
}

interface GetProjectResponse {
  project: {
    id: string;
    title: string;
    description: string;
  }
}

const GET_PROJECT = gql`
  query GetProject($id: ID!) {
    project(id: $id) {
      id
      title
      description
    }
  }
`;

const CREATE_EVALUATION = gql`
  mutation CreateEvaluation($input: CreateEvaluationInput!) {
    createEvaluation(input: $input) {
      id
      score
      comments
      criteria {
        name
        score
        weight
      }
    }
  }
`;

@Component({
  selector: 'app-evaluation-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoaderComponent],
  template: `
    <div class="container mx-auto p-6">
      <app-loader *ngIf="loading"></app-loader>

      <div *ngIf="!loading" class="max-w-3xl mx-auto bg-white rounded-lg shadow">
        <!-- Header -->
        <div class="p-6 border-b border-gray-200">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 class="text-2xl font-bold text-gray-800">Nouvelle évaluation</h1>
              <div *ngIf="project" class="mt-2">
                <h2 class="text-lg font-medium text-blue-600">{{ project.title }}</h2>
                <p class="text-sm text-gray-600 mt-1">{{ project.description }}</p>
              </div>
            </div>
            <div class="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg px-6 py-4 text-center min-w-[160px]">
              <span class="block text-sm font-medium mb-1">Score global</span>
              <span class="text-3xl font-bold">{{ calculateGlobalScore() }}/20</span>
            </div>
          </div>
        </div>

        <form [formGroup]="evaluationForm" (ngSubmit)="onSubmit()">
          <!-- Critères section -->
          <div class="p-6 border-b border-gray-200">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-semibold text-gray-800">Critères d'évaluation</h2>
              <button type="button" (click)="addCriterion()"
                      class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors duration-200">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
                Ajouter un critère
              </button>
            </div>
            
            <div formArrayName="criteria" class="space-y-4">
              <div *ngFor="let criterion of criteriaControls; let i = index" [formGroupName]="i"
                   class="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-all duration-200">
                <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
                  <div class="md:col-span-6">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Critère</label>
                    <input type="text" formControlName="name"
                           class="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200">
                  </div>
                  
                  <div class="md:col-span-3">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Score (sur 20)</label>
                    <input type="number" formControlName="score" min="0" max="20" step="0.5"
                           class="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200">
                  </div>
                  
                  <div class="md:col-span-3">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Pondération (%)</label>
                    <input type="number" formControlName="weight" min="0" max="100" step="5"
                           class="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200">
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Comments section -->
          <div class="p-6 border-b border-gray-200">
            <label for="comments" class="block text-xl font-semibold text-gray-800 mb-4">Commentaires</label>
            <textarea id="comments" formControlName="comments" rows="4"
                     class="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                     placeholder="Ajoutez vos commentaires sur l'évaluation..."></textarea>
          </div>

          <!-- Actions -->
          <div class="p-6 bg-gray-50 rounded-b-lg flex justify-end space-x-4">
            <button type="button" (click)="cancel()"
                    class="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-all duration-200">
              Annuler
            </button>
            <button type="submit" [disabled]="!isFormValid()"
                    class="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow">
              Enregistrer l'évaluation
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      background-color: #f9fafb;
      min-height: 100vh;
    }
    .container {
      max-width: 1200px;
    }
    :host ::ng-deep input[type="number"] {
      -moz-appearance: textfield;
    }
    :host ::ng-deep input[type="number"]::-webkit-outer-spin-button,
    :host ::ng-deep input[type="number"]::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  `]
})
export class EvaluationFormComponent implements OnInit {
  evaluationForm: FormGroup;
  projectId: string | null = null;
  project: { id: string; title: string; description: string } | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private apollo: Apollo,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.evaluationForm = this.fb.group({
      criteria: this.fb.array([]),
      comments: [''],
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.projectId = params['projectId'];
      if (!this.projectId) {
        this.router.navigate(['/projects']);
        return;
      }
      this.loadProject();
      if (this.criteriaControls.length === 0) {
        this.addCriterion();
      }
    });
  }

  loadProject() {
    if (!this.projectId) return;
    
    this.loading = true;
    this.apollo.watchQuery<GetProjectResponse>({
      query: GET_PROJECT,
      variables: { id: this.projectId }
    }).valueChanges.subscribe({
      next: (result) => {
        this.project = result.data.project;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading project:', error);
        this.loading = false;
      }
    });
  }

  get criteriaControls() {
    return (this.evaluationForm.get('criteria') as FormArray).controls;
  }

  addCriterion() {
    const criteriaForm = this.fb.group({
      name: ['', Validators.required],
      score: [0, [Validators.required, Validators.min(0), Validators.max(20)]],
      weight: [0, [Validators.required, Validators.min(0), Validators.max(100)]]
    });

    (this.evaluationForm.get('criteria') as FormArray).push(criteriaForm);
  }

  calculateGlobalScore(): number {
    const criteria = this.evaluationForm.get('criteria')?.value || [];
    if (criteria.length === 0) return 0;

    let totalWeight = 0;
    let weightedScore = 0;

    criteria.forEach((criterion: any) => {
      const weight = criterion.weight / 100;
      totalWeight += weight;
      weightedScore += criterion.score * weight;
    });

    if (totalWeight === 0) return 0;
    return Math.round((weightedScore / totalWeight) * 100) / 100;
  }

  isFormValid(): boolean {
    if (!this.evaluationForm.valid) return false;
    
    const criteria = this.evaluationForm.get('criteria')?.value || [];
    if (criteria.length === 0) return false;

    const totalWeight = criteria.reduce((sum: number, criterion: any) => sum + (criterion.weight / 100), 0);
    return Math.abs(totalWeight - 1) < 0.01;
  }

  onSubmit() {
    if (!this.isFormValid() || !this.projectId) return;

    const formValue = this.evaluationForm.value;
    const input = {
      projectId: this.projectId,
      evaluatorId: "1", // TODO: Get from auth service
      score: this.calculateGlobalScore(),
      comments: formValue.comments,
      criteria: formValue.criteria.map((c: any) => ({
        ...c,
        weight: c.weight / 100
      }))
    };

    this.apollo.mutate<CreateEvaluationResponse>({
      mutation: CREATE_EVALUATION,
      variables: { input }
    }).subscribe({
      next: (result) => {
        if (result.data) {
          this.router.navigate(['/evaluations', result.data.createEvaluation.id]);
        }
      },
      error: (error) => {
        console.error('Error creating evaluation:', error);
      }
    });
  }

  cancel() {
    this.router.navigate(['/projects']);
  }
} 