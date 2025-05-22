import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FrontOfficeRoutingModule } from './front-office-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProjetListComponent } from './projet-list/projet-list.component';
import { LivrableListComponent } from './livrable-list/livrable-list.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FrontOfficeRoutingModule,
    DashboardComponent, // standalone components
    ProjetListComponent,
    LivrableListComponent
  ]
})
export class FrontOfficeModule {}
