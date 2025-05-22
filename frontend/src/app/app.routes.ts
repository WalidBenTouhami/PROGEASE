import { Routes } from '@angular/router';
import { ApiTestComponent } from './core/api-test/api-test.component';

export const routes: Routes = [
  { path: 'back-office', loadChildren: () => import('./back-office/back-office.module').then(m => m.BackOfficeModule) },
  { path: 'front-office', loadChildren: () => import('./front-office/front-office.module').then(m => m.FrontOfficeModule) },
  { path: 'deliverable', loadChildren: () => import('./livrable/livrable.module').then(m => m.LivrableModule) },
  { path: 'project', loadChildren: () => import('./project/projet.module').then(m => m.ProjetModule) },
  { path: '', redirectTo: 'front-office', pathMatch: 'full' },
  { path: '**', redirectTo: 'front-office' },
  // Route de test
  { path: 'test-api', component: ApiTestComponent },
];
