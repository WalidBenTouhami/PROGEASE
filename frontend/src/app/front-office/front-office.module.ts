import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FrontOfficeRoutingModule } from './front-office-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProjectListComponent } from './project-list/project-list.component';
import { DeliverableListComponent } from './deliverable-list/deliverable-list.component';

@NgModule({
  imports: [
    CommonModule,
    FrontOfficeRoutingModule,
    DashboardComponent, // standalone
    ProjectListComponent, // standalone
    DeliverableListComponent // standalone
  ]
})
export class FrontOfficeModule {}
