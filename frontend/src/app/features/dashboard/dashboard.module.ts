import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      { path: '', component: DashboardHomeComponent }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    DashboardComponent
  ]
})
export class DashboardModule { } 