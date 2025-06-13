import { Routes } from '@angular/router';

export const TUTEUR_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('../../layouts/tutor-layout/tutor-layout.component').then(m => m.TutorLayoutComponent),
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
        path: 'etudiants',
        children: [
          {
            path: '',
            loadComponent: () => import('./etudiants/etudiants.component').then(m => m.EtudiantsComponent)
          },
          {
            path: 'nouveau',
            loadComponent: () => import('./etudiants/etudiant-form/etudiant-form.component').then(m => m.EtudiantFormComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./etudiants/etudiant-detail/etudiant-detail.component').then(m => m.EtudiantDetailComponent)
          },
          {
            path: ':id/modifier',
            loadComponent: () => import('./etudiants/etudiant-form/etudiant-form.component').then(m => m.EtudiantFormComponent)
          }
        ]
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
        path: 'rapports',
        loadComponent: () => import('./rapports/rapports.component').then(m => m.RapportsComponent)
      },
      {
        path: 'profil',
        loadComponent: () => import('./profil/profil.component').then(m => m.ProfilComponent)
      }
    ]
  }
]; 