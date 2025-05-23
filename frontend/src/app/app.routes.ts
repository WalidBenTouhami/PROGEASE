import { Routes } from '@angular/router';
import { WelcomeComponent } from './front-office/welcome/welcome.component';
import { EvaluationsComponent } from './front-office/evaluations/evaluations.component';
import { EvaluationDetailComponent } from './features/evaluations/evaluation-detail/evaluation-detail.component';
import { EvaluationFormComponent } from './features/evaluations/evaluation-form/evaluation-form.component';

export const routes: Routes = [
  {
    path: '',
    component: WelcomeComponent
  },
  {
    path: 'projects',
    loadChildren: () => import('./project/project.module').then(m => m.ProjectModule)
  },
  {
    path: 'deliverables',
    loadChildren: () => import('./deliverable/deliverable.module').then(m => m.DeliverableModule)
  },
  {
    path: 'evaluations',
    component: EvaluationsComponent
  },
  {
    path: 'evaluations/new',
    component: EvaluationFormComponent
  },
  {
    path: 'evaluations/:id',
    component: EvaluationDetailComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
