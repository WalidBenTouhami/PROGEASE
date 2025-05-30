import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BackOfficeRoutingModule } from './back-office-routing.module';
import { ProjetManagementComponent } from './projet-management/projet-management.component';
import { LivrableManagementComponent } from './livrable-management/livrable-management.component';
import { BackOfficeDashboardComponent } from './dashboard/dashboard.component';


@NgModule({
  declarations: [
    
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BackOfficeRoutingModule,
    BackOfficeDashboardComponent, // standalone component
    ProjetManagementComponent, // standalone component
    LivrableManagementComponent // standalone component
  ]
})
export class BackOfficeModule {}
