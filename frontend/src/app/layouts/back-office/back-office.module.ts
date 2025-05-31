import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BackOfficeRoutingModule } from './back-office-routing.module';
import { BackOfficeTemplateComponent } from './back-office-template.component';

@NgModule({
  imports: [
    CommonModule,
    BackOfficeRoutingModule,
    BackOfficeTemplateComponent
  ]
})
export class BackOfficeModule { }
