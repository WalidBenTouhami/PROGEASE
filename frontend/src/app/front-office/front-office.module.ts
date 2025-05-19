import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FrontOfficeRoutingModule } from './front-office-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProjectListComponent } from './project-list/project-list.component';
import { DeliverableListComponent } from './deliverable-list/deliverable-list.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FrontOfficeRoutingModule,
    DashboardComponent, // standalone components
    ProjectListComponent,
    DeliverableListComponent
  ]
})
export class FrontOfficeModule {}
