// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { ApiTestComponent } from '../app/test/api-test/api-test.component';

export const routes: Routes = [
  {
    path: 'back-office',
    loadChildren: () => import('./back-office/back-office.module').then(m => m.BackOfficeModule)
  },
  {
    path: 'front-office',
    loadChildren: () => import('./front-office/front-office.module').then(m => m.FrontOfficeModule)
  },
  {
    path: 'deliverable',
    loadChildren: () => import('./deliverable/deliverable.module').then(m => m.DeliverableModule)
  },
  {
    path: 'project',
    loadChildren: () => import('./project/project.module').then(m => m.ProjectModule)
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

  // Route de test
  {
    path: 'test-api',
    component: ApiTestComponent
  },
];
