import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProjetListComponent } from './projet-list/projet-list.component';
import { LivrableListComponent } from './livrable-list/livrable-list.component';
import { FormationListComponent } from './formation/formation-list/formation-list.component';
import { QuizComponent } from './quiz/quiz/quiz.component';
import { QuizListComponent } from './quiz/quiz-list/quiz-list.component';
import { FormationDetailsComponent } from '../back-office/formation/formation-details/formation-details.component';

const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'projects', component: ProjetListComponent },
  { path: 'formations', component: FormationListComponent},
  { path: 'quizzes', component: QuizListComponent},
  { path: 'deliverables', component: LivrableListComponent },
  { path: 'quiz/:id', component: QuizComponent },
  { path: 'formations/:id', component: FormationDetailsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FrontOfficeRoutingModule {}
