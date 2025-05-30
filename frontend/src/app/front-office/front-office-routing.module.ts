import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FrontOfficeDashboardComponent } from './dashboard/dashboard.component';
import { ProjetListComponent } from './projet-list/projet-list.component';
import { LivrableListComponent } from './livrable-list/livrable-list.component';

const routes: Routes = [
  { path: '', component: FrontOfficeDashboardComponent },
  { path: 'projets', component: ProjetListComponent },
  { path: 'livrables', component: LivrableListComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FrontOfficeRoutingModule {}
