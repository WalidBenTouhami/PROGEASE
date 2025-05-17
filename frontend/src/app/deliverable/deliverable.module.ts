import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeliverableRoutingModule } from './deliverable-routing.module';
import { DeliverableListComponent } from './deliverable-list/deliverable-list.component';

@NgModule({
  imports: [
    CommonModule,
    DeliverableRoutingModule,
    // DeliverableListComponent est standalone :
    DeliverableListComponent
  ]
})
export class DeliverableModule {}
