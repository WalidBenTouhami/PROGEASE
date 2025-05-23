import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'projects',
    loadChildren: () => import('./project/project.module').then(m => m.ProjectModule)
  },
  {
    path: 'deliverables',
    loadChildren: () => import('./deliverable/deliverable.module').then(m => m.DeliverableModule)
  },
  {
    path: 'evaluations',
    loadChildren: () => import('./front-office/evaluations/evaluations.module').then(m => m.EvaluationsModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('./front-office/profile/profile.module').then(m => m.ProfileModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./front-office/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: '',
    loadChildren: () => import('./front-office/welcome/welcome.module').then(m => m.WelcomeModule)
  },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
