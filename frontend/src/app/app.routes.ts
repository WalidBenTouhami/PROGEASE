import { Routes } from '@angular/router';
import { ApiTestComponent } from './core/api-test/api-test.component';
import { LoginComponent } from './front-office/user/login/login.component';
import { AuthGuard } from './core/guards/auth.guard';
import { LoginGuard } from './core/guards/login.guard';
import { SignupComponent } from './front-office/user/signup/signup.component';
import { UnauthorizedComponent } from './front-office/user/unauthorized/unauthorized.component';
import { RoleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {path: 'login',     canActivate: [LoginGuard],
  loadComponent: () => import('./front-office/user/login/login.component').then(m => m.LoginComponent)
  },
     {
    path: 'unauthorized',
    component: UnauthorizedComponent
  },
{
  path: 'signup',
  loadComponent: () => import('./front-office/user/signup/signup.component').then(m => m.SignupComponent)
},
{
  path: 'back-office',
  loadChildren: () =>
    import('./back-office/back-office.module').then(m => m.BackOfficeModule),
  canActivate: [RoleGuard],
  data: { roles: ['admin','tutor'] }
},

  { path: 'front-office', loadChildren: () => import('./front-office/front-office.module').then(m => m.FrontOfficeModule) },
  { path: 'deliverable', loadChildren: () => import('./livrable/livrable.module').then(m => m.LivrableModule) },
  { path: 'project', loadChildren: () => import('./projet/projet.module').then(m => m.ProjetModule) },
  { path: '', redirectTo: 'front-office', pathMatch: 'full' },
  { path: '**', redirectTo: 'front-office' },
  // Route de test
  { path: 'test-api', component: ApiTestComponent },
];
