import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EvaluationsComponent } from './evaluations.component';
import { EvaluationEditComponent } from './evaluation-edit/evaluation-edit.component';

const routes: Routes = [
  {
    path: '',
    component: EvaluationsComponent
  },
  {
    path: ':id/edit',
    component: EvaluationEditComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EvaluationsRoutingModule { }

@NgModule({
  imports: [EvaluationsRoutingModule],
  declarations: []
})
export class EvaluationsModule { } 