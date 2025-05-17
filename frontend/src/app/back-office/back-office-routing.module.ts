import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProjectManagementComponent } from './project-management/project-management.component';
import { DeliverableManagementComponent } from './deliverable-management/deliverable-management.component';

const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'projects', component: ProjectManagementComponent },
  { path: 'deliverables', component: DeliverableManagementComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BackOfficeRoutingModule {}
