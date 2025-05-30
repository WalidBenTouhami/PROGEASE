import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSidenavModule } from '@angular/material/sidenav';

import { FrontOfficeRoutingModule } from './front-office-routing.module';
import { FrontOfficeDashboardComponent } from './dashboard/dashboard.component';
import { ProjetListComponent } from './projet-list/projet-list.component';
import { LivrableListComponent } from './livrable-list/livrable-list.component';
import { FrontOfficeTemplateComponent } from './front-office-template.component';
import { BreadcrumbComponent } from '../shared/components/breadcrumb/breadcrumb.component';

@NgModule({
  declarations: [
    FrontOfficeTemplateComponent
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
    BreadcrumbComponent,
    FrontOfficeRoutingModule,
    FrontOfficeDashboardComponent,
    ProjetListComponent,
    LivrableListComponent
  ]
})
export class FrontOfficeModule {}
