import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BackOfficeRoutingModule } from './back-office-routing.module';
import { ProjectManagementComponent } from './project-management/project-management.component';
import { DeliverableManagementComponent } from './deliverable-management/deliverable-management.component';
import { DashboardComponent } from './dashboard/dashboard.component';

@NgModule({
  declarations: [
    ProjectManagementComponent,
    DeliverableManagementComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BackOfficeRoutingModule,
    DashboardComponent // standalone component
  ]
})
export class BackOfficeModule {}
