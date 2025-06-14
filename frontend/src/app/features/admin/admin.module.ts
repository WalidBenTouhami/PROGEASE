import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { UserManagementComponent } from './user-management/user-management.component';
import { StatisticsDashboardComponent } from './statistics-dashboard/statistics-dashboard.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: 'users', component: UserManagementComponent },
      { path: 'statistics', component: StatisticsDashboardComponent },
      { path: '', redirectTo: 'users', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  declarations: [
    UserManagementComponent,
    StatisticsDashboardComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatProgressBarModule
  ]
})
export class AdminModule { } 