//src/app/front-office/front-office.routing.module.ts

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FrontOfficeComponent } from './front-office.component';

const routes: Routes = [
  {
    path: '',
    component: FrontOfficeComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./welcome/welcome.module').then(m => m.WelcomeModule)
      },
      {
        path: 'projects',
        loadChildren: () => import('../project/project.module').then(m => m.ProjectModule)
      },
      {
        path: 'evaluations',
        loadChildren: () => import('./evaluations/evaluations.module').then(m => m.EvaluationsModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FrontOfficeRoutingModule { }
