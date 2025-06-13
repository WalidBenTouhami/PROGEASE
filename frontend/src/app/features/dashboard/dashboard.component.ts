import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatGridListModule
  ],
  template: `
    <div class="dashboard-container">
      <h1>Tableau de bord</h1>
      
      <mat-grid-list cols="2" rowHeight="200px" gutterSize="16px">
        <mat-grid-tile>
          <mat-card class="dashboard-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>folder</mat-icon>
              <mat-card-title>Projets</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p>Gérez vos projets et suivez leur progression</p>
            </mat-card-content>
            <mat-card-actions>
              <button mat-button color="primary" routerLink="/projets">
                Voir les projets
              </button>
            </mat-card-actions>
          </mat-card>
        </mat-grid-tile>

        <mat-grid-tile>
          <mat-card class="dashboard-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>people</mat-icon>
              <mat-card-title>Utilisateurs</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p>Gérez les utilisateurs et leurs permissions</p>
            </mat-card-content>
            <mat-card-actions>
              <button mat-button color="primary" routerLink="/utilisateurs">
                Voir les utilisateurs
              </button>
            </mat-card-actions>
          </mat-card>
        </mat-grid-tile>

        <mat-grid-tile>
          <mat-card class="dashboard-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>settings</mat-icon>
              <mat-card-title>Paramètres</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p>Configurez les paramètres de l'application</p>
            </mat-card-content>
            <mat-card-actions>
              <button mat-button color="primary" routerLink="/parametres">
                Voir les paramètres
              </button>
            </mat-card-actions>
          </mat-card>
        </mat-grid-tile>

        <mat-grid-tile>
          <mat-card class="dashboard-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>person</mat-icon>
              <mat-card-title>Profil</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p>Gérez votre profil et vos préférences</p>
            </mat-card-content>
            <mat-card-actions>
              <button mat-button color="primary" (click)="logout()">
                Se déconnecter
              </button>
            </mat-card-actions>
          </mat-card>
        </mat-grid-tile>
      </mat-grid-list>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 2rem;
    }

    h1 {
      margin-bottom: 2rem;
      color: #333;
    }

    .dashboard-card {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    mat-card-header {
      margin-bottom: 1rem;
    }

    mat-card-content {
      flex-grow: 1;
    }

    mat-card-actions {
      padding: 8px;
      display: flex;
      justify-content: flex-end;
    }

    p {
      color: #666;
      margin: 0;
    }
  `]
})
export class DashboardComponent implements OnInit {
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Initialisation du tableau de bord
  }

  logout(): void {
    this.authService.logout();
  }
} 