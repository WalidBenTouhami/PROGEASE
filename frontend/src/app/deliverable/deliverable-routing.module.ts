import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DeliverableListComponent } from './deliverable-list/deliverable-list.component';

const routes: Routes = [
  { path: '', component: DeliverableListComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DeliverableRoutingModule {}
