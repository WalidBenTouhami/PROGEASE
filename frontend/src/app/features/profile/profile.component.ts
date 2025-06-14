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
  selector: 'app-profile',
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
    <div class="profile-container">
      <mat-sidenav-container>
        <mat-sidenav #sidenav mode="side" opened>
          <mat-nav-list>
            <a mat-list-item routerLink="/profile" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
              <mat-icon>person</mat-icon>
              <span>Profile Settings</span>
            </a>
            <a mat-list-item routerLink="/profile/security" routerLinkActive="active">
              <mat-icon>security</mat-icon>
              <span>Security</span>
            </a>
            <a mat-list-item routerLink="/profile/notifications" routerLinkActive="active">
              <mat-icon>notifications</mat-icon>
              <span>Notifications</span>
            </a>
          </mat-nav-list>
        </mat-sidenav>

        <mat-sidenav-content>
          <mat-toolbar>
            <button mat-icon-button (click)="sidenav.toggle()">
              <mat-icon>menu</mat-icon>
            </button>
            <span>Profile</span>
          </mat-toolbar>

          <div class="content">
            <router-outlet></router-outlet>
          </div>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styles: [`
    .profile-container {
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
export class ProfileComponent {
  constructor() {}
} 