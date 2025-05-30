import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BackOfficeTemplateComponent } from './back-office-template.component';
import { BackOfficeDashboardComponent } from './dashboard/dashboard.component';
import { LivrableManagementComponent } from './livrable-management/livrable-management.component';

const routes: Routes = [
  {
    path: '',
    component: BackOfficeTemplateComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: BackOfficeDashboardComponent },
      { path: 'livrables', component: LivrableManagementComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BackOfficeRoutingModule { }
