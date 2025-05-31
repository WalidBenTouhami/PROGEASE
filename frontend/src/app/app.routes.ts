import { Routes } from '@angular/router';
import { ApiTestComponent } from './core/api-test/api-test.component';
import { ApiTesterComponent } from './core/components/api-tester/api-tester.component';

export const routes: Routes = [
  {
    path: 'back-office',
    loadChildren: () => import('./layouts/back-office/back-office.module').then(m => m.BackOfficeModule)
  },
  {
    path: 'front-office',
    loadChildren: () => import('./layouts/front-office/front-office.module').then(m => m.FrontOfficeModule)
  },
  {
    path: 'livrables',
    loadChildren: () => import('./features/livrable/livrable.module').then(m => m.LivrableModule)
  },
  {
    path: 'projets',
    loadChildren: () => import('./features/projet/projet.module').then(m => m.ProjetModule)
  },
  {
    path: 'evaluations',
    loadChildren: () => import('./features/evaluations/evaluations.module').then(m => m.EvaluationsModule)
  },
  {
    path: 'test-api',
    component: ApiTestComponent
  },
  {
    path: '',
    redirectTo: 'front-office',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'front-office'
  },
  {
    path: 'api-test',
    component: ApiTesterComponent
  },
];
