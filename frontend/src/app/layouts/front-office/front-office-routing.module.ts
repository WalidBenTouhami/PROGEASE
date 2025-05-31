import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FrontOfficeTemplateComponent } from './front-office-template.component';
import { ProjetListComponent } from './projet-list/projet-list.component';
import { LivrableListComponent } from './livrable-list/livrable-list.component';

const routes: Routes = [
  {
    path: '',
    component: FrontOfficeTemplateComponent,
    children: [
      {
        path: '',
        redirectTo: 'projets',
        pathMatch: 'full'
      },
      {
        path: 'projets',
        component: ProjetListComponent,
        data: { breadcrumb: 'Projets' }
      },
      {
        path: 'livrables',
        component: LivrableListComponent,
        data: { breadcrumb: 'Livrables' }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FrontOfficeRoutingModule { } 