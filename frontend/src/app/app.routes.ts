import { Routes } from '@angular/router';
import { ApiTestComponent } from './core/api-test/api-test.component';
import { ApiTesterComponent } from './core/components/api-tester/api-tester.component';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

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
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'etudiant',
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'ETUDIANT' },
    loadChildren: () => import('./features/etudiant/etudiant.routes').then(m => m.ETUDIANT_ROUTES)
  },
  {
    path: 'tuteur',
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'TUTEUR' },
    loadChildren: () => import('./features/tuteur/tuteur.routes').then(m => m.TUTEUR_ROUTES)
  },
  {
    path: 'admin',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] },
    loadComponent: () => import('./layouts/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'tableau-de-bord',
        pathMatch: 'full'
      },
      {
        path: 'tableau-de-bord',
        loadComponent: () => import('./features/admin/tableau-de-bord/tableau-de-bord.component').then(m => m.TableauDeBordComponent)
      },
      {
        path: 'utilisateurs',
        loadComponent: () => import('./features/admin/utilisateurs/utilisateurs.component').then(m => m.UtilisateursComponent)
      },
      {
        path: 'projets',
        loadComponent: () => import('./features/admin/projets/projets.component').then(m => m.ProjetsComponent)
      },
      {
        path: 'parametres',
        loadComponent: () => import('./features/admin/parametres/parametres.component').then(m => m.ParametresComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'auth/login'
  },
  {
    path: 'api-test',
    component: ApiTesterComponent
  },
];
