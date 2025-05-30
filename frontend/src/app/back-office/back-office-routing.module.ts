import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BackOfficeDashboardComponent } from './dashboard/dashboard.component';
import { ProjetManagementComponent } from './projet-management/projet-management.component';
import { LivrableManagementComponent } from './livrable-management/livrable-management.component';

const routes: Routes = [
  { path: '', component: BackOfficeDashboardComponent },
  { path: 'projets', component: ProjetManagementComponent },
  { path: 'livrables', component: LivrableManagementComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BackOfficeRoutingModule {}
