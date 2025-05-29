import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProjetManagementComponent } from './projet-management/projet-management.component';
import { LivrableManagementComponent } from './livrable-management/livrable-management.component';
import { UserManagementComponent } from './user/user-management/user-management.component';
import { AdminDashboardLayoutComponent } from './admin-dashboard-layout/admin-dashboard-layout.component';
import { UserDetailsComponent } from './user/user-details/user-details.component';
import { UserEditComponent } from './user/user-edit/user-edit.component';
import { RoleGuard } from '../core/guards/role.guard';
import { QuizManagementComponent } from './quiz/quiz-management/quiz-management.component';
import { QuizDetailsComponent } from './quiz/quiz-details/quiz-details.component';
import { CreateQuizComponent } from './quiz/create-quiz/create-quiz.component';
import { FormationManagementComponent } from './formation/formation-management/formation-management.component';
import { FormationDetailsComponent } from './formation/formation-details/formation-details.component';
import { CreateFormationComponent } from './formation/create-formation/create-formation.component';

const routes: Routes = [
  {
    path: '',
    component: AdminDashboardLayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'projets', component: ProjetManagementComponent },
      { path: 'livrables', component: LivrableManagementComponent },

      { path: 'quiz/create', component: CreateQuizComponent },
      { path: 'quiz', component: QuizManagementComponent }, 
      { path: 'quiz/:id', component: QuizDetailsComponent },
      { path: 'quiz/:id/edit', component: CreateQuizComponent, canActivate: [RoleGuard], data: { roles: ['tutor','admin'] } },

      { path: 'formation/create', component: CreateFormationComponent },
      { path: 'formations', component: FormationManagementComponent }, 
      { path: 'formation/:id', component: FormationDetailsComponent },
      { path: 'formation/:id/edit', component: CreateQuizComponent, canActivate: [RoleGuard], data: { roles: ['tutor','admin'] } },

      { path: 'utilisateurs', component: UserManagementComponent },
      { path: 'utilisateurs/:id', component: UserDetailsComponent },
      { path: 'utilisateurs/:id/edit', component: UserEditComponent, canActivate: [RoleGuard], data: { roles: ['admin'] } },

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BackOfficeRoutingModule {}
