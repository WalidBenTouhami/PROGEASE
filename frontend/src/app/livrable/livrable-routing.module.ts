import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LivrableListComponent } from './livrable-list/livrable-list.component';

const routes: Routes = [
  { path: '', component: LivrableListComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LivrableRoutingModule {}
