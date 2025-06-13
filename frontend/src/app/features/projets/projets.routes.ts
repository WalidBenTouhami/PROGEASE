import { Routes } from '@angular/router';

export const PROJETS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./projets-list/projets-list.component').then(m => m.ProjetsListComponent)
  },
  {
    path: 'nouveau',
    loadComponent: () => import('./projet-form/projet-form.component').then(m => m.ProjetFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./projet-detail/projet-detail.component').then(m => m.ProjetDetailComponent)
  },
  {
    path: ':id/modifier',
    loadComponent: () => import('./projet-form/projet-form.component').then(m => m.ProjetFormComponent)
  }
]; 