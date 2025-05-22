import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjetRoutingModule } from './projet-routing.module';
import { ProjetListComponent } from './projet-list/projet-list.component';

@NgModule({
  imports: [
    CommonModule,
    ProjetRoutingModule,
    ProjetListComponent
  ]
})
export class ProjetModule {}
