//src//app/project/project.module.ts

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectRoutingModule } from './project-routing.module';
import { ProjectListComponent } from './project-list/project-list.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ProjectRoutingModule,
    ProjectListComponent
  ]
})
export class ProjectModule { }
