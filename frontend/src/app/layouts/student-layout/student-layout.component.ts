import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { LoadingService } from '../../services/loading.service';
import { ErrorService } from '../../services/error.service';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-student-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatProgressBarModule,
    MatSnackBarModule
  ],
  template: `
    <div class="layout-container">
      <!-- Barre de chargement -->
      <mat-progress-bar
        *ngIf="isLoading$ | async"
        mode="indeterminate"
        class="loading-bar">
      </mat-progress-bar>

      <!-- Barre d'outils -->
      <mat-toolbar color="primary">
        <button mat-icon-button (click)="toggleSidenav()">
          <mat-icon>menu</mat-icon>
        </button>
        <span>ProgEase - Espace Étudiant</span>
        <span class="toolbar-spacer"></span>
        <button mat-icon-button [matMenuTriggerFor]="userMenu">
          <mat-icon>account_circle</mat-icon>
        </button>
        <mat-menu #userMenu="matMenu">
          <button mat-menu-item (click)="logout()">
            <mat-icon>exit_to_app</mat-icon>
            <span>Déconnexion</span>
          </button>
        </mat-menu>
      </mat-toolbar>

      <!-- Menu latéral -->
      <mat-sidenav-container>
        <mat-sidenav
          #sidenav
          mode="side"
          [opened]="true"
          class="sidenav">
          <mat-nav-list>
            <a mat-list-item routerLink="/etudiant/tableau-de-bord">
              <mat-icon>dashboard</mat-icon>
              <span>Tableau de bord</span>
            </a>
            <a mat-list-item routerLink="/etudiant/projets">
              <mat-icon>assignment</mat-icon>
              <span>Mes projets</span>
            </a>
            <a mat-list-item routerLink="/etudiant/ressources">
              <mat-icon>library_books</mat-icon>
              <span>Ressources</span>
            </a>
            <a mat-list-item routerLink="/etudiant/messages">
              <mat-icon>message</mat-icon>
              <span>Messages</span>
            </a>
            <a mat-list-item routerLink="/etudiant/profil">
              <mat-icon>person</mat-icon>
              <span>Mon profil</span>
            </a>
          </mat-nav-list>
        </mat-sidenav>

        <!-- Contenu principal -->
        <mat-sidenav-content>
          <div class="content">
            <router-outlet></router-outlet>
          </div>
        </mat-sidenav-content>
      </mat-sidenav-container>

      <!-- Messages d'erreur -->
      <div *ngIf="error$ | async as error" class="error-message">
        {{ error }}
      </div>
    </div>
  `,
  styles: [`
    .layout-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }

    .loading-bar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
    }

    .toolbar-spacer {
      flex: 1 1 auto;
    }

    .sidenav {
      width: 250px;
    }

    .content {
      padding: 20px;
      height: calc(100vh - 64px);
      overflow-y: auto;
    }

    .error-message {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background-color: #f44336;
      color: white;
      padding: 16px;
      border-radius: 4px;
      z-index: 1000;
    }

    mat-nav-list {
      a {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 12px 16px;
        
        mat-icon {
          margin-right: 8px;
        }
      }
    }
  `]
})
export class StudentLayoutComponent {
  isLoading$: Observable<boolean>;
  error$: Observable<string>;

  constructor(
    private loadingService: LoadingService,
    private errorService: ErrorService,
    private authService: AuthService
  ) {
    this.isLoading$ = this.loadingService.isLoading$;
    this.error$ = this.errorService.error$;
  }

  toggleSidenav(): void {
    // TODO: Implémenter la logique de basculement du menu latéral
  }

  logout(): void {
    this.authService.logout();
  }
} 