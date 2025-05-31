import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterModule, Routes } from '@angular/router';
import { FrontOfficeTemplateComponent } from './front-office-template.component';

const routes: Routes = [
  {
    path: '',
    component: FrontOfficeTemplateComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./dashboard/dashboard.component').then(m => m.FrontOfficeDashboardComponent),
        data: { breadcrumb: 'Tableau de bord' }
      },
      {
        path: 'projets',
        loadComponent: () => import('./projet-list/projet-list.component').then(m => m.ProjetListComponent),
        data: { breadcrumb: 'Projets' }
      },
      {
        path: 'livrables',
        loadComponent: () => import('./livrable-list/livrable-list.component').then(m => m.LivrableListComponent),
        data: { breadcrumb: 'Livrables' }
      },
      {
        path: 'evaluations',
        loadChildren: () => import('../../features/evaluations/evaluations.module').then(m => m.EvaluationsModule),
        data: { breadcrumb: 'Évaluations' }
      }
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSidenavModule,
    RouterModule.forChild(routes),
    FrontOfficeTemplateComponent
  ],
  declarations: []
})
export class FrontOfficeModule {}
