import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';

import { BackOfficeRoutingModule } from './back-office-routing.module';
import { BackOfficeDashboardComponent } from './dashboard/dashboard.component';
import { ProjetManagementComponent } from './projet-management/projet-management.component';
import { LivrableManagementComponent } from './livrable-management/livrable-management.component';
import { BackOfficeTemplateComponent } from './back-office-template.component';
import { BreadcrumbComponent } from '../shared/components/breadcrumb/breadcrumb.component';

@NgModule({
  declarations: [
    BackOfficeTemplateComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSidenavModule,
    MatListModule,
    MatMenuModule,
    BreadcrumbComponent,
    BackOfficeRoutingModule,
    BackOfficeDashboardComponent,
    ProjetManagementComponent,
    LivrableManagementComponent
  ]
})
export class BackOfficeModule {}
