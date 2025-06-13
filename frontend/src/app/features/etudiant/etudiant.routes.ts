import { Routes } from '@angular/router';

export const ETUDIANT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('../../layouts/student-layout/student-layout.component').then(m => m.StudentLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'tableau-de-bord',
        pathMatch: 'full'
      },
      {
        path: 'tableau-de-bord',
        loadComponent: () => import('./tableau-de-bord/tableau-de-bord.component').then(m => m.TableauDeBordComponent)
      },
      {
        path: 'projets',
        children: [
          {
            path: '',
            loadComponent: () => import('./projets/projets.component').then(m => m.ProjetsComponent)
          },
          {
            path: 'nouveau',
            loadComponent: () => import('./projets/projet-form/projet-form.component').then(m => m.ProjetFormComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./projets/projet-detail/projet-detail.component').then(m => m.ProjetDetailComponent)
          },
          {
            path: ':id/modifier',
            loadComponent: () => import('./projets/projet-form/projet-form.component').then(m => m.ProjetFormComponent)
          }
        ]
      },
      {
        path: 'ressources',
        loadComponent: () => import('./ressources/ressources.component').then(m => m.RessourcesComponent)
      },
      {
        path: 'messages',
        loadComponent: () => import('./messages/messages.component').then(m => m.MessagesComponent)
      },
      {
        path: 'profil',
        loadComponent: () => import('./profil/profil.component').then(m => m.ProfilComponent)
      }
    ]
  }
]; 