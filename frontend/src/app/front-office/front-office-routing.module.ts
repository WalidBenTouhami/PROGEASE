import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProjetListComponent } from './projet-list/projet-list.component';
import { LivrableListComponent } from './livrable-list/livrable-list.component';

const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'projects', component: ProjetListComponent },
  { path: 'deliverables', component: LivrableListComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FrontOfficeRoutingModule {}
