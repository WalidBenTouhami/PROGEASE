import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BackOfficeRoutingModule } from './back-office-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProjectManagementComponent } from './project-management/project-management.component';
import { DeliverableManagementComponent } from './deliverable-management/deliverable-management.component';

@NgModule({
  declarations: [
    ProjectManagementComponent,
    DeliverableManagementComponent
  ],
  imports: [
    CommonModule,
    BackOfficeRoutingModule,
    DashboardComponent // standalone import
  ]
})
export class BackOfficeModule {}
