import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    PageHeaderComponent,
    LoadingSpinnerComponent
  ],
  template: `
    <div class="dashboard-container">
      <mat-sidenav-container>
        <mat-sidenav #sidenav mode="side" opened>
          <mat-nav-list>
            <a mat-list-item routerLink="/dashboard" routerLinkActive="active">
              <mat-icon>dashboard</mat-icon>
              <span>Dashboard</span>
            </a>
            <a mat-list-item routerLink="/dashboard/stats" routerLinkActive="active">
              <mat-icon>bar_chart</mat-icon>
              <span>Statistics</span>
            </a>
            <a mat-list-item routerLink="/dashboard/activity" routerLinkActive="active">
              <mat-icon>history</mat-icon>
              <span>Activity</span>
            </a>
          </mat-nav-list>
        </mat-sidenav>

        <mat-sidenav-content>
          <mat-toolbar>
            <button mat-icon-button (click)="sidenav.toggle()">
              <mat-icon>menu</mat-icon>
            </button>
            <span>Dashboard</span>
          </mat-toolbar>

          <div class="content">
            <router-outlet></router-outlet>
          </div>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styles: [`
    .dashboard-container {
      height: 100vh;
    }
    mat-sidenav-container {
      height: 100%;
    }
    mat-sidenav {
      width: 250px;
      background-color: #fafafa;
    }
    mat-nav-list {
      padding-top: 20px;
    }
    mat-nav-list a {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 20px;
    }
    mat-nav-list a.active {
      background-color: rgba(0, 0, 0, 0.04);
    }
    mat-toolbar {
      background-color: white;
      border-bottom: 1px solid #e0e0e0;
    }
    .content {
      padding: 20px;
    }
  `]
})
export class DashboardComponent {
  constructor() {}
} 