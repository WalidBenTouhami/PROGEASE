import { Routes } from '@angular/router';
import { ApiTestComponent } from './core/api-test/api-test.component';
import { ApiTesterComponent } from './core/components/api-tester/api-tester.component';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { AdminGuard } from './core/guards/admin.guard';

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
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule),
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'profile',
    loadChildren: () => import('./features/profile/profile.module').then(m => m.ProfileModule),
    canActivate: [AuthGuard]
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
    path: '**',
    redirectTo: 'dashboard'
  },
  {
    path: 'api-test',
    component: ApiTesterComponent
  },
];
