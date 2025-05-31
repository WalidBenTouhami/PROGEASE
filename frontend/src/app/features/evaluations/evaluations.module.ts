import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { EvaluationsComponent } from './evaluations.component';
import { EvaluationDetailComponent } from './evaluation-detail/evaluation-detail.component';
import { EvaluationFormComponent } from './evaluation-form/evaluation-form.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { EvaluationListComponent } from './evaluation-list/evaluation-list.component';

const routes: Routes = [
  {
    path: '',
    component: EvaluationsComponent,
    data: { breadcrumb: 'Évaluations' }
  },
  {
    path: ':id',
    component: EvaluationDetailComponent,
    data: { breadcrumb: 'Détail de l\'évaluation' }
  },
  {
    path: ':id/edit',
    component: EvaluationFormComponent,
    data: { breadcrumb: 'Modifier l\'évaluation' }
  }
];

@NgModule({
  declarations: [
    EvaluationListComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    EvaluationsComponent,
    EvaluationDetailComponent,
    EvaluationFormComponent,
    MatCardModule,
    MatProgressSpinnerModule
  ],
  exports: [
    EvaluationListComponent
  ]
})
export class EvaluationsModule { } 