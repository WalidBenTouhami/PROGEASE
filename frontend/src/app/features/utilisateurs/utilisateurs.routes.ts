import { Routes } from '@angular/router';

export const UTILISATEURS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./utilisateurs-list/utilisateurs-list.component').then(m => m.UtilisateursListComponent)
  },
  {
    path: 'nouveau',
    loadComponent: () => import('./utilisateur-form/utilisateur-form.component').then(m => m.UtilisateurFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./utilisateur-detail/utilisateur-detail.component').then(m => m.UtilisateurDetailComponent)
  },
  {
    path: ':id/modifier',
    loadComponent: () => import('./utilisateur-form/utilisateur-form.component').then(m => m.UtilisateurFormComponent)
  }
]; 